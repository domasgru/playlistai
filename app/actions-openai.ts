"use server";

import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { GeneratedTrackInterface } from "./types";

const MODEL = "gpt-4o-mini-2024-07-18";

export async function getGeneratedTrackList({
  prompt,
  model = "gpt-4o-mini-2024-07-18",
  count = 40,
}: {
  prompt: string;
  model?: "gpt-4o-mini-2024-07-18" | "gpt-4o-2024-08-06";
  count?: number;
}): Promise<{ tracks: GeneratedTrackInterface[]; playlistName: string }> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.beta.chat.completions.parse({
      model,
      messages: [
        {
          role: "system",
          content: `You are a music expert. Generate a list of ${count} songs based on user preferences.`,
        },
        { role: "user", content: prompt },
      ],
      response_format: zodResponseFormat(
        z.object({
          playlistName: z.string(),
          tracks: z.array(
            z.object({
              trackAuthor: z.string(),
              trackName: z.string(),
            }),
          ),
        }),
        "song_suggestionss",
      ),
    });

    if (!response.choices[0].message.parsed) {
      throw new Error("AI Model Error failed to generate song list");
    }

    return response.choices[0].message.parsed;
  } catch (error) {
    throw new Error("AI Model Error failed to generate song list", {
      cause: error,
    });
  }
}
