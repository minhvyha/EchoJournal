// components/sentiment-indicator.tsx
"use client"
import type { Mood } from "@/utils/moodColor"
import { blendMoodsToHSL, hslToString, moodsToGradient, pickTextColorFromHSL } from "@/utils/moodColor"

type Analysis = {
  top?: { label: string; score: number }
  all?: Array<{ label: string; score: number }>
  sentiment?: string
}

const EMOTION_EMOJI: Record<string, string> = {
  joy: "😊",
  love: "❤️",
  excitement: "🤩",
  amusement: "😄",
  admiration: "🤩",
  optimism: "✨",
  gratitude: "🙏",
  approval: "👍",
  caring: "🤗",
  desire: "😍",
  relief: "😌",
  neutral: "😐",
  sadness: "😢",
  anger: "😠",
  fear: "😰",
  annoyance: "😒",
  disapproval: "👎",
  disappointment: "😞",
  embarrassment: "😳",
  nervousness: "😬",
  confusion: "😕",
  curiosity: "🤔",
  surprise: "😲",
  realization: "💡",
  disgust: "🤢",
  grief: "😭",
  remorse: "😔",
}

export default function SentimentIndicator({ analysis }: { analysis?: Analysis }) {
  const all = analysis?.all ?? []
  const top3 = all.slice(0, 3) as Mood[]

  // fallback single neutral if nothing available
  if (top3.length === 0) {
    return <div className="p-3 rounded-lg bg-slate-100 text-slate-700">No mood detected</div>
  }

  const blended = blendMoodsToHSL(top3)
  const blendedHsl = hslToString(blended.h, blended.s, blended.l)

  // rule: if top is very dominant, show a single filled color; otherwise show gradient
  const topScore = top3[0]?.score ?? 0
  const useSolid = topScore > 0.6

  const bg = useSolid ? blendedHsl : moodsToGradient(top3, "to right")
  const textColor = pickTextColorFromHSL(blended.h, blended.s, blended.l)

  return (
    <div
      className="p-4 rounded-2xl shadow-lg w-full max-w-md transition-all duration-500 ease-in-out hover:shadow-xl"
      style={{
        background: bg,
        color: textColor,
      }}
      role="region"
      aria-label={`Mood indicator ${analysis?.top?.label ?? ""}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-3xl border-2 shadow-md transition-transform duration-300 hover:scale-110"
          style={{
            background: blendedHsl,
            borderColor: "rgba(255,255,255,0.4)",
          }}
          aria-hidden
        >
          {EMOTION_EMOJI[analysis?.top?.label ?? top3[0].label] ?? "💭"}
        </div>

        <div className="flex-1">
          <div className="text-lg font-semibold capitalize tracking-wide">{analysis?.top?.label ?? top3[0].label}</div>
          <div className="text-sm opacity-90 font-medium">
            {"score" in (analysis?.top ?? top3[0]) ? Math.round((analysis?.top?.score ?? top3[0].score) * 100) : ""}%
            confidence
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {top3.map((m, i) => {
          const pct = Math.round(m.score * 100)
          const { h, s, l } = blendMoodsToHSL([m])
          const sample = hslToString(h, s, l)

          return (
            <div key={m.label} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base" aria-hidden>
                    {EMOTION_EMOJI[m.label] ?? "💭"}
                  </span>
                  <span className="text-sm capitalize font-medium">{m.label}</span>
                </div>
                <span className="text-sm font-semibold tabular-nums">{pct}%</span>
              </div>

              <div className="relative h-2.5 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${sample}, ${hslToString(h, Math.min(s + 10, 100), Math.max(l - 5, 30))})`,
                  }}
                  aria-hidden
                />
              </div>
            </div>
          )
        })}
      </div>

      {analysis?.sentiment && (
        <div className="mt-4 pt-3 border-t border-white/20">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs uppercase tracking-wider opacity-75 font-medium">Overall mood:</span>
            <span className="text-sm font-semibold capitalize px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
              {analysis.sentiment}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
