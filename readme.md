## Overview

This project combines:

- **Electron** for the desktop application.
- **Frontend** built with **Tailwind CSS** and **shadcn/ui** for modern, responsive styling.
- **Backend** built with **Express.js** for:
    - Speech-to-text conversion (**Google Cloud Speech-to-Text**).
    - MP3 conversion.

No authentication or encryption has been implemented, as these were not required.

---

## Speech-to-Text Implementation

Initially, the plan was to use the **Web Speech API** for real-time transcription during speech.

- **Pros:** Works directly in the browser, no external service needed.
- **Issue:**
    - Works well in Safari.
    - **Chrome bug** caused speech recognition to terminate prematurely during ongoing speech.

- **Decision:** Switched to **Google Cloud Speech-to-Text API** for stable, continuous transcription across browsers and the Electron app.

---

## Added Features

- **Language Selection**: User can choose the spoken language before transcription starts.
- **Time Limit**: Configurable speech duration limit. Default for testing is **5 seconds**.
- **Microphone Permission Panel**:
    - The app requests microphone access on startup.
    - If access is denied, the application will not proceed.

---

## Scripts

### Run the Frontend Only

```bash
npm run frontend
```

- Starts only the frontend development server.
- Useful when working exclusively on the UI without the backend.

### Run the Electron Application

```bash
npm run start
```

- Starts the Electron desktop application.

### Run the Backend

1. Navigate to the backend folder:

    ```bash
    cd backend
    ```

2. Run the backend server:

    ```bash
    node server.ts
    ```

- The backend uses **Express.js** to handle both speech-to-text and MP3 conversion requests.

---

## Styling

- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **shadcn/ui**: Reusable, accessible, and customizable UI components built on top of Tailwind CSS.

---

## Packaging the Electron App

```bash
npm run package
```

- Packages the Electron application for distribution.

**Note (macOS):**
An **unsigned** macOS build has been generated. Because it is unsigned, macOS may block the app from opening. You may need to manually allow it in **System Settings → Privacy & Security**.

---

## Requirements

- **Node.js** and **npm** installed.
- All necessary frontend and backend environment variables configured.
- Google Cloud credentials for Speech-to-Text functionality.
- On macOS, be aware of app signing requirements if distributing outside your local environment.
