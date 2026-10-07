# 🌾 VillageConnect AI

> **"One village. Every need. One intelligent connection."**  
> *గ్రామీణ డిజిటల్ అనుసంధానం • ग्रामीण डिजिटल कनेक्टिविटी*

VillageConnect AI is a hyper-local digital infrastructure platform engineered specifically for villages and small towns across rural India. It connects residents, farmers, local artisans, mechanics, electricians, and small businesses into an intelligent, trustworthy, and actionable local network.

---

## 🚀 Key Highlights & Differentiators

* 🤖 **"I NEED..." Agentic Smart Search**: Unlike generic chatbots, VillageConnect AI parses rural natural language requests (e.g. *"I need a tractor tomorrow for harvesting"*), identifies intent, extracts localized entities, queries authorized Supabase PostgreSQL tools, verifies real-time provider availability, and presents actionable phone call and WhatsApp buttons with match explanations.
* 🛡️ **5-User Peer Community Verification**: Eliminates rural rumors and misinformation. Notices start as `Pending` and automatically go `Live` only after 5 unique verified residents confirm them. Emergency alerts (floods, power cuts) are granted priority handling.
* 🚜 **Dedicated Agriculture Hub**: Real-time discovery of tractors, harvesters, weeding/harvest labor teams, seed suppliers, and verified official government schemes (PM-KISAN, PMFBY, PM-KUSUM) with official portal links.
* 🛒 **0% Fee Rural Marketplace**: Farmers can list and sell fresh produce (desi tomatoes, Sona Masoori paddy) and dairy directly to buyers with zero middleman commissions.
* 🌐 **Multilingual & Voice-First**: Full native UI and Web Speech recognition & text-to-speech audio playback in **English, Telugu (తెలుగు), and Hindi (हिंदी)** for first-time smartphone users and low-literacy farmers.
* ⚡ **Supabase Cloud PostgreSQL & RLS**: Secure relational database with Row Level Security policies, indexes, and database triggers.

---

## 🏛️ System Architecture

```text
               USER INTERACTION
    [ Natural Voice (Telugu/Hindi/EN) or Text ]
                      │
                      ▼
        VILLAGECONNECT CLIENT (Vite + React)
        ├── Tailwind CSS Rural Design System
        ├── Multilingual Dictionaries (EN, TE, HI)
        ├── Web Speech API Voice Interface
        └── Responsive Touch-First Components
                      │
                      ▼ REST API
         NODE.JS / EXPRESS AGENT SERVER
        ├── Rural Intent Classifier & Entity Extractor
        ├── Controlled Tool Dispatcher
        └── Response Reasoning Synthesizer
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
SUPABASE CLOUD POSTGRESQL       GEMINI 1.5 FLASH
├── villages (geo-coordinates)  └── Reasoning & Context
├── profiles & reputations
├── services (tractors, repair)
├── products (fresh produce)
├── updates (community notices)
├── verifications (peer review)
└── government_schemes
```

---

## 📋 Database Schema & Migrations

All schema definitions, indexes, triggers, and authentic Indian rural demo seed data are defined in:
[`/supabase/migrations/001_initial_schema.sql`](file:///c:/villageconnectai/supabase/migrations/001_initial_schema.sql)

### Apply Migrations
```bash
node supabase/apply_migration.js
```

---

## ⚙️ Environment Configuration

### Backend (`server/.env`)
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_PASSWORD=your-database-password
GEMINI_API_KEY=your-gemini-key
```

### Frontend (`client/.env`)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🏃 Local Development Quickstart

### 1. Install Dependencies
```bash
# Install root/server dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### 2. Run Database Migration
```bash
node supabase/apply_migration.js
```

### 3. Build & Run Application
```bash
# Build React client bundle
cd client && npm run build && cd ..

# Start Full-Stack Server
node server/server.js
```
The application will be live at `http://localhost:5000`.

---

## 🎬 3-Minute Hackathon Demo Script

1. **Open App**: Land on home screen showing `Ramapuram Village, Rangareddy`.
2. **"I NEED..." Signature Search**: Click the demo pill *"🚜 Tractor tomorrow"* or speak into the microphone *"I need a tractor tomorrow for harvesting"*.
3. **Agent In Action**: Observe the detected intent (`FIND_FARM_RESOURCE`), extracted parameters, tool call badge, reasoning explanation, and provider cards with instant `Call Now` and `WhatsApp` actions.
4. **Community Verification**: Scroll down to the *Village Updates* feed. Point out the `Pending (4/5 verified)` notice. Click `✓ Verify This Notice` to see the live update promote to `Live (5/5 verified)` via the Supabase database trigger.
5. **Marketplace**: Navigate to Marketplace to view fresh country tomatoes and Sona Masoori paddy listed directly by local farmers.
6. **Agriculture Hub & Schemes**: Switch to Agriculture Hub to show verified schemes (PM-KISAN, PM-KUSUM) linked directly to official government portals.
7. **Multilingual Toggle**: Click `తెలుగు` or `हिंदी` in the top bar to watch the entire UI and voice speech switch dynamically.
