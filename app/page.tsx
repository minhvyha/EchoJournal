"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import EntryList from "@/components/entry-list"
import RecordButton from "@/components/record-button"
import SentimentIndicator from "@/components/sentiment-indicator"

interface Entry {
  id: string
  text: string
  sentiment: "positive" | "neutral" | "reflective"
  timestamp: string
}

export default function Home() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcription, setTranscription] = useState("")
  const [sentiment, setSentiment] = useState<"positive" | "neutral" | "reflective">("neutral")
  const [entries, setEntries] = useState<Entry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load entries from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("echojournal-entries")
    if (saved) {
      setEntries(JSON.parse(saved))
    }
    setIsLoading(false)
  }, [])

  // Save entries to local storage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("echojournal-entries", JSON.stringify(entries))
    }
  }, [entries, isLoading])

  const mockSentimentDetection = (text: string) => {
    const positiveWords = ["happy", "great", "wonderful", "amazing", "love", "excellent", "good", "best"]
    const reflectiveWords = ["think", "realize", "understand", "feel", "wonder", "consider", "reflect", "ponder"]

    const lowerText = text.toLowerCase()

    if (positiveWords.some((word) => lowerText.includes(word))) {
      return "positive"
    }
    if (reflectiveWords.some((word) => lowerText.includes(word))) {
      return "reflective"
    }
    return "neutral"
  }

  const handleRecord = () => {
    setIsRecording(!isRecording)

    if (!isRecording) {
      // Simulate recording - in a real app, this would use Web Audio API
      setTimeout(() => {
        const mockTranscriptions = [
          "I had a wonderful day today. Really feeling grateful for everything.",
          "Thinking about my life and where I want to go. It feels important to reflect on these things.",
          "Nothing much happened, just another regular day.",
          "I love how things are coming together. Amazing progress!",
        ]
        const randomTranscription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)]
        setTranscription(randomTranscription)
        const detectedSentiment = mockSentimentDetection(randomTranscription) as "positive" | "neutral" | "reflective"
        setSentiment(detectedSentiment)
        setIsRecording(false)
      }, 2000)
    }
  }

  const handleSaveEntry = () => {
    if (transcription.trim()) {
      const newEntry: Entry = {
        id: Date.now().toString(),
        text: transcription,
        sentiment,
        timestamp: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }
      setEntries([newEntry, ...entries])
      setTranscription("")
      setSentiment("neutral")
    }
  }

  const handleClearTranscription = () => {
    setTranscription("")
    setSentiment("neutral")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center px-4 py-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-sm font-light tracking-widest text-slate-400 uppercase">EchoJournal</h1>
        <p className="text-xs text-slate-500 mt-2">Your voice, your thoughts, your sentiments</p>
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-md space-y-8">
        {/* Record Button */}
        <div className="flex justify-center">
          <RecordButton isRecording={isRecording} onClick={handleRecord} />
        </div>

        {/* Sentiment Indicator */}
        {transcription && <SentimentIndicator sentiment={sentiment} />}

        {/* Transcription Area */}
        <Card className="bg-white border-0 shadow-sm p-6">
          <p className="text-sm text-slate-500 leading-relaxed">
            {transcription || "Your thoughts will appear here..."}
          </p>
        </Card>

        {/* Action Buttons */}
        {transcription && (
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleSaveEntry}
              className="bg-slate-900 hover:bg-slate-800 text-white text-sm h-10 px-6 rounded-full"
            >
              Save Entry
            </Button>
            <Button
              onClick={handleClearTranscription}
              variant="outline"
              className="text-slate-600 border-slate-300 hover:bg-slate-50 text-sm h-10 px-6 rounded-full bg-transparent"
            >
              Clear
            </Button>
          </div>
        )}

        {/* Divider */}
        {entries.length > 0 && <div className="h-px bg-slate-200" />}
      </div>

      {/* Previous Entries */}
      {entries.length > 0 && (
        <div className="w-full max-w-md mt-12">
          <h2 className="text-sm font-light tracking-widest text-slate-400 uppercase mb-6">Previous Entries</h2>
          <EntryList entries={entries} onDelete={(id) => setEntries(entries.filter((e) => e.id !== id))} />
        </div>
      )}
    </div>
  )
}
