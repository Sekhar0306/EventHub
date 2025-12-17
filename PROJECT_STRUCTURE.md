# Project Structure

```
Mern Project/
├── client/                 # React frontend application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   │   ├── CalendarView.js/css
│   │   │   ├── EventCard.js/css
│   │   │   ├── Navbar.js/css
│   │   │   └── PrivateRoute.js
│   │   ├── context/        # React Context providers
│   │   │   ├── AuthContext.js
│   │   │   └── ThemeContext.js
│   │   ├── pages/          # Page components
│   │   │   ├── Home.js/css
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── CreateEvent.js
│   │   │   ├── EditEvent.js
│   │   │   ├── MyEvents.js/css
│   │   │   ├── Welcome.js/css
│   │   │   └── Auth.css (shared)
│   │   ├── utils/          # Utility functions
│   │   │   └── calendarUtils.js
│   │   ├── App.js          # Main app component
│   │   ├── App.css
│   │   ├── index.js        # Entry point
│   │   └── index.css       # Global styles
│   ├── package.json
│   └── package-lock.json
│
├── server/                 # Express backend application
│   ├── middleware/
│   │   ├── auth.js         # JWT authentication middleware
│   │   └── upload.js       # File upload configuration (Multer)
│   ├── models/             # Mongoose schemas
│   │   ├── User.js
│   │   └── Event.js
│   ├── routes/             # API routes
│   │   ├── auth.js         # Authentication routes
│   │   ├── events.js       # Event CRUD routes
│   │   ├── rsvp.js         # RSVP routes
│   │   └── calendar.js     # Calendar export routes
│   ├── uploads/            # Uploaded event images
│   │   └── .gitkeep
│   ├── server.js           # Main server file
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore              # Git ignore rules
├── README.md               # Main documentation
├── render.yaml             # Render.com deployment config
├── railway.json            # Railway.app deployment config
├── vercel.json             # Vercel deployment config
└── netlify.toml            # Netlify deployment config
```

## Key Files

### Frontend (client/)
- **App.js**: Main application component with routing
- **components/**: Reusable UI components
- **pages/**: Full page components
- **context/**: React Context for global state (auth, theme)
- **utils/**: Helper functions (calendar utilities)

### Backend (server/)
- **server.js**: Express server setup and configuration
- **routes/**: API endpoint handlers
- **models/**: Database schemas (Mongoose)
- **middleware/**: Custom middleware (auth, file upload)
- **uploads/**: Directory for uploaded images (gitignored except .gitkeep)

### Configuration Files
- **.gitignore**: Files/directories to exclude from git
- **render.yaml**: Render.com deployment configuration
- **railway.json**: Railway.app deployment configuration
- **vercel.json**: Vercel deployment configuration
- **netlify.toml**: Netlify deployment configuration

