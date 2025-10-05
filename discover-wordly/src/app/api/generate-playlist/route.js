import { NextResponse } from "next/server";
import { GoogleGenAI } from '@google/genai';

export async function POST(req) {
  try {
    const { likedSongs, dislikedSongs } = await req.json();

    if (!likedSongs || likedSongs.length === 0) {
      return NextResponse.json(
        { error: "No liked songs provided" },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_AI_API_KEY, // Make sure to add this to your .env file
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `The user has provided two lists of songs from the same country:

Liked songs: ${likedSongs.join(', ')}

Disliked songs: ${dislikedSongs.join(', ')}

Your task is to generate a new list of recommended songs that are highly similar in style, mood, and genre to the songs in the liked list.

Important rules:

Do not include any song that appears in the disliked songs list.

Only recommend songs that originate from the same country as the provided songs.

Prioritize songs that match the user's musical taste profile inferred from the liked list (e.g., similar artists, tempo, instrumentation, or lyrical themes).

Include all songs in the liked list in your response.

Your response list should include 20 songs total.

Output format:
Return your recommendations as a simple JSON-style list, formatted exactly like this:
[song1, song2, song3, song4, ...]

Do not include any explanations, commentary, or additional text — only the list of song titles.`,
    });

    const answer = response.text;
    
    return NextResponse.json({ recommendations: answer });
  } catch (error) {
    console.error('Error generating playlist:', error);
    return NextResponse.json(
      { error: "Failed to generate playlist recommendations", details: error.message },
      { status: 500 }
    );
  }
}
