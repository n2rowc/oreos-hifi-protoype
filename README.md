# Oreos — AI-Powered Audio Note Summaries (High-Fidelity Prototype)

A high-fidelity React + Vite + Tailwind + shadcn/ui prototype demonstrating the **Oreos Accessibility Project**.  
This app allows users to upload a lecture audio file, transcribe it, generate AI-powered notes, and chat with the content.

---

## 🛠️ Tech Stack
- **React (Vite + Rolldown ready)** – front-end framework  
- **Tailwind CSS v4** – styling  
- **@tailwindcss/postcss** – PostCSS plugin for Tailwind v4  
- **shadcn/ui** – modern UI components  
- **lucide-react** – icon set  
- **class-variance-authority / tailwind-variants / clsx** – style utilities

---

## ⚙️ Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/<YOUR_USERNAME>/oreos-hifi-prototype.git
cd oreos-hifi-prototype
```

### 2️⃣ Install dependencies  
Make sure you’re using **Node ≥ 20.19.0** or **22.12.0 +**.
```bash
npm install
```

### 3️⃣ Run the development server
```bash
npm run dev
```
Your app will start at **http://localhost:5173**

---

## 🧩 Troubleshooting

| Issue | Fix |
|-------|-----|
| `postcss` / Tailwind errors | Ensure `@tailwindcss/postcss` is installed and `postcss.config.js` includes the plugin. |
| Missing shadcn imports | Run `npx shadcn@latest init` and re-add components. |
| “Could not determine executable to run” | Delete `node_modules` and rerun `npm install`. |
| Node version errors | Install Node 22.12 + with `nvm install 22.12.0`. |

---

## 🧠 Folder Overview
```
src/
├── components/ui/        # shadcn UI components
├── OreosHifiPrototype.jsx
├── App.jsx
├── main.jsx
├── index.css             # Tailwind directives
tailwind.config.js
postcss.config.js
vite.config.js
```

---

## 🪄 Notes
This project is a **front-end mockup** — no back-end APIs are called.  
All data and functionality (upload, transcript, AI chat) are simulated for UX demonstration purposes.

---

© 2025 Team Oreos — CSCE 436 Project