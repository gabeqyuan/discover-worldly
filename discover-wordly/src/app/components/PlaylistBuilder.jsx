import { GoogleGenAI } from '@google/genai';

export default async function PlaylistBuilder({ likedSongs, dislikedSongs, responseMsg }) {
    const ai = new GoogleGenAI({});
    let answer = "";

    if (!likedSongs) return;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `The user has provided two lists of songs from the same country:

                        Liked songs: ${likedSongs}

                        Disliked songs: ${dislikedSongs}

                        Your task is to generate a new list of recommended songs that are highly similar in style, mood, and genre to the songs in the liked list.

                        Important rules:

                        Do not include any song that appears in the disliked songs list.

                        Only recommend songs that originate from the same country as the provided songs.

                        Prioritize songs that match the user\’s musical taste profile inferred from the liked list (e.g., similar artists, tempo, instrumentation, or lyrical themes).

                        Include all songs in the liked list in your response.

                        Your response list should include 20 songs total.

                        Output format:
                        Return your recommendations as a simple JSON-style list, formatted exactly like this:
                        [song1, song2, song3, song4, ...]

                        Do not include any explanations, commentary, or additional text — only the list of song titles.`,
        });
        answer = response.text;
        console.log(answer);
    } catch (error) {
        console.error('Error fetching gemini', error);
    }

    return (
        <></>
    )
}