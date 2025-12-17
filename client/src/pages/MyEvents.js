import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import './MyEvents.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const MyEvents = () => {
  const [createdEvents, setCreatedEvents] = useState([]);
  const [attendingEvents, setAttendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const res = await axios.get(`${API_URL}/rsvp/my-events`);
      setCreatedEvents(res.data.created);
      setAttendingEvents(res.data.attending);
    } catch (err) {
      setError('Failed to load your events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (eventId) => {
    try {
      await axios.post(`${API_URL}/rsvp/${eventId}`);
      fetchMyEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to RSVP');
    }
  };

  const handleCancelRSVP = async (eventId) => {
    try {
      await axios.delete(`${API_URL}/rsvp/${eventId}`);
      fetchMyEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel RSVP');
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/events/${eventId}`);
      fetchMyEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete event');
    }
  };

  if (loading) {
    return <div className="loading">Loading your events...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="my-events-container">
      <h1>My Events</h1>

      <section className="events-section">
        <h2>Events I Created</h2>
        {createdEvents.length === 0 ? (
          <div className="no-events">
            <p>You haven't created any events yet.</p>
            <Link to="/create-event" className="create-link">
              Create Your First Event
            </Link>
          </div>
        ) : (
          <div className="events-grid">
            {createdEvents.map((event) => (
              <div key={event._id} className="event-card-wrapper">
                <EventCard
                  event={event}
                  user={user}
                  onRSVP={handleRSVP}
                  onCancelRSVP={handleCancelRSVP}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="events-section">
        <h2>Events I'm Attending</h2>
        {attendingEvents.length === 0 ? (
          <div className="no-events">
            <p>You're not attending any events yet.</p>
            <Link to="/events" className="create-link">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="events-grid">
            {attendingEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                user={user}
                onRSVP={handleRSVP}
                onCancelRSVP={handleCancelRSVP}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MyEvents;

