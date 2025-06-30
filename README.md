# NodeBox 🧰⚡️  
**Project Submission for BOTL.new Hackathon**

---

## 🚀 Introduction

**Want to host your project or preview any GitHub repo instantly—without subscriptions or risking your machine?**  
**Meet NodeBox:** a full browser-based sandboxed Node.js environment using your machine's resources—**in-browser**.

### 🔧 Features:
- Load GitHub or local folder projects
- Get terminal + file editor
- Make live edits
- Preview instantly
- One-click deployment with custom subdomain

Built using **WebContainer API** by StackBlitz.

---

## 💡 Motivation

Too many steps to test and deploy small frontend projects?  
NodeBox eliminates that friction—no installs, no config, zero setup.

---

## 🧪 What is NodeBox?

NodeBox spins up a full Node.js environment in your browser sandbox to run and preview **frontend-only** applications.  
You can:

- Load a GitHub repo or local folder  
- Modify code in an embedded editor  
- View preview instantly in a live terminal  
- Deploy directly to a static URL

Currently, only **React + Vite** projects are supported.

---

## 🖼️ Pages & Flow

### 🏠 Home Page
A vibrant AI-coded landing built with Bolt.new + custom components.

### 🚀 Deploy Page *(Core Feature)*
- Upload GitHub URL or folder
- Enter project name, description, build command, env variables
- Starts sandbox → launches WebContainer  
- Terminal logs, editor, live preview
- One-click deploy to static URL via S3 + Cloudflare

### 📂 Dashboard
- View, rebuild, or delete your deployed projects
- Shows project metadata and GitHub repo link

### 🌍 Explore
- Browse community-hosted projects

### 📘 About
- Overview of NodeBox and its vision

---

## 🛠️ Tech Stack & Tools

- **Frontend:** Tailwind CSS, Vite, Bolt.new
- **Web sandbox:** StackBlitz WebContainer API
- **Auth:** NextAuth (GitHub)
- **Storage:** AWS S3 + CloudFront
- **Static Hosting:** Cloudflare Workers + DNS (vinitngr.xyz)
- **Infra:** Vercel + Netlify
- **State & Build Tools:** Zustand, BunJS, Drizzle ORM, PostgreSQL

---

## 🚧 Challenges Faced

- WebContainer failed to start due to CORS headers — resolved after 6 hours of debugging
- Terminal frontend had bugs (still unresolved — [GitHub issue pending])
- File edit operations were tricky to handle cleanly
- Secure upload pipeline for AWS S3 took effort

---

## 📚 What I Learned

- Deep understanding of Next.js headers and static hosting
- Hands-on with WebContainer API and frontend sandboxing
- Advanced frontend workflows using AI tools like Bolt.new
- Experience using BunJS, Drizzle ORM in real-world project

---

## 🔮 What’s Next

- Add support for frameworks beyond React+Vite
- Improve compatibility with heavier client-side apps
- Explore Server-Sent Events (SSE) and more dynamic rendering
- Fix the custom terminal bug

---

## 📌 Final Note

NodeBox is built for developers who want **instant feedback with zero setup**.  
It’s aligned with Bolt.new’s mission: *“Build fast, ship faster.”*

Check out the [GitHub Repo](#) and [Blog](#) for more insights.  
Thanks for watching.
