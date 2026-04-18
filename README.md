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

<img width="1092" height="473" alt="image" src="https://github.com/user-attachments/assets/85eae9a2-d9ce-4442-a66b-206af3ddeac5" />
