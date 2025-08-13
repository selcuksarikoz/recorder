import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";

/**
 * Shows a blocking screen until microphone access is available.
 * Uses getUserMedia probe; if denied, shows instructions and a retry button.
 */
export default function PermissionGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [granted, setGranted] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string>("");

  const probe = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setGranted(true);
      setMessage("");
    } catch (err: any) {
      setGranted(false);
      setMessage(
        err?.name === "NotAllowedError"
          ? "Microphone access is blocked. Please click Allow or enable it in system settings."
          : "Unable to access microphone. Please check your system and app settings.",
      );
    }
  };

  useEffect(() => {
    probe();
  }, []);

  if (granted) return <>{children}</>;

  return (
    <div className="container mx-auto flex flex-col items-center justify-center gap-4 my-8">
      <h2>
        {granted === null
          ? "Checking Microphone Permission…"
          : "Microphone Permission Required"}
      </h2>
      <p>{message || "Please wait while we verify access."}</p>
      <ul>
        <li>
          When prompted by the app, click <em>Allow</em>.
        </li>
        <li>
          macOS: System Settings → Privacy & Security → Microphone → enable for
          this app.
        </li>
        <li>Windows: Settings → Privacy → Microphone → allow app access.</li>
      </ul>
      <Button onClick={probe} className="mb-2">
        Try Again
      </Button>
    </div>
  );
}
