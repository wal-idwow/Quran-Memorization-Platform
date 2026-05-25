**WELCOME**

### 🕌 Quran Memorization Platform**

للنسخة العربية, يرجى الاطلاع على:
  [العربية](./README.ar.md)

  **A full-stack Quran memorization planning platform with spaced repetition, bilingual support (Arabic/English), REST APIs, and progress tracking infrastructure.**

  **Status**: Active Development
  **Stack**: TypeScript + Node.js + Express + React + Supabase
  **Focus**: Structured Quran memorization with optimized revision cycles.

## 🌟 Features
  ✅ **Memorization Planning**
  - Generate personalized memorization plans
  - Custom verse ranges
  - Flexible duration selection
  - Daily learning + revision targets
  - Spaced repetition scheduling
  ✅ **Quran Data**
  - Full Quran metadata support
  - Arabic + English surah names
  - Verse count validation
  - Meccan / Medinan classification
  ✅ **Full i18n Support**
  - 🌍 Dynamic language switching
  - English (LTR)
  - Arabic (RTL)
  ✅ **User Experience**
  - Responsive interface
  - Duration presets + exact input
  - Improved accessibility and UI contrast
  - Real-time plan statistics
  ✅ **🎯 Backend Infrastructure**
  - REST API architecture
  - Authentication-ready backend
  - Supabase integration
  - Validation middleware
  - Structured services layer
  - progress tracking endpoints
  - Comprehensive error handling

## 🏗️ Technology Stack

  **Frontend**
  - React
  - Tailwind CSS
  - i18next
  - TypeScript
  **Backend**
  - Node.js
  - Express.js
  - TypeScript
  **Database & Auth**
  - Supabase
  - PostgreSQL

## 👉 Project Structure
  📁 src/
  ├── components/
  ├── services/
  ├── routes/
  ├── middleware/
  ├── database/
  ├── i18n/
  ├── config/
  ├── schemas/
  └── types/

  📁 public/
  └── index.html

## 📋 Quick Start

  **Installation**
  
  -- bring the project to your local machine

  git clone <your-repository-url>
  cd Quran-Memorization-Platform

  --Bash 
  npm install
  -------------------
  
## 📄 Environment Setup

  **Create .env**

  -- Create a .env file in the root directory with the following content:

  SUPABASE_URL=your_url
  SUPABASE_ANON_KEY=your_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  
## 🚀 Run Development Server
  
  --Bash
  npm run dev
  -------------------
  
  Application runs on: http://localhost:3000


## 📖 Available Scripts
  - npm run dev
  - npm run build
  - npm run start
  - npm test

## 🔌API Endpoints
  
  **Public**
  - Health Check
    GET /health
  - Get Surahs
    GET /api/surahs
  - Generate Memorization Plan
    POST /api/generate-plan

  **Supports:**
  - JSON body
  - Query parameters

  **Example:**
    **-----------------------------------------------**
    curl -X POST http://localhost:3000/api/generate-plan \
      -H "Content-Type: application/json" \
      -d '{
        "userId":"user1",
        "surahNumber":2,
        "startVerse":1,
        "endVerse":50,
        "durationDays":30
      }'
    **-----------------------------------------------**


## 🕒 Planned Extensions
  - User dashboard
  - Saved plans
  - Progress analytics
  - Mobile application
  - Community features
  - Advanced memorization statistics


## 🔧 Development Notes
  **Spaced Repetition Model**
  * Revision cycles currently include:
    - Immediate review
    - Short interval review
    - Medium interval review
    - Consolidation review
    - Maintenance review
  
  * Localization  
    - Translations are managed via: src/i18n/locales/


## 🚀 Deployment
  The project is compatible with:
  - Vercel
  - Railway
  - Render
  - VPS deployments
  - Dockerized environments

## 📄 License

  its open-source under the MIT License. See LICENSE file for details.

  **IMPORTANT**: This project is the fruit of passion and a desire to make memorizing the Holy Qur'an more organized, accessible, and effective for everyone.

  If you have any suggestions, improvements, or contributions, please feel free to open a Pull Request or share your ideas.

  We ask Allah to make this work beneficial for Muslims everywhere, to accept it as a form of ongoing charity (Sadaqah Jariyah), and to bless everyone who contributes to it or benefits from it.

  Please keep us and our parents in your sincere prayers. 🤍
  
  --------------------------💚 thanks 💚----------------------------------

## 🤝 Contributing

  **Contributions, refactors, and feature improvements are welcome.**
    1) Fork repository
    2) Create feature branch
    3) Submit pull request

## 🎯 Project Goal

 **Build a scalable Quran memorization ecosystem combining:**
  - structured memorization,
  - revision science,
  - progress tracking,
  - accessible multilingual tooling.

## 🌟 Future Vision
  - A comprehensive platform for Quran memorization
  - Community engagement and peer learning
  - Advanced analytics and personalized learning paths
  - Mobile accessibility and offline support
  - Integration with Quranic resources and recitations
