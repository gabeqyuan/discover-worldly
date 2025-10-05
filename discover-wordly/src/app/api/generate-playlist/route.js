import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req) {
  console.log('[GENERATE-PLAYLIST] API called');
  
  try {
    const { likedSongs, dislikedSongs, countryCode, userToken } = await req.json();
    console.log('[GENERATE-PLAYLIST] Request data:', {
      likedSongsCount: likedSongs?.length || 0,
      dislikedSongsCount: dislikedSongs?.length || 0,
      countryCode,
      hasUserToken: !!userToken
    });

    if (!likedSongs || likedSongs.length === 0) {
      console.log('[GENERATE-PLAYLIST] Error: No liked songs provided');
      return NextResponse.json(
        { error: "No liked songs provided" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.log('[GENERATE-PLAYLIST] Error: Missing GEMINI_API_KEY');
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY" },
        { status: 500 }
      );
    }

    console.log('[GENERATE-PLAYLIST] Initializing Gemini AI...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    console.log('[GENERATE-PLAYLIST] Initializing Gemini 2.5 Flash model...');
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Format songs for better analysis
    const likedSongsList = likedSongs.map(song => `"${song.title}" by ${song.artist}`).join('\n');
    const dislikedSongsList = dislikedSongs && dislikedSongs.length > 0 ? dislikedSongs.map(song => `"${song.title}" by ${song.artist}`).join('\n') : 'None';

    console.log('[GENERATE-PLAYLIST] Formatted songs:', {
      likedSongs: likedSongsList.substring(0, 200) + '...',
      dislikedSongs: dislikedSongsList.substring(0, 100) + '...'
    });

    const prompt = `Based on the user's music preferences, generate a curated playlist of 15 songs.

LIKED SONGS:
${likedSongsList}

DISLIKED SONGS:
${dislikedSongsList}

REQUIREMENTS:
1. Analyze the musical patterns, genres, moods, and styles from the liked songs
2. Generate 15 new song recommendations that match these preferences
3. Include 3-5 of the original liked songs in the final playlist
4. Avoid songs similar to the disliked ones
5. Focus on songs from the same country/region when possible
6. Ensure variety while maintaining the preferred style

RESPONSE FORMAT:
Return ONLY a valid JSON array of objects with this exact structure:
[
  {
    "title": "Song Title",
    "artist": "Artist Name",
    "reason": "Brief reason why this matches user's taste"
  }
]

Do not include any other text, explanations, or formatting outside the JSON array.`;

    console.log('[GENERATE-PLAYLIST] Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('[GENERATE-PLAYLIST] Gemini response received:', {
      textLength: text.length,
      textPreview: text.substring(0, 200) + '...'
    });
    
    // Parse the JSON response
    let recommendations;
    try {
      // Clean the response text in case there are markdown code blocks
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      console.log('[GENERATE-PLAYLIST] Cleaned response:', cleanText.substring(0, 300) + '...');
      
      recommendations = JSON.parse(cleanText);
      console.log('[GENERATE-PLAYLIST] Successfully parsed recommendations:', recommendations.length, 'songs');
      
      // Validate the structure
      if (!Array.isArray(recommendations)) {
        throw new Error('Response is not an array');
      }
      
      // Ensure each recommendation has required fields
      recommendations = recommendations.map((rec, index) => ({
        title: rec.title || `Unknown Song ${index + 1}`,
        artist: rec.artist || 'Unknown Artist',
        reason: rec.reason || 'AI recommendation'
      }));
      
    } catch (parseError) {
      console.error('[GENERATE-PLAYLIST] Failed to parse Gemini response:', {
        error: parseError.message,
        responseText: text.substring(0, 500)
      });
      return NextResponse.json(
        { 
          error: "Failed to parse AI response", 
          details: parseError.message,
          rawResponse: text.substring(0, 200) + '...'
        },
        { status: 500 }
      );
    }

    console.log('[GENERATE-PLAYLIST] Starting Spotify enrichment...');
    // If we have Spotify access, try to enrich with Spotify data
    if (userToken) {
      try {
        const enrichedRecommendations = await enrichWithSpotifyData(recommendations, userToken, countryCode);
        console.log('[GENERATE-PLAYLIST] Spotify enrichment successful');
        return NextResponse.json({ 
          recommendations: enrichedRecommendations,
          source: 'ai_with_spotify',
          originalLiked: likedSongs,
          totalSongs: enrichedRecommendations.length
        });
      } catch (spotifyError) {
        console.warn('[GENERATE-PLAYLIST] Failed to enrich with Spotify data:', spotifyError.message);
        // Fall back to AI recommendations without Spotify data
      }
    }
    
    console.log('[GENERATE-PLAYLIST] Returning AI-only recommendations');
    return NextResponse.json({ 
      recommendations,
      source: 'ai_only',
      originalLiked: likedSongs,
      totalSongs: recommendations.length
    });
  } catch (error) {
    console.error('[GENERATE-PLAYLIST] Error generating playlist:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { 
        error: "Failed to generate playlist recommendations", 
        details: error.message,
        errorType: error.name || 'Unknown'
      },
      { status: 500 }
    );
  }
}

// Helper function to enrich AI recommendations with Spotify data
async function enrichWithSpotifyData(recommendations, userToken, countryCode) {
  console.log('[SPOTIFY-ENRICH] Starting enrichment for', recommendations.length, 'tracks');
  const enriched = [];
  let foundCount = 0;
  
  for (let i = 0; i < recommendations.length; i++) {
    const rec = recommendations[i];
    console.log(`[SPOTIFY-ENRICH] Processing ${i + 1}/${recommendations.length}: "${rec.title}" by ${rec.artist}`);
    
    try {
      // Search for this song on Spotify
      const searchQuery = encodeURIComponent(`${rec.title} ${rec.artist}`);
      const searchRes = await fetch(
        `https://api.spotify.com/v1/search?q=${searchQuery}&type=track&market=${countryCode || 'US'}&limit=1`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const track = searchData.tracks?.items?.[0];
        
        if (track) {
          console.log(`[SPOTIFY-ENRICH] ✓ Found: "${track.name}" by ${track.artists[0]?.name}`);
          enriched.push({
            ...rec,
            spotifyId: track.id,
            albumArt: track.album?.images?.[0]?.url || '',
            previewUrl: track.preview_url,
            externalUrl: track.external_urls?.spotify
          });
          foundCount++;
          continue;
        } else {
          console.log(`[SPOTIFY-ENRICH] ✗ Not found on Spotify`);
        }
      } else {
        console.log(`[SPOTIFY-ENRICH] ✗ Search failed with status:`, searchRes.status);
      }
    } catch (err) {
      console.warn(`[SPOTIFY-ENRICH] ✗ Error searching for "${rec.title}" by ${rec.artist}:`, err.message);
    }
    
    // If Spotify search failed, keep the AI recommendation without Spotify data
    enriched.push(rec);
  }
  
  console.log(`[SPOTIFY-ENRICH] Enrichment complete: ${foundCount}/${recommendations.length} tracks found on Spotify`);
  return enriched;
}
