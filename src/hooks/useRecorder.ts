import { useState, useRef, useEffect } from "react";

import { addChunk, readAllChunks, clearChunks } from "./useIndexedDB";
import type { LanguageCode } from "@/constants/languages";
import { DURATIONS } from "@/constants/durations";
import { createObjectURL, revokeObjectURL } from "@/lib/utils";
import { toast } from "react-toastify";

export function useRecorder(lang: LanguageCode = "en-US") {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [transcript, setTranscript] = useState("");
  const [transcriptLoading, setTranscriptLoading] = useState(false);

  const [durationLimit, setDurationLimit] = useState(DURATIONS.LONG); // Default to 4 hours
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (audioURL) {
        revokeObjectURL(audioURL); // Clean up the object URL
      }
    };
  }, [audioURL]);

  const startRecording = async () => {
    if (durationLimit <= 0) {
      alert("Please set a valid recording li  mit before starting.");
      return;
    }
    await clearChunks();
    streamRef.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const mr = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mr;

    mr.ondataavailable = (e: BlobEvent) => {
      console.log(e?.data?.size);
      if (e?.data?.size) {
        addChunk(e.data);
      }
    };

    mr.onstop = async () => {
      const chunks = await readAllChunks();
      const blob = new Blob(chunks, { type: "audio/webm" });
      setAudioURL(createObjectURL(blob));
      sendAudioChunkToServer(blob);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    // start media recorder
    mr.start(1000); // Collects data every 1000 ms (1 second)

    setTranscript("");
    setRecording(true);
    setPaused(false);
    setAudioURL("");

    timeoutRef.current = setTimeout(() => {
      stopRecording();
      toast("Sesion expired. Recording stopped.", {
        type: "info",
      });
    }, durationLimit);
  };

  const pauseRecording = () => {
    mediaRecorderRef.current?.pause();
    setPaused(true);
  };

  const resumeRecording = () => {
    mediaRecorderRef.current?.resume();
    setPaused(false);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setRecording(false);
    setPaused(false);
  };

  const sendAudioChunkToServer = async (chunk: Blob) => {
    try {
      setTranscriptLoading(true);
      const formData = new FormData();
      formData.append("audio", chunk, "audio.webm");

      const response = await fetch(
        `http://localhost:3001/transcribe?lang=${lang}`,
        {
          method: "POST",
          body: formData,
        },
      ).finally(() => setTranscriptLoading(false));

      if (response.ok) {
        const data = await response.json();
        // Append the new transcript to the existing one
        setTranscript(data.transcript);
        console.log("Transcript received:", data.transcript);
      } else {
        console.error("Failed to transcribe audio chunk.");
      }
    } catch (error) {
      console.error("Error sending audio chunk to server:", error);
      setTranscriptLoading(false);
    }
  };

  return {
    recording,
    paused,
    audioURL,
    transcript,
    durationLimit,
    transcriptLoading,
    stream: streamRef,
    setDurationLimit,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  };
}
