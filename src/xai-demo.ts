
import dotenv from "dotenv";
dotenv.config();
import { xai } from "@ai-sdk/xai";
import { streamText } from "ai";

async function main() {
  const result = streamText({
    model: xai("grok-2-1212"),
    prompt: "Invent a new holiday and describe its traditions.",
  });

  for await (const textPart of result.textStream) {
    process.stdout.write(textPart);
  }
}

import OpenAI from "openai";

async function openAIExample() {
  // Create SDK client using your API key
  const client = new OpenAI({
    apiKey: process.env.XAI_API_KEY,
    baseURL: "https://api.x.ai/v1",
  });

  // Our API is fully compatible with the OpenAI SDKs, so make a request like so
  const completion = await client.chat.completions.create({
    model: "grok-2-latest",
    messages: [
      {
        role: "system",
        content:
          "You are Grok, a chatbot inspired by the Hitchhiker's Guide to the Galaxy.",
      },
      {
        role: "user",
        content:
          "What is the meaning of life, the universe, and everything?",
      },
    ],
  });

  console.log(completion.choices[0].message.content);
}

openAIExample().catch(console.error);
main();
