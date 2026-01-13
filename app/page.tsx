"use client"

import { useState, useEffect, useRef } from "react"
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

  // Worker Reference
  const worker = useRef<Worker | null>(null)

  // 1. Initialize Worker and Speech Recognition
  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL("./worker.js", import.meta.url), {
        type: "module",
      })
    }

    const onMessageReceived = (e: MessageEvent) => {
      if (e.data.status === "complete") {
        const label = e.data.output.label // POSITIVE or NEGATIVE
        // Map ML labels to your UI's sentiment types
        setSentiment(label === "POSITIVE" ? "positive" : "reflective")
      }
    }

    worker.current.addEventListener("message", onMessageReceived)

    // Load local storage
    const saved = localStorage.getItem("echojournal-entries")
    if (saved) setEntries(JSON.parse(saved))
    setIsLoading(false)

    return () => worker.current?.removeEventListener("message", onMessageReceived)
  }, [])

  // 2. Persistent Storage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("echojournal-entries", JSON.stringify(entries))
    }
  }, [entries, isLoading])

  // 3. Real Speech Recognition Logic
  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false)
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Browser does not support speech recognition.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setIsRecording(true)

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript
      setTranscription(text)
      // Send to Worker for ML analysis
      worker.current?.postMessage({ text })
    }

    recognition.onerror = () => setIsRecording(false)
    recognition.onend = () => setIsRecording(false)

    recognition.start()
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
        <h1 className="text-2xl font-light tracking-widest text-slate-400 uppercase">EchoJournal</h1>
        <p className="text-slate-500 mt-2">Your voice, your thoughts, your sentiments</p>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md space-y-8">
        {/* Recording area with bubble wrapper */}
        <div className="flex justify-center">
          <div className="relative flex items-center justify-center">
            {/* Bubble that appears above the record button */}
            {transcription && (
              <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 z-20">
                <div className="min-w-[180px] max-w-xs bg-white border border-slate-200 shadow-lg rounded-2xl p-3 text-sm leading-tight transition duration-150 ease-out">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 break-words">{transcription}</div>
                    <button
                      onClick={handleClearTranscription}
                      aria-label="Clear transcription"
                      className="ml-3 text-slate-400 hover:text-slate-600 text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                  {/* optional row for sentiment + actions */}
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <SentimentIndicator sentiment={sentiment} />
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={handleSaveEntry} className="rounded-full" aria-label="Save entry">
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
                {/* Tail */}
                <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1 w-3 h-3 bg-white rotate-45 border-l border-t border-slate-200 shadow-sm" />
              </div>
            )}

            <RecordButton isRecording={isRecording} onClick={handleRecord} />
          </div>
        </div>

        {transcription && <SentimentIndicator sentiment={sentiment} />}

        <Card className="bg-white border-0 shadow-sm p-6">
          <p className="text-sm text-slate-500 leading-relaxed">
            {transcription || "Your thoughts will appear here..."}
          </p>
        </Card>

        {transcription && (
          <div className="flex gap-3 justify-center">
            <Button onClick={handleSaveEntry} className="bg-slate-900 hover:bg-slate-800 text-white rounded-full">
              Save Entry
            </Button>
            <Button onClick={handleClearTranscription} variant="outline" className="rounded-full">
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Entries List */}
      {entries.length > 0 && (
        <div className="w-full max-w-md mt-12">
          <h2 className="text-sm font-light tracking-widest text-slate-400 uppercase mb-6">Previous Entries</h2>
          <EntryList entries={entries} onDelete={(id) => setEntries(entries.filter((e) => e.id !== id))} />
        </div>
      )}
    </div>
  )
}
