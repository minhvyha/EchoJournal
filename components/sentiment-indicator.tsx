// components/sentiment-indicator.tsx
"use client"

import React from "react"
import type { Mood } from "@/utils/moodColor"
import {
  blendMoodsToHSL,
  hslToString,
  moodsToGradient,
  pickTextColorFromHSL,
} from "@/utils/moodColor"

type Analysis = {
  top?: { label: string; score: number }
  all?: Array<{ label: string; score: number }>
  sentiment?: string
}

export default function SentimentIndicator({ analysis }: { analysis?: Analysis }) {
  const all = analysis?.all ?? []
  const top3 = all.slice(0, 3) as Mood[]

  // fallback single neutral if nothing available
  if (top3.length === 0) {
    return (
      <div className="p-3 rounded-lg bg-slate-100 text-slate-700">
        No mood detected
      </div>
    )
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
      className="p-3 rounded-lg shadow-sm w-full max-w-md"
      style={{
        background: bg,
        color: textColor,
      }}
      role="region"
      aria-label={`Mood indicator ${analysis?.top?.label ?? ""}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-sm font-semibold capitalize">
            {analysis?.top?.label ?? top3[0].label}
          </div>
          <div className="text-xs opacity-80">
            {("score" in (analysis?.top ?? top3[0]) ? Math.round(((analysis?.top?.score ?? top3[0].score) * 100)) : "")}%
          </div>
        </div>

        <div
          className="w-10 h-10 rounded-full border"
          style={{
            background: blendedHsl,
            borderColor: "rgba(255,255,255,0.25)",
          }}
          aria-hidden
        />
      </div>

      <div className="space-y-2">
        {top3.map((m, i) => {
          const pct = Math.round(m.score * 100)
          // small inline color sample
          const { h, s, l } = (() => {
            // reuse same mapping as utils via importing not exported mapping; easiest to derive a simple sample:
            // use blend of single mood by calling blendMoodsToHSL with singleton
            return blendMoodsToHSL([m])
          })()
          const sample = hslToString(h, s, l)
          return (
            <div key={m.label} className="flex items-center gap-3">
              <div className="w-8 text-xs capitalize" style={{ minWidth: 64 }}>
                {m.label}
              </div>
              <div className="flex-1 h-2 bg-white/30 rounded overflow-hidden" aria-hidden>
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: sample,
                  }}
                />
              </div>
              <div className="w-8 text-xs text-right" style={{ minWidth: 36 }}>
                {pct}%
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
