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
      // Use the ONNX repo which contains model_quantized.onnx
      classifier = await pipeline(
        "text-classification",
        "SamLowe/roberta-base-go_emotions-onnx"
      );
    }

    const text = typeof e.data === "object" && e.data.text ? String(e.data.text) : String(e.data);

    // This model is multi-label. The pipeline returns an array of { label, score }.
    const result = await classifier(text);
    console.log(result)

    // If result is an array of scores, pick highest score as top label
    const top = Array.isArray(result) ? result.reduce((a, b) => (b.score > a.score ? b : a), result[0]) : result;

    const sentiment = mapLabelToSentiment(top.label);

    self.postMessage({
      status: "complete",
      output: {
        top,           // selected top { label, score }
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
