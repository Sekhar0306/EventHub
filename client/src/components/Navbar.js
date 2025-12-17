import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          EventHub
        </Link>
        <div className="navbar-menu">
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
            {isDark ? '☀️' : '🌙'}
          </button>
          {user ? (
            <>
              <Link to="/" className="navbar-link">Home</Link>
              <Link to="/events" className="navbar-link">Events</Link>
              <Link to="/create-event" className="navbar-link">Create Event</Link>
              <Link to="/my-events" className="navbar-link">My Events</Link>
              <span className="navbar-user">Hello, {user.name}</span>
              <button onClick={handleLogout} className="navbar-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="navbar-link">Home</Link>
              <Link to="/events" className="navbar-link">Events</Link>
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/register" className="navbar-button">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

