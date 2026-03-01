# DTEHub 🚀

**DTEHub** is a premium, open-source academic resource platform designed specifically for Diploma students. It serves as a centralized hub for accessing study materials, previous year question papers, and DCET preparation resources.

[![GitHub stars](https://img.shields.io/github/stars/Tech-Astra/DTEHub?style=social)](https://github.com/Tech-Astra/DTEHub)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Key Features

- **Universal Resource Access**: Browse notes and papers across all branches and syllabus schemes (C-19, C-20, C-25, etc.).
- **Smart Workspace**: A personalized dashboard that tracks your favorites, downloads, and recently viewed materials.
- **Persistent Preferences**: Automatically remembers your selected branch, syllabus, and semester for a seamless experience.
- **DCET Integration**: Dedicated section for DCET preparation with subject-wise categorization.
- **Advanced Admin Dashboard**: Robust management system for organizers to upload, categorize, and track system logs.
- **Modern UI/UX**: Premium aesthetic with glassmorphism, dynamic animations, and full dark/light mode support.

## 🛠️ Technology Stack

- **Frontend**: React 19 + Vite
- **Styling**: Vanilla CSS (Premium Custom Design System)
- **Database**: Firebase Realtime Database
- **Authentication**: Firebase Auth (Google Provider)
- **Icons**: Lucide React
- **Analytics**: Firebase Analytics & System Activity Logs

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Firebase project

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Tech-Astra/DTEHub.git
   cd DTEHub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_DATABASE_URL=your_database_url
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```text
src/
├── components/     # Reusable UI components (Navbar, Dock, Modals)
├── context/        # React Context (Auth, Theme)
├── hooks/          # Custom Hooks (Workspace, Stats)
├── pages/          # Page components (Home, Notes, Admin, Profile)
└── firebase.js     # Firebase configuration and initialization
```

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request or open an issue.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
Built with ❤️ by [Tech-Astra](https://github.com/Tech-Astra)
