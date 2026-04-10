# RealNote - Real-Time Collaborative Editor

![RealNote](https://img.shields.io/badge/Status-Live-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue)

**Live Demo:** [realno.vercel.app](https://realno.vercel.app)

RealNote is a modern, high-performance, real-time collaborative note-taking application. It allows multiple users to simultaneously edit rich-text documents and communicate via integrated voice calls in real-time, functioning much like Google Docs but with an emphasis on speed, a beautiful modern interface, and seamlessly integrated voice chat.

---

## ✨ Features

- **Real-Time Collaboration**: Flawless, conflict-free collaborative editing powered by **Yjs** and Firebase.
- **Rich Text Editing**: Powered by **Tiptap**, featuring bold, italic, code blocks, checklists, text coloring, highlighting, superscript/subscript, and more!
- **Integrated Voice Calling**: Built-in peer-to-peer WebRTC audio calling using **Simple-Peer** so your team can talk while editing.
- **Live Cursors & Presence**: See exactly where your collaborators are typing in real-time and who is currently active in the document.
- **Responsive & Mobile-First**: The UI adapts elegantly from large desktop screens to a highly optimized, native-feeling mobile experience with a bottom-drawer toolbar.
- **Dark/Light Mode**: Full theming support explicitly tied to your system preferences.
- **Authentication**: Secure Google Authentication and Email/Password sign-in using Firebase Auth.
- **Offline Resiliency**: Client-side state managed gracefully, allowing auto-syncing when reconnection happens.

---

## 🛠️ Architecture & Under the Hood

### How the App Works
1. **Frontend Foundation**: Built natively on **Next.js 14/15** utilizing the App Router (`src/app/`).
2. **Text Editor**: The editor core uses **ProseMirror** via **Tiptap**.
3. **Collaboration Engine**: We utilize **Yjs** (a CRDT - Conflict-free Replicated Data Type algorithm library) to merge changes deterministically from multiple users.
4. **Backend Sync**: **y-fire** bridges our Yjs document state with **Firebase Firestore**. It syncs granular changes instantly without sending the entire document, meaning incredibly low data usage and latency.
5. **Real-time Voice**: WebRTC handles the transport of audio directly between users peer-to-peer (via `simple-peer`), while Firebase Firestore handles the WebRTC signaling layer.
6. **State Management**: React Context (`AuthContext`, `AudioContext`) works with Custom Hooks to share session identity and WebRTC connection pools across the UI.

---

## 📦 Dependencies

**Core Tech Stack:**
- **Framework:** `next` (React 19)
- **Styling:** Vanilla CSS Variables & TailwindCSS structure
- **Database / Auth:** `firebase` (Firestore DB, Firebase Auth)
- **Editor:** `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit` and various Tiptap extensions.
- **Collab CRDT:** `yjs`, `y-prosemirror`
- **Collab Connector:** `y-fire`
- **Voice / WebRTC:** `simple-peer`
- **Icons:** `lucide-react`
- **Toasts:** `react-hot-toast`
- **Theming:** `next-themes`

---

## 📂 File Structure

```text
C:\REALTIME-NOTE-COLLABERATIVE\SRC
├── app                 # Next.js App Router root
│   ├── (authenticated) # Route group requiring user login
│   │   ├── dashboard   # Main grid of user's notes
│   │   ├── notes       # Mobile specific note list and nested note editor
│   │   ├── profile     # User profile management
│   │   └── settings    # Theme / App settings
│   ├── login           # Authentication page
│   └── signup          # Registration page
├── components          # Reusable React components
│   ├── AudioModal.tsx         # Active Call indicator/controls modal
│   ├── AuthForm.tsx           # Reusable Sign in/up form
│   ├── BottomNavigation.tsx   # Mobile specific bottom navigation
│   ├── CollaborationSidebar.tsx # Right sidebar showing active users in a note
│   ├── Editor.tsx             # Main Tiptap Yjs Wrapper Component
│   ├── EditorToolbar.tsx      # Desktop/Mobile responsive text formatting pane
│   ├── NoteCard.tsx           # Dashboard grid note card
│   └── PrimarySidebar.tsx     # Desktop main navigation
├── contexts            # React Context Providers
│   ├── AudioContext.tsx       # Global voice call state & WebRTC signaling
│   └── AuthContext.tsx        # Global user session state
├── hooks               # Custom React Hooks
│   ├── useAuth.ts             # Auth utility
│   ├── useDebounce.ts         # Performance/Delay triggers
│   └── useMediaQuery.ts       # Responsive breakpoint checking
├── lib                 # Core application configuration
│   ├── firebase.ts            # Client initialization payload
│   └── firestore.ts           # DB query helpers (Create/Delete Notes)
└── types               # TypeScript interface definitions
    └── index.ts
```

---

## 🚀 Getting Started

To run this project locally, you will need a Firebase account.

1. **Clone the repository:**
   \`\`\`bash
   git clone https://github.com/sahilchavan751/collabrative-notes.git
   cd collabrative-notes
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up Environment Variables:**
   - Create a \`.env.local\` file in the root folder.
   - Copy the values from \`.env.example\`.
   - Fill in your Firebase configuration keys securely.
   \`\`\`env
   NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-domain"
   ...
   \`\`\`

4. **Boot up the Dev Server:**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser:** Navigate to `http://localhost:3000`

---
*Created by [Sahil Chavan](https://github.com/sahilchavan751)*
