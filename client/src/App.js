import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import MyEvents from './pages/MyEvents';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/events" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/create-event"
                  element={
                    <PrivateRoute>
                      <CreateEvent />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/edit-event/:id"
                  element={
                    <PrivateRoute>
                      <EditEvent />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/my-events"
                  element={
                    <PrivateRoute>
                      <MyEvents />
                    </PrivateRoute>
                  }
                />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

