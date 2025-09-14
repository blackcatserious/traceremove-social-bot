
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

main();
