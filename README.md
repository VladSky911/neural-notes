# 📓 Neural Notes

**Neural Notes** is a modern, AI‑powered note‑taking mobile app built with **React Native (Expo)**. It combines a rich text editor, local storage, and free AI services (via Groq) to help you write better, summarise content, generate tags, and rewrite notes in different styles—all in a sleek glass‑morphic interface.

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-1C1E24?style=flat&logo=expo&logoColor=white)](https://expo.dev/)
[![Groq](https://img.shields.io/badge/Groq-FF6C37?style=flat&logo=groq&logoColor=white)](https://groq.com/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=flat&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

- **📝 Rich Text Editor** – format your notes easily using `react-native-pell-rich-editor`.
- **🤖 AI‑powered actions** (all free via Groq):
  - **Summarise** – get a short summary of any note.
  - **Generate Tags** – automatically extract 3–5 relevant keywords.
  - **Rewrite** – change the tone to professional, casual, or simple.
- **💾 Local storage** – notes are saved offline with AsyncStorage.
- **🪟 Glass‑morphic UI** – semi‑transparent cards, rounded corners, soft shadows (native on iOS).
- **🔄 Autosave & Drafts** – unfinished new notes are automatically saved locally and restored when you reopen the editor.
- **🔐 Secure API key** – Groq API key is never stored in the app; it lives inside a **Cloudflare Worker** proxy.
- **📱 Cross‑platform** – works on both iOS and Android (Expo Go or production builds).

---

## 🏗 Architecture Overview

- **Frontend:** Expo + React Native + TypeScript.
- **Storage:** AsyncStorage for notes and draft persistence.
- **AI Backend:** Cloudflare Worker acts as a secure proxy to Groq. The API key is stored as a Worker environment variable – **never exposed to the client**.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm.
- Expo CLI (`npm install -g expo-cli`).
- A **Groq API key** (free tier) – get it from [console.groq.com](https://console.groq.com/).
- (Optional) A **Cloudflare account** – to deploy your own proxy (the repo includes a ready‑to‑deploy worker script).

### 1. Clone the repository

```bash
git clone https://github.com/VladSky911/neural-notes.git
cd neural-notes

```

Install dependencies

npm install

Set up the Cloudflare Worker (AI proxy)
The app expects a Cloudflare Worker that forwards requests to Groq.
You can use the ready‑made script from cloudflare/groq-worker.js (see repo structure below).

Deploy your own Worker:
Log in to Cloudflare Workers.

Create a new Worker and paste the code from cloudflare/groq-worker.js.

Add an environment variable GROQ_API_KEY with your Groq API key.

Deploy the Worker and copy its URL (e.g., https://your-worker.workers.dev).

Alternatively, use the public proxy (only for testing – not recommended for production):
If you just want to test the app, you can ask the maintainer for a temporary proxy URL, but for long‑term use, deploy your own.

Configure the app
Open src/services/aiService.ts and set your Worker URL:

const PROXY_URL = 'https://your-worker.workers.dev';

Run the app
npx expo start --clear
Scan the QR code with Expo Go (Android) or the Camera app (iOS).

Project structure

neural-notes/
├── src/
│ ├── components/ # GlassButton, GlassHeader (optional)
│ ├── screens/
│ │ ├── NotesScreen.tsx # list of notes
│ │ └── NoteEditorScreen.tsx # editor + AI actions + autosave
│ ├── storage/
│ │ └── notesStorage.ts # AsyncStorage CRUD + draft functions
│ ├── services/
│ │ └── aiService.ts # calls to Cloudflare Worker proxy
│ └── types/
│ └── note.ts # Note interface
├── cloudflare/
│ └── groq-worker.js # ready‑to‑deploy Cloudflare Worker
├── App.tsx
├── app.json
├── babel.config.js
├── package.json
└── README.md

🛠 Available Scripts
npm start – start the Expo development server.

npm run android – open on Android device/emulator.

npm run ios – open on iOS simulator (macOS only).

npm run web – start web version (if supported).

🧪 AI Features in Action
Feature How to use
Summarise While editing a note, tap the AI button. The summary will be inserted below your text.
Generate Tags Tap Tags – you’ll see suggested tags; choose “Add to note” to insert them.
Rewrite Tap RW, pick a style (Professional / Casual / Simple), and the entire note content will be rewritten.
Note: AI requests go through your Cloudflare Worker, so you stay within Groq’s free quota and never expose your API key.

🔐 Security & Privacy
Your Groq API key is never bundled with the app.

All AI requests are proxied via your own Cloudflare Worker (or a trusted proxy).

Notes and drafts are stored only on your device (AsyncStorage). No external servers are involved for storage.

🧩 Built With
Expo – SDK 52+

React Native – UI framework

TypeScript – type safety

react-native-pell-rich-editor – WYSIWYG editor

AsyncStorage – local persistence

Groq – LPU‑powered LLM inference (free tier)

Cloudflare Workers – serverless proxy

🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

📄 License
This project is licensed under the MIT License – see the LICENSE file for details.

📬 Contact
Author: Vladimir

GitHub: VladSky911

If you find this project useful, don’t forget to ⭐ star the repository!
