"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type Sentiment = "positive" | "neutral" | "reflective"

interface Entry {
  id: string
  text: string
  sentiment: Sentiment
  timestamp: string
}

interface EntryListProps {
  entries: Entry[]
  onDelete: (id: string) => void
}

const sentimentColors = {
  positive: "border-l-4 border-l-emerald-500 bg-emerald-50",
  neutral: "border-l-4 border-l-slate-400 bg-slate-50",
  reflective: "border-l-4 border-l-purple-500 bg-purple-50",
}

export default function EntryList({ entries, onDelete }: EntryListProps) {
  return (
    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
      {entries.map((entry) => (
        <Card
          key={entry.id}
          className={`p-4 border-0 shadow-sm hover:shadow-md transition-shadow ${sentimentColors[entry.sentiment]}`}
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">{entry.text}</p>
              <p className="text-xs text-slate-500 mt-2">{entry.timestamp}</p>
            </div>
            <Button
              onClick={() => onDelete(entry.id)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-slate-200 text-slate-400 hover:text-slate-600"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
