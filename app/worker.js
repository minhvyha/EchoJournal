import { pipeline, env } from "@huggingface/transformers";

env.allowLocalModels = false;

let classifier;

self.onmessage = async (e) => {
  if (!classifier) {
    classifier = await pipeline("text-classification", "Xenova/distilbert-base-uncased-finetuned-sst-2-english");
  }

  const result = await classifier(e.data.text);
  self.postMessage({
    status: "complete",
    output: result[0],
  });
};