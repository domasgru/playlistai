"use server";

import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

export interface GeneratedTrackInterface {
  trackAuthor: string;
  trackName: string;
}

export async function getGeneratedTrackList({
  prompt,
  count = 20,
}: {
  prompt: string;
  count?: number;
}): Promise<GeneratedTrackInterface[]> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: `You are a music expert. Generate a list of ${count} songs based on user preferences.`,
        },
        { role: "user", content: prompt },
      ],
      response_format: zodResponseFormat(
        z.object({
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
      throw new Error("AI Model failed to generate song list");
    }

    return response.choices[0].message.parsed.tracks;
  } catch (error) {
    throw new Error("AI Model failed to generate song list", { cause: error });
  }
}