# Event Management Application

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) application that allows users to create, view, and RSVP to events with robust capacity management and concurrency handling.

## Features Implemented

### Core Features
- ✅ **User Authentication**: Secure registration and login with JWT token-based authentication
- ✅ **Event Management**: Full CRUD operations (Create, Read, Update, Delete) for events
- ✅ **Image Upload**: Users can upload event images which are displayed on the frontend
- ✅ **RSVP System**: Users can join and leave events with strict capacity enforcement
- ✅ **Capacity Management**: Real-time capacity tracking and enforcement
- ✅ **Concurrency Handling**: Race condition prevention for simultaneous RSVP requests
- ✅ **Authorization**: Users can only edit/delete events they created
- ✅ **Responsive Design**: Fully responsive UI that works seamlessly on Desktop, Tablet, and Mobile devices
- ✅ **User Dashboard**: Private page showing events created by user and events user is attending

### Technical Features
- JWT-based stateless authentication
- MongoDB with Mongoose ODM
- Express.js RESTful API
- React Router for client-side routing
- Context API for state management
- Multer for file uploads
- Atomic database operations for concurrency control

## Prerequisites

Before running this application, make sure you have the following installed:
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB instance)

## Local Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Mern Project"
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create a .env file in the server directory
# Copy the .env.example and fill in your values:
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

**Important**: 
- Replace `your_mongodb_atlas_connection_string` with your MongoDB Atlas connection string
- Replace `your_jwt_secret_key_here` with a strong, random secret key for JWT signing

### 3. Frontend Setup

```bash
# Navigate to client directory (from project root)
cd client

# Install dependencies
npm install

# Create a .env file in the client directory (optional)
# Only needed if your backend runs on a different URL
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

### 4. Create Uploads Directory

```bash
# From the server directory
mkdir uploads
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm start
# or for development with auto-reload:
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Deployment Instructions

### Backend Deployment (Render/Railway)

1. **Prepare for deployment:**
   - Ensure all environment variables are set in your hosting platform
   - Make sure `uploads` directory is handled (consider using cloud storage like AWS S3 for production)

2. **Render:**
   - Connect your GitHub repository
   - Set build command: `cd server && npm install`
   - Set start command: `cd server && npm start`
   - Add environment variables in Render dashboard

3. **Railway:**
   - Connect your repository
   - Set root directory to `server`
   - Add environment variables in Railway dashboard

### Frontend Deployment (Vercel/Netlify)

1. **Update API URL:**
   - Create `.env.production` file in client directory:
   ```
   REACT_APP_API_URL=https://your-backend-url.com/api
   ```

2. **Vercel:**
   - Connect your GitHub repository
   - Set root directory to `client`
   - Build command: `npm run build`
   - Output directory: `build`

3. **Netlify:**
   - Connect your GitHub repository
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/build`

### Database Setup (MongoDB Atlas)

1. Create a free MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for all IPs during development)
5. Get your connection string and add it to your backend `.env` file

## Technical Explanation: RSVP Capacity and Concurrency Handling

### Problem Statement

When multiple users attempt to RSVP simultaneously to an event that has only one remaining spot, a race condition can occur. Without proper handling, the system might allow more users to RSVP than the event capacity allows, resulting in overbooking.

### Solution Strategy

The application uses **MongoDB Transactions** combined with **Atomic Operations** to ensure data consistency and prevent race conditions. Here's the detailed approach:

#### 1. MongoDB Transactions

The RSVP endpoint (`/api/rsvp/:eventId`) uses MongoDB sessions and transactions to ensure atomicity:

```javascript
const session = await mongoose.startSession();
session.startTransaction();
```

This ensures that all database operations within the transaction either complete successfully or are rolled back entirely.

#### 2. Atomic Find and Update

The critical section uses `findByIdAndUpdate` with the session to perform an atomic check-and-update operation:

```javascript
const event = await Event.findById(eventId).session(session);

// Capacity check
if (event.attendees.length >= event.capacity) {
  await session.abortTransaction();
  return res.status(400).json({ message: 'Event is at full capacity' });
}

// Atomic update using $addToSet (prevents duplicates)
const updatedEvent = await Event.findByIdAndUpdate(
  eventId,
  { $addToSet: { attendees: userId } },
  { new: true, session: session }
);
```

**Key Points:**
- `$addToSet` operator ensures no duplicate RSVPs (idempotent operation)
- The session ensures the read and write operations are part of the same transaction
- If the transaction fails, all changes are rolled back

#### 3. Defense in Depth

After the atomic update, a final capacity check is performed:

```javascript
if (updatedEvent.attendees.length > updatedEvent.capacity) {
  await session.abortTransaction();
  return res.status(400).json({ message: 'Event capacity exceeded' });
}
```

This provides an additional safety check, though the atomic operation should prevent this scenario.

#### 4. Transaction Commit/Rollback

```javascript
await session.commitTransaction();
session.endSession();
```

If any error occurs during the process, the transaction is aborted:

```javascript
catch (error) {
  await session.abortTransaction();
  session.endSession();
  // Handle error
}
```

### Why This Approach Works

1. **Isolation**: MongoDB transactions provide isolation, ensuring that concurrent operations don't interfere with each other
2. **Atomicity**: The entire RSVP operation (read capacity, check, update) happens atomically
3. **Consistency**: If the capacity check fails or any error occurs, the transaction is rolled back, maintaining data consistency
4. **No Duplicates**: `$addToSet` ensures that even if a user somehow sends duplicate requests, they won't be added twice

### Alternative Approaches Considered

1. **Optimistic Locking**: Using version numbers - rejected due to complexity and potential for retry loops
2. **Pessimistic Locking**: Using database locks - rejected due to performance concerns
3. **Application-level Locking**: Using Redis or in-memory locks - rejected as it adds infrastructure complexity

The chosen MongoDB transaction approach provides the best balance of correctness, performance, and simplicity for this use case.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Events
- `GET /api/events` - Get all upcoming events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (protected)
- `PUT /api/events/:id` - Update event (protected, creator only)
- `DELETE /api/events/:id` - Delete event (protected, creator only)

### RSVP
- `POST /api/rsvp/:eventId` - RSVP to event (protected)
- `DELETE /api/rsvp/:eventId` - Cancel RSVP (protected)
- `GET /api/rsvp/my-events` - Get user's events (protected)

## Project Structure

```
Mern Project/
├── server/
│   ├── models/
│   │   ├── User.js
│   │   └── Event.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── events.js
│   │   └── rsvp.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── uploads/
│   ├── server.js
│   └── package.json
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── App.js
│   └── package.json
└── README.md
```

## Technologies Used

- **Backend:**
  - Node.js
  - Express.js
  - MongoDB with Mongoose
  - JWT (jsonwebtoken)
  - bcryptjs (password hashing)
  - Multer (file uploads)
  - express-validator (input validation)

- **Frontend:**
  - React.js
  - React Router DOM
  - Axios (HTTP client)
  - Context API (state management)

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected routes (authentication required)
- Input validation on both client and server
- File upload validation (type and size)
- CORS configuration
- Environment variables for sensitive data

## Future Enhancements (Optional)

- AI-powered event description generation
- Search and filter functionality
- Event categories/tags
- Email notifications for RSVPs
- Dark mode toggle
- Advanced form validation with real-time feedback
- Image optimization and cloud storage integration
- Event comments and ratings

## License

This project is created for assessment purposes.

## Contact

For questions or issues, please refer to the repository or contact the development team.


