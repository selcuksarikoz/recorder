import { spawn } from "child_process";

function convertToMp3(inputPath: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-i",
      inputPath,
      "-f",
      "mp3",
      "-ab",
      "192000",
      "-vn",
      "pipe:1",
    ]);

    const chunks: Buffer[] = [];
    ffmpeg.stdout.on("data", (chunk) => chunks.push(chunk));

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve(Buffer.concat(chunks));
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });
  });
}

module.exports = { convertToMp3 };
