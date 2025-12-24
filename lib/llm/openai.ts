import OpenAI from "openai";

/**
 * This file creates a reusable OpenAI client.
 * It is ONLY imported by server code.
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
