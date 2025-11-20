import { GoogleGenAI } from "@google/genai";
import { GameData, ExtractionRequest, GameScheduleItem } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Cleans Markdown code blocks from the response string to extract raw JSON.
 */
const extractJson = (text: string): any => {
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
  const rawJson = jsonMatch ? jsonMatch[1] : text;
  try {
    return JSON.parse(rawJson);
  } catch (e) {
    console.error("Failed to parse JSON from Gemini response", rawJson);
    throw new Error("Failed to parse AI response as JSON. The model may have returned unstructured text.");
  }
};

export const fetchGameSchedule = async (season: string, week: string): Promise<GameScheduleItem[]> => {
  const ai = getClient();
  const prompt = `
    Find the full schedule of NFL games for the ${season} season, Week ${week}.
    
    Return a JSON Array of objects. Each object must have:
    - "homeTeam": Name of home team
    - "awayTeam": Name of away team
    - "date": Date of the game
    - "scoreSummary": The final score if the game has been played (e.g. "KC 21 - DET 20"), or "TBD" if not.
    
    The output must be ONLY the JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    if (!text) throw new Error("No schedule generated");
    
    const data = extractJson(text);
    if (!Array.isArray(data)) throw new Error("Invalid schedule format returned");
    
    return data;
  } catch (error) {
    console.error("Schedule Fetch Error:", error);
    throw error;
  }
};

export const fetchGameData = async (request: ExtractionRequest): Promise<GameData> => {
  const ai = getClient();
  
  const { season, week, team, specificMatchup } = request;
  
  let queryContext = "";
  if (specificMatchup) {
    queryContext = `the ${season} NFL season, Week ${week} game between ${specificMatchup.away} (Away) and ${specificMatchup.home} (Home)`;
  } else if (team) {
    queryContext = `the ${season} NFL season, Week ${week} game involving the ${team}`;
  } else {
    // Fallback (should rarely be reached if UI logic is correct)
    queryContext = `the ${season} NFL season, Week ${week} games. Choose the most high-profile game.`;
  }

  const prompt = `
    I need detailed statistical data for ${queryContext}.
    You must use Google Search to find the box score and advanced stats.
    
    I need a JSON response containing:
    1. Date of the game.
    2. Home and Away team names.
    3. Final Score for both.
    4. Total Possessions (approximate if exact not found) for both.
    5. Rushing Yards, Passing Yards, Total Plays, Turnovers, and Sacks for both teams.
    6. Top statistical performers: Quarterbacks (passing yds/tds/int), Top 2 Rushers (yds/tds), Top 2 Receivers (rec/yds/tds).

    Output MUST be a valid JSON object matching this structure exactly (no extra text outside JSON):
    {
      "date": "YYYY-MM-DD",
      "season": "${season}",
      "week": "${week}",
      "homeTeam": {
        "teamName": "String",
        "score": Number,
        "rushingYards": Number,
        "passingYards": Number,
        "totalPlays": Number,
        "possessions": Number,
        "turnovers": Number,
        "sacks": Number
      },
      "awayTeam": {
        "teamName": "String",
        "score": Number,
        "rushingYards": Number,
        "passingYards": Number,
        "totalPlays": Number,
        "possessions": Number,
        "turnovers": Number,
        "sacks": Number
      },
      "playerStats": [
        {
          "name": "String",
          "position": "QB" | "RB" | "WR" | "TE",
          "team": "String",
          "passingYards": Number (optional),
          "passingTDs": Number (optional),
          "interceptions": Number (optional),
          "rushingYards": Number (optional),
          "rushingTDs": Number (optional),
          "receivingYards": Number (optional),
          "receivingTDs": Number (optional),
          "receptions": Number (optional)
        }
      ],
      "summary": "A brief 1-sentence summary of the game outcome."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    if (!text) throw new Error("No content generated");

    const parsedData = extractJson(text);
    
    // Extract source URLs from grounding metadata
    const sourceUrls: string[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
        chunks.forEach((chunk: any) => {
            if (chunk.web?.uri) {
                sourceUrls.push(chunk.web.uri);
            }
        });
    }

    return {
      ...parsedData,
      id: crypto.randomUUID(),
      sourceUrls: Array.from(new Set(sourceUrls)), // Deduplicate
    };

  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};