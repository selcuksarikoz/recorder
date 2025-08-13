import { useState } from "react";
import { Visualizer } from "react-sound-visualizer";
import { toast } from "react-toastify";

import "./assets/css/app.css";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PermissionGate from "./components/permissionGate";
import { useRecorder } from "./hooks/useRecorder";
import { DURATIONS } from "./constants/durations";
import { LANGS, type LanguageCode } from "./constants/languages";
import { Button } from "@/components/ui/button";
import { readAllChunks } from "@/hooks/useIndexedDB";
import { downloadFile } from "@/utils/downloadFile";
import { convertFile } from "@/utils/convertFile";

export default function App() {
  const [lang, setLang] = useState<LanguageCode>("en-US");
  const [convertLoading, setConvertLoading] = useState(false);

  const {
    recording,
    paused,
    audioURL,
    transcript,
    durationLimit,
    transcriptLoading,
    stream,
    setDurationLimit,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  } = useRecorder(lang);

  const convertAudio = async () => {
    const chunks = await readAllChunks();
    if (chunks.length === 0) {
      toast("No audio chunks available to convert.");
      return;
    }

    setConvertLoading(true);
    convertFile(chunks).finally(() => setConvertLoading(false));
  };

  const downloadAudio = () => {
    if (!audioURL) {
      toast("No audio available to download.");
      return;
    }
    downloadFile(audioURL, "recording.webm");
  };

  return (
    <PermissionGate>
      <div className="container mx-auto flex gap-2 flex-col py-4">
        {/* controls */}
        <div className="flex flex-row gap-2">
          {/* language selection */}
          <Select
            onValueChange={(value) => setLang(value as LanguageCode)}
            defaultValue={lang}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {LANGS.map((l) => (
                <SelectItem key={l.code} value={l.code}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* duration limit selection */}
          <Select
            onValueChange={(value) => setDurationLimit(parseInt(value))}
            defaultValue={durationLimit.toString()}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Recording limit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DURATIONS.SHORT.toString()}>
                5 s (CTO test)
              </SelectItem>
              <SelectItem value={DURATIONS.MEDIUM.toString()}>1 min</SelectItem>
              <SelectItem value={DURATIONS.LONG.toString()}>4 hours</SelectItem>
            </SelectContent>
          </Select>

          {/* recording controls */}
          <div className="controls flex flex-row gap-2">
            {!recording && <Button onClick={startRecording}>Record</Button>}
            {recording && !paused && (
              <Button onClick={pauseRecording}>Pause</Button>
            )}
            {paused && <Button onClick={resumeRecording}>Resume</Button>}
            {recording && (
              <Button variant={"destructive"} onClick={stopRecording}>
                Stop
              </Button>
            )}
          </div>
        </div>

        {/* wafeform */}
        {stream?.current && (
          <div className="w-full">
            <Visualizer audio={stream?.current} autoStart>
              {({ canvasRef }) => (
                <canvas ref={canvasRef} width={500} height={20} />
              )}
            </Visualizer>
          </div>
        )}

        {audioURL && (
          <section>
            <h3>Playback</h3>
            <audio controls src={audioURL} />
            <div className="mt-2 flex flex-row gap-2 items-center">
              <Button variant="secondary" onClick={downloadAudio}>
                Download Audio
              </Button>

              <p>or</p>

              <Button
                disabled={convertLoading}
                variant="secondary"
                onClick={convertAudio}
              >
                {convertLoading ? "Converting..." : "Convert to MP3"}
              </Button>
            </div>
          </section>
        )}

        <section className="transcript">
          {transcriptLoading ? "Transcript is creating..." : transcript}
        </section>
      </div>
    </PermissionGate>
  );
}
