<p align="center">
  <img src="public/Logo.jpeg" alt="DTEHub Logo" width="120" height="120" style="border-radius: 20px;" />
</p>

<h1 align="center">DTEHub</h1>

<p align="center">
  <strong>Your one-stop academic resource hub for Diploma students.</strong>
</p>

<p align="center">
  <a href="https://dte-hub.web.app/">🌐 Live Site</a> &nbsp;·&nbsp;
  <a href="https://github.com/Tech-Astra/DTEHub/issues">🐛 Report Bug</a> &nbsp;·&nbsp;
  <a href="https://github.com/Tech-Astra/DTEHub/issues">💡 Request Feature</a>
</p>

<p align="center">
  <a href="https://github.com/Tech-Astra/DTEHub"><img src="https://img.shields.io/github/stars/Tech-Astra/DTEHub?style=for-the-badge&logo=github&color=yellow" alt="Stars" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License" /></a>
  <a href="https://dte-hub.web.app/"><img src="https://img.shields.io/badge/Status-Live-brightgreen?style=for-the-badge" alt="Status" /></a>
</p>

---

**DTEHub** is a premium, open-source academic resource platform designed specifically for Diploma students. It serves as a centralized hub for accessing study materials, previous year question papers, and DCET preparation resources — all wrapped in a modern, beautiful UI.

## ✨ Key Features

| Feature | Description |
|---|---|
| 📚 **Universal Resource Access** | Browse notes and papers across all branches and syllabus schemes (C-19, C-20, C-25, etc.) |
| 🎯 **DCET Rank Predictor** | Predict your DCET rank based on Diploma CGPA and DCET marks with a dedicated 50/50 weightage algorithm |
| 🗂️ **Smart Workspace** | Personalized dashboard that tracks your favorites, downloads, and recently viewed materials |
| 💾 **Persistent Preferences** | Automatically remembers your selected branch, syllabus, and semester |
| 📝 **DCET Integration** | Dedicated section for DCET preparation with subject-wise categorization |
| 🛡️ **Admin Dashboard** | Robust management system for organizers to upload, categorize, and track system logs |
| 💬 **Testimonial Engine** | Community-driven feedback system where students can share their academic journeys |
| 🎨 **Modern UI/UX** | Premium aesthetic with glassmorphism, dynamic animations, and dark/light mode support |

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, React Router v7 |
| **Styling** | Vanilla CSS (Glassmorphism, Custom Animations) |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Backend / BaaS** | Firebase (Auth, Realtime Database, Hosting) |
| **Build Tool** | Vite 7 |
| **Linting** | ESLint 9 |

## 📂 Project Structure

```text
DTEHub/
├── public/              # Static assets (logo, favicon, manifest, service worker)
├── src/
│   ├── components/      # Reusable UI components (Navbar, Dock, Modals)
│   ├── context/         # React Context providers (Auth, Theme)
│   ├── hooks/           # Custom Hooks (Workspace, Stats)
│   ├── pages/           # Page components (Home, Notes, RankPredictor, Admin)
│   ├── assets/          # App assets
│   ├── firebase.js      # Firebase configuration and initialization
│   ├── App.jsx          # Root application component with routing
│   └── main.jsx         # Entry point
├── index.html           # HTML shell
├── vite.config.js       # Vite configuration
└── firebase.json        # Firebase hosting and database rules config
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/Tech-Astra/DTEHub.git
cd DTEHub

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Other Commands

```bash
# Build for production
npm run build

# Preview the production build
npm run preview

# Lint the codebase
npm run lint
```

## 🤝 Contributing

We welcome contributions from the community! Whether you want to add new notes, suggest features, or report bugs, your input is valuable.

1. **Fork** the repository
2. **Create** your feature branch — `git checkout -b feature/AmazingFeature`
3. **Commit** your changes — `git commit -m 'Add some AmazingFeature'`
4. **Push** to the branch — `git push origin feature/AmazingFeature`
5. **Open** a Pull Request

> If you have high-quality study materials to share, please reach out!

## 📬 Contact

For inquiries, resource submissions, or partnership opportunities:

**Email:** [contactus.techastra@gmail.com](mailto:contactus.techastra@gmail.com)
**GitHub:** [Tech-Astra](https://github.com/Tech-Astra)

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Tech-Astra">Tech-Astra</a>
</p>
