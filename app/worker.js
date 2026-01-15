// worker.js
import { pipeline, env } from "@huggingface/transformers";

env.allowLocalModels = false;

let classifier = null;

const POSITIVE = new Set([
  "joy","amusement","relief","admiration","approval","gratitude","love","optimism"
]);
const NEUTRAL = new Set(["neutral"]);

const mapLabelToSentiment = (label) => {
  if (!label) return "reflective";
  const l = label.toLowerCase().trim();
  if (POSITIVE.has(l)) return "positive";
  if (NEUTRAL.has(l)) return "neutral";
  return "reflective";
};

self.onmessage = async (e) => {
  try {
    if (!classifier) {
      // instantiate classifier once
      classifier = await pipeline(
        "text-classification",
        "SamLowe/roberta-base-go_emotions-onnx"
      );
    }

    const text = typeof e.data === "object" && e.data.text ? String(e.data.text) : String(e.data);

    // Ask the pipeline to return all labels and scores
    // for a single input pass top_k: null
    const result = await classifier(text, { top_k: null });

    // result should be an array of { label, score } for single input
    const top = Array.isArray(result) && result.length ? result.reduce((a, b) => (b.score > a.score ? b : a), result[0]) : null;

    const sentiment = top ? mapLabelToSentiment(top.label) : "reflective";

    self.postMessage({
      status: "complete",
      output: {
        top,           // highest scoring { label, score }
        all: result,   // full array of { label, score }
        sentiment      // "positive" | "neutral" | "reflective"
      }
    });
  } catch (err) {
    self.postMessage({
      status: "error",
      error: String(err)
    });
  }
};
