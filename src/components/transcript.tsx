import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/utils/copyToClipboard";
import { downloadFile } from "@/utils/downloadFile";
import { createObjectURL, revokeObjectURL } from "@/utils/objectUrl";
import { toast } from "react-toastify";

export function Transcript({ transcript }: { transcript: string }) {
  if (!transcript) return null;

  const copy = () => {
    copyToClipboard(transcript);
    toast("Transcript copied to clipboard!");
  };

  const downloadTxt = () => {
    const blob = new Blob([transcript], { type: "text/plain" });
    const url = createObjectURL(blob);

    downloadFile(url, "transcript.txt"); // session id or timestamp can be added to the filename if needed

    revokeObjectURL(url);
    toast("Transcript downloaded as TXT file!");
  };

  return (
    <div className="flex flex-col items-start justify-start w-full gap-2">
      <div className="transcript min-h-[200px] p-2 rounded-md bg-gray-100 max-h-[200px] overflow-y-auto">
        {transcript}
      </div>

      <div className="flex flex-row gap-2 items-center ml-auto">
        <Button onClick={copy}> Copy Transcript</Button>
        <Button variant={"outline"} onClick={downloadTxt}>
          Download as TXT
        </Button>
        {/* could add a pdf download option here */}
      </div>
    </div>
  );
}
