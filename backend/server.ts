const { spawn } = require("child_process");
const express = require("express");
const { SpeechClient } = require("@google-cloud/speech");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const keyFilename: string = path.join(process.cwd(), "google.json");

const speechClient = new SpeechClient({ keyFilename });

const app = express();
const port: number = 3001;

app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/transcribe", upload.single("audio"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No audio file uploaded.");
  }

  const lang = req.query.lang || "en-US";

  const audioBytes: string = req.file.buffer.toString("base64");

  const audio = {
    content: audioBytes,
  };

  const config = {
    encoding: "WEBM_OPUS",
    sampleRateHertz: 48000,
    languageCode: lang,
  };

  const request = {
    audio: audio,
    config: config,
  };

  try {
    const [response] = await speechClient.recognize(request);
    const transcription: string =
      response.results
        ?.map((result: any) => result.alternatives?.[0].transcript)
        .join("\n") || "";

    res.json({ transcript: transcription });
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).send("Error transcribing audio");
  }
});

app.post("/convert", upload.single("audio"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No audio file uploaded.");
  }

  try {
    // temp file
    const tempFilePath = path.join(__dirname, `temp-${Date.now()}.webm`);
    fs.writeFileSync(tempFilePath, req.file.buffer);

    const mp3Buffer = await convertToMp3(tempFilePath);

    const mp3FileName = `converted-${Date.now()}.mp3`;
    const mp3FilePath = path.join(__dirname, mp3FileName);
    fs.writeFileSync(mp3FilePath, mp3Buffer);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${mp3FileName}"`,
    );

    // delete temp file after downloaded
    res.download(mp3FilePath, mp3FileName, (err) => {
      fs.unlinkSync(mp3FilePath);
      fs.unlinkSync(tempFilePath);
      if (err) {
        console.error("Download error:", err);
      }
    });
  } catch (err) {
    console.error("Conversion error:", err);
    res.status(500).send("Error converting audio to MP3");
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

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
