# 📓 Neural Notes — AI-Powered Note Taking App

**Neural Notes** is a modern, AI-first mobile note-taking app built with **React Native (Expo)**.
It helps users not just write notes — but **think, summarise, and transform information using AI**.

> ⚡ Built with a focus on real-world usability, performance, and clean UX.

---

## 🚀 Overview

Most note apps are passive. Neural Notes is **active**.

It turns raw text into:

* concise summaries
* structured insights
* meaningful tags
* rewritten content in different tones

All powered by **fast, low-cost LLM inference via Groq**.

---

## ✨ Core Features

### 📝 Rich Text Editing

* Full WYSIWYG editor using `react-native-pell-rich-editor`
* Clean mobile-first UX
* Fast and responsive editing experience

---

### 🤖 AI-Powered Actions (Groq)

Turn any note into structured knowledge:

* **Summarise**

  * Instantly generate concise summaries

* **Generate Tags**

  * Extract 3–5 relevant keywords automatically

* **Rewrite**

  * Transform tone:

    * Professional
    * Casual
    * Simple

---

### 💾 Offline-First Storage

* Notes stored locally using AsyncStorage
* Works without internet
* No external database required

---

### 🔄 Autosave & Draft Recovery

* Automatic draft saving while typing
* Restore unfinished notes on reopen
* Zero data loss UX

---

### 🎨 Glassmorphic UI

* Modern translucent design
* Smooth shadows and rounded components
* Native feel on iOS and Android

---

### 🔐 Secure AI Architecture

* No API keys exposed in the client
* All AI requests routed through a **Cloudflare Worker proxy**
* Environment-based secret management

---

## 🏗 Architecture

**Frontend**

* React Native (Expo)
* TypeScript

**Storage**

* AsyncStorage (local persistence)

**AI Layer**

* Groq (LLM inference)
* Cloudflare Workers (secure proxy)

---

### 🔄 Data Flow

```
User Input → Mobile App → Cloudflare Worker → Groq API → Response → UI
```

* API key is stored **only in the Worker**
* Client never accesses secrets

---

## 📱 Platform Support

* iOS (Expo Go / build)
* Android (Expo Go / build)

---

## 🧠 Why This Project Matters

This is not just a notes app — it demonstrates:

* AI integration in real products
* Secure API architecture (proxy pattern)
* Mobile-first UX design
* Offline-first data handling
* LLM feature design (summarisation, rewriting, tagging)

---

## 🛠 Tech Stack

* **Frontend:** React Native, Expo, TypeScript
* **Editor:** react-native-pell-rich-editor
* **Storage:** AsyncStorage
* **AI:** Groq
* **Backend Proxy:** Cloudflare Workers

---

## ⚙️ Getting Started

### 1. Clone repository

```bash
git clone https://github.com/VladSky911/neural-notes.git
cd neural-notes
npm install
```

---

### 2. Setup Cloudflare Worker (AI Proxy)

1. Create a Worker in Cloudflare
2. Paste code from:

```
cloudflare/groq-worker.js
```

3. Add environment variable:

```
GROQ_API_KEY=your_api_key
```

4. Deploy and copy URL

---

### 3. Configure App

```ts
const PROXY_URL = 'https://your-worker.workers.dev';
```

File:

```
src/services/aiService.ts
```

---

### 4. Run App

```bash
npx expo start --clear
```

---

## 📂 Project Structure

```
src/
 ├── components/
 ├── screens/
 │   ├── NotesScreen.tsx
 │   └── NoteEditorScreen.tsx
 ├── storage/
 │   └── notesStorage.ts
 ├── services/
 │   └── aiService.ts
 └── types/

cloudflare/
 └── groq-worker.js
```

---

## 🧪 AI Features in Practice

| Feature       | Description             |
| ------------- | ----------------------- |
| Summarise     | Adds summary below note |
| Generate Tags | Suggests keywords       |
| Rewrite       | Rewrites entire note    |

---

## 🔐 Security & Privacy

* API keys never exposed in frontend
* All AI calls go through secure proxy
* Notes stored locally on device only
* No external data collection

---

## 💡 Future Improvements

* Cloud sync (optional)
* Semantic search (embeddings)
* Folder / workspace system
* Voice notes + AI transcription
* AI chat over notes (RAG)

---

## 📄 License

MIT License

---

## 👤 Author

**Vladimir**
AI Developer · Fullstack Builder


GitHub: VladSky911

If you find this project useful, don’t forget to ⭐ star the repository!
