/// <reference types="vite/client" />

import type { LanguageCode } from "@/constants/languages";

export declare global {
  interface Window {
    api: {
      sttStart: (languageCode: LanguageCode) => Promise<boolean>;
      sttChunk: (chunk: Uint8Array) => void;
      sttStop: () => Promise<boolean>;
      onSttResult: (
        cb: (payload: { transcript: string; isFinal: boolean }) => void,
      ) => () => void;
      onSttError: (cb: (msg: string) => void) => () => void;
      onSttEnded: (cb: () => void) => () => void;
    };
  }
}
