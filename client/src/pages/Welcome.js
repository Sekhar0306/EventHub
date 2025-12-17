import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Welcome.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const Welcome = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ total: 0, nextEvent: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      // Only fetch stats if user is logged in
      if (!user) {
        setStats({ total: 0, nextEvent: null });
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/events`);
        const events = res.data || [];
        const nextEvent = events.length ? events[0] : null;
        setStats({ total: events.length, nextEvent });
      } catch (err) {
        setStats({ total: 0, nextEvent: null });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const features = [
    {
      title: 'Create & Manage Events',
      desc: 'Design beautiful event pages with images, capacity limits, and schedules.',
    },
    {
      title: 'RSVP & Attendance',
      desc: 'Track attendees, manage capacity, and see who is coming in real-time.',
    },
    {
      title: 'Search & Filter',
      desc: 'Find the right event by category, date range, or keyword in seconds.',
    },
    {
      title: 'My Dashboard',
      desc: 'See events you created and events you are attending in one place.',
    },
  ];

  return (
    <div className="welcome-page">
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Community Events, Simplified</p>
          <h1>Plan, share, and discover events effortlessly.</h1>
          <p className="subtitle">
            EventHub helps you create engaging events, invite attendees, and keep everyone in sync.
            Perfect for meetups, workshops, conferences, and community gatherings.
          </p>
          <div className="hero-actions">
            <Link to="/events" className="hero-btn primary">Browse Events</Link>
            <Link to="/register" className="hero-btn secondary">Create an Account</Link>
            <Link to="/login" className="hero-btn ghost">Sign In</Link>
          </div>
          {user && (
            <div className="hero-stats">
              <div className="stat-card">
                <span className="stat-value">
                  {loading ? '—' : stats.total}
                </span>
                <span className="stat-label">Upcoming Events</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">
                  {loading || !stats.nextEvent ? '—' : new Date(stats.nextEvent.date).toLocaleDateString()}
                </span>
                <span className="stat-label">
                  {loading || !stats.nextEvent ? 'Next Event' : stats.nextEvent.title}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="hero-visual">
          <div className="gradient-card">
            <h3>Why EventHub?</h3>
            <ul>
              <li>Modern UI with responsive design</li>
              <li>Secure authentication and private dashboards</li>
              <li>Powerful search and filters for public discovery</li>
              <li>Image uploads for event branding</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Built for public events</h2>
        <p className="section-subtitle">Everything you need to host and promote events that scale.</p>
        <div className="feature-grid">
          {features.map((feature) => (
            <div key={feature.title} className="feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta">
        <div className="cta-card">
          <div>
            <p className="eyebrow">Get Started</p>
            <h3>Launch your next event today.</h3>
            <p>Sign up, create your event, and share it with the world in minutes.</p>
          </div>
          <div className="cta-actions">
            <Link to="/register" className="hero-btn primary">Start for Free</Link>
            <Link to="/events" className="hero-btn secondary">Explore Events</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Welcome;

