clothing-store/
├── backend/              ← Node.js + Express API
│   ├── config/           ← DB & Cloudinary config
│   ├── controllers/      ← Business logic (6 controllers)
│   ├── middleware/        ← JWT auth middleware
│   ├── models/           ← Mongoose schemas (5 models)
│   ├── routes/           ← API routes (6 route files)
│   ├── server.js
│   └── .env.example
└── frontend/
    └── ClothingStoreApp/ ← React Native (Expo)
        ├── src/
        │   ├── api/        ← Axios API calls
        │   ├── context/    ← AuthContext (JWT state)
        │   ├── navigation/ ← Stack + Tab navigators
        │   └── screens/    ← All 6 module screens
        └── App.js
