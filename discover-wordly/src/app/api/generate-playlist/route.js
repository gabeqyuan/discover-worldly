import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req) {
  try {
    const { likedSongs, dislikedSongs, countryCode, userToken } = await req.json();

    if (!likedSongs || likedSongs.length === 0) {
      return NextResponse.json(
        { error: "No liked songs provided" },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: "Missing GOOGLE_AI_API_KEY" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Format songs for better analysis
    const likedSongsList = likedSongs.map(song => `"${song.title}" by ${song.artist}`).join('\n');
    const dislikedSongsList = dislikedSongs.length > 0 ? dislikedSongs.map(song => `"${song.title}" by ${song.artist}`).join('\n') : 'None';

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    let recommendations;
    try {
      // Clean the response text in case there are markdown code blocks
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      recommendations = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      return NextResponse.json(
        { error: "Failed to parse AI response", details: parseError.message },
        { status: 500 }
      );
    }

    // If we have Spotify access, try to enrich with Spotify data
    if (userToken) {
      try {
        const enrichedRecommendations = await enrichWithSpotifyData(recommendations, userToken, countryCode);
        return NextResponse.json({ 
          recommendations: enrichedRecommendations,
          source: 'ai_with_spotify',
          originalLiked: likedSongs,
          totalSongs: enrichedRecommendations.length
        });
      } catch (spotifyError) {
        console.warn('Failed to enrich with Spotify data:', spotifyError);
        // Fall back to AI recommendations without Spotify data
      }
    }
    
    return NextResponse.json({ 
      recommendations,
      source: 'ai_only',
      originalLiked: likedSongs,
      totalSongs: recommendations.length
    });
  } catch (error) {
    console.error('Error generating playlist:', error);
    return NextResponse.json(
      { error: "Failed to generate playlist recommendations", details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to enrich AI recommendations with Spotify data
async function enrichWithSpotifyData(recommendations, userToken, countryCode) {
  const enriched = [];
  
  for (const rec of recommendations) {
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
          enriched.push({
            ...rec,
            spotifyId: track.id,
            albumArt: track.album?.images?.[0]?.url || '',
            previewUrl: track.preview_url,
            externalUrl: track.external_urls?.spotify
          });
          continue;
        }
      }
    } catch (err) {
      console.warn(`Failed to find Spotify data for "${rec.title}" by ${rec.artist}`);
    }
    
    // If Spotify search failed, keep the AI recommendation without Spotify data
    enriched.push(rec);
  }
  
  return enriched;
}
