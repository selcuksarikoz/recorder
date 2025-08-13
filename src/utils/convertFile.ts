import { revokeObjectURL } from "@/lib/utils";
import { downloadFile } from "@/utils/downloadFile";

/*
 * It handles the conversion of audio files to a different format.
 */
export async function convertFile(chunks: Blob[]) {
  const blob = new Blob(chunks, { type: "audio/webm" });
  const formData = new FormData();
  formData.append("audio", blob, "recording.webm");
  return fetch("http://localhost:3001/convert", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      downloadFile(url, "converted.mp3");
      revokeObjectURL(url);
    });
}
