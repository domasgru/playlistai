"use server";

import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

export async function getSongs({
  prompt,
  count = 20,
}: {
  prompt: string;
  count?: number;
}) {
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
        songs: z.array(
          z.object({
            songAuthor: z.string(),
            songTitle: z.string(),
          }),
        ),
      }),
      "song_suggestionss",
    ),
  });

  return response.choices[0].message.parsed;
}
