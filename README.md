# SocialConnect 🌐

SocialConnect is a modern, full-stack, internship-level social media feed application inspired by TaskPlanet. It features JWT-based user authentication, a responsive card-based social feed, base64 image uploads with real-time previews, optimistic likes toggling, interactive comment boxes, and offset pagination.

The design utilizes a dark glassmorphic palette built with **React, Vite, Material UI (MUI), Node.js, Express, and MongoDB Mongoose**.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React.js (via Vite)
- **Routing**: React Router DOM v6
- **UI & Styling**: Material UI (MUI v5) & Emotion
- **HTTP Client**: Axios (with authorization request interceptors)

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB Atlas (via Mongoose ODM)
- **Security**: JWT (JsonWebToken) & bcryptjs (password hashing)
- **Logging/CORS**: Morgan, CORS middlewares

---

## 📁 Project Structure

```
SocialConnect/
├── backend/
│   ├── config/          # Database connections
│   ├── controllers/     # Route logic controller methods
│   ├── middleware/      # JWT auth filter & error captures
│   ├── models/          # Mongoose database collections
│   ├── routes/          # API endpoint declarations
│   ├── .env             # Environment configuration file
│   ├── package.json     # Node libraries config
│   └── server.js        # Server entry bootstrap
│
├── frontend/
│   ├── public/          # Static browser assets
│   ├── src/
│   │   ├── components/  # Reusable UI widgets (Navbar, Cards, etc.)
│   │   ├── context/     # Global Authentication State Provider
│   │   ├── pages/       # Login, Register, Feed layouts
│   │   ├── services/    # Axios HTTP central configs
│   │   ├── App.jsx      # Navigation routers
│   │   ├── theme.js     # MUI custom Palette and overrides
│   │   └── main.jsx     # DOM entry mount point
│   ├── index.html       # Vite HTML template loader
│   ├── package.json     # Frontend libraries config
│   └── vite.config.js   # Vite engine rules
│
└── README.md            # Setup guide and instructions
```

---

## ⚙️ Setup & Configuration

### Backend Environment Variables
Create a file named `.env` in the `backend/` directory and supply your MongoDB connection string and JWT secret:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=any_custom_secure_secret_key_phrase
NODE_ENV=development
```

---

## 💻 Local Installation & Running

Follow these instructions to run the application locally on your computer:

### 1. Prerequisite
Ensure that you have [Node.js](https://nodejs.org) (v18 or higher) installed on your system.

### 2. Run the Backend Server
Open a terminal in the root workspace and run:
```bash
# Navigate to backend folder
cd backend

# Install node dependencies
npm install

# Start development server (runs nodemon on port 5000)
npm run dev
```

### 3. Run the Frontend App
Open a separate terminal in the root workspace and run:
```bash
# Navigate to frontend folder
cd frontend

# Install react dependencies
npm install

# Start Vite preview server (runs on port 5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to interact with the application.

---

## 🛠️ Detailed Features

1. **Authentication**: Users can sign up and log in. Passwords are securely hashed using bcryptjs. JWT is generated, stored in browser `localStorage`, and validated on subsequent visits using a protected endpoint (`/me`).
2. **Social Feed**: Displays all posts with user profiles, relative time summaries, content texts, image displays, likes, and comment threads. Unauthenticated sessions are automatically redirected.
3. **Optimistic Likes**: When a user clicks the Like button, the UI changes color and increments the count immediately. The backend API handles DB syncing in the background. If a network fail occurs, the UI reverts to its original state.
4. **Base64 Photo Uploads**: Users can select local images. A browser-based `FileReader` validates size limits (<5MB), converts it to a base64 string, and renders a preview with a cancel button.
5. **Interactive Comments**: Users can expand comment drawers to view comments, and append new comments instantly without page refreshes.
6. **Offset Chunk Pagination**: Feed loads 5 posts at a time. A "Load More" action retrieves subsequent chunks and appends them to the scroll.

---

## ☁️ Deployment Guide

### Database (MongoDB Atlas)
1. Register/Login to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster and database user.
3. Whitelist access from any IP (`0.0.0.0/0`) or configure specific cloud provider addresses.
4. Retrieve the connection string: `mongodb+srv://<user>:<password>@cluster.mongodb.net/dbname`

### Backend (Render / Heroku)
1. Go to [Render](https://render.com) and create a new **Web Service**.
2. Link your Git repository.
3. Set the build command to `npm install` and start command to `node server.js` (pointing to the root/backend directories).
4. Add environment variables (`MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`) under settings.
5. Deploy service.

### Frontend (Vercel)
1. Go to [Vercel](https://vercel.com) and create a **New Project**.
2. Choose your repository. In settings, configure the Root Directory to `frontend`.
3. Vercel automatically detects the Vite config and populates build and output scripts.
4. If deploying the backend on a remote URL, update the `baseURL` in [api.js](file:///e:/Social_Task_Plant/frontend/src/services/api.js) from `http://localhost:5000/api` to your deployed backend URL: `https://your-backend.onrender.com/api`.
5. Deploy project.
