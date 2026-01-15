// app/page.tsx
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
  const [analysis, setAnalysis] = useState<any | null>(null)

  const worker = useRef<Worker | null>(null)
  const recognitionRef = useRef<any>(null)
  const finalTranscriptRef = useRef("")
  const isRecordingRef = useRef(false)

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL("./worker.js", import.meta.url), { type: "module" })
    }

    const onMessageReceived = (e: MessageEvent) => {
      console.log("Message from worker:", e.data)
      if (e.data.status === "complete") {
        const output = e.data.output
        // output expected to be the object you posted earlier
        setAnalysis(output ?? null)
        const sentimentFromModel = output?.sentiment ?? "reflective"
        setSentiment(sentimentFromModel)
        console.log("ML top label:", output?.top, "all:", output?.all)
      } else if (e.data.status === "error") {
        console.error("Worker error:", e.data.error)
      }
    }

    worker.current.addEventListener("message", onMessageReceived)

    const saved = localStorage.getItem("echojournal-entries")
    if (saved) setEntries(JSON.parse(saved))
    setIsLoading(false)

    return () => {
      worker.current?.removeEventListener("message", onMessageReceived)
      try {
        recognitionRef.current?.stop()
      } catch (e) {}
    }
  }, [])

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("echojournal-entries", JSON.stringify(entries))
    }
  }, [entries, isLoading])

  const handleRecord = () => {
    if (isRecordingRef.current) {
      try {
        recognitionRef.current?.stop()
      } catch (e) {}
      isRecordingRef.current = false
      setIsRecording(false)
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Browser does not support speech recognition.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      isRecordingRef.current = true
      setIsRecording(true)
    }

    recognition.onresult = (event: any) => {
      let interim = ""
      let finalPart = ""

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i]
        const text = res[0].transcript
        if (res.isFinal) {
          finalPart += text
        } else {
          interim += text
        }
      }

      if (finalPart) {
        finalTranscriptRef.current = (finalTranscriptRef.current + " " + finalPart).trim()
        setTranscription(finalTranscriptRef.current)
        worker.current?.postMessage({ text: finalTranscriptRef.current })
      } else {
        setTranscription((finalTranscriptRef.current + " " + interim).trim())
      }
    }

    recognition.onerror = (e: any) => {
      console.error("Speech recognition error", e)
      isRecordingRef.current = false
      setIsRecording(false)
    }

    recognition.onend = () => {
      isRecordingRef.current = false
      setIsRecording(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
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
      finalTranscriptRef.current = ""
      setSentiment("neutral")
      setAnalysis(null)
    }
  }

  const handleClearTranscription = () => {
    setTranscription("")
    finalTranscriptRef.current = ""
    setSentiment("neutral")
    setAnalysis(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-2xl font-light tracking-widest text-slate-400 uppercase">EchoJournal</h1>
        <p className="text-slate-500 mt-2">Your voice, your thoughts, your sentiments</p>
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <RecordButton isRecording={isRecording} onClick={handleRecord} />
        </div>

        {transcription && <SentimentIndicator analysis={analysis ?? undefined} />}

        <Card className="bg-white border-0 shadow-sm p-6">
          <p className="text-sm text-slate-500 leading-relaxed">{transcription || "Your thoughts will appear here..."}</p>
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

      {entries.length > 0 && (
        <div className="w-full max-w-md mt-12">
          <h2 className="text-sm font-light tracking-widest text-slate-400 uppercase mb-6">Previous Entries</h2>
          <EntryList entries={entries} onDelete={(id) => setEntries(entries.filter((e) => e.id !== id))} />
        </div>
      )}
    </div>
  )
}
