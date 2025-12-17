import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import CalendarView from '../components/CalendarView';
import './Home.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'calendar'
  const { user } = useContext(AuthContext);

  const categories = ['Technology', 'Business', 'Arts', 'Sports', 'Education', 'Food & Drink', 'Music', 'Networking', 'Other'];

  useEffect(() => {
    fetchEvents();
  }, []);

  // Auto-search on filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm || selectedCategory || startDate || endDate) {
        handleSearch();
      }
    }, 500); // Debounce search

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, startDate, endDate]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory, startDate, endDate, events]);

  const fetchEvents = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const res = await axios.get(`${API_URL}/events?${params.toString()}`);
      setEvents(res.data);
      setFilteredEvents(res.data);
    } catch (err) {
      setError('Failed to load events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];
    
    // Client-side filtering for immediate feedback
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }
    
    if (startDate) {
      filtered = filtered.filter(event => new Date(event.date) >= new Date(startDate));
    }
    
    if (endDate) {
      filtered = filtered.filter(event => new Date(event.date) <= new Date(endDate));
    }
    
    setFilteredEvents(filtered);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const res = await axios.get(`${API_URL}/events?${params.toString()}`);
      setEvents(res.data);
      setFilteredEvents(res.data);
    } catch (err) {
      setError('Failed to search events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setStartDate('');
    setEndDate('');
    fetchEvents();
  };

  const handleRSVP = async (eventId) => {
    if (!user) {
      alert('Please login to RSVP to events');
      return;
    }

    try {
      await axios.post(`${API_URL}/rsvp/${eventId}`);
      fetchEvents(); // Refresh events
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to RSVP');
    }
  };

  const handleCancelRSVP = async (eventId) => {
    try {
      await axios.delete(`${API_URL}/rsvp/${eventId}`);
      fetchEvents(); // Refresh events
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel RSVP');
    }
  };

  const handleDelete = async (eventId) => {
    try {
      await axios.delete(`${API_URL}/events/${eventId}`);
      fetchEvents(); // Refresh events
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete event');
    }
  };

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Upcoming Events</h1>
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            📋 Grid
          </button>
          <button
            className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            📅 Calendar
          </button>
        </div>
      </div>
      
      {/* Search and Filter Section */}
      {viewMode === 'grid' && (
        <div className="search-filter-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search events by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="search-btn">🔍 Search</button>
        </div>
        
        <div className="filters-row">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Start Date"
            className="filter-date"
          />
          
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="End Date"
            className="filter-date"
          />
          
          {(searchTerm || selectedCategory || startDate || endDate) && (
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          )}
        </div>
      </div>
      )}

      {viewMode === 'calendar' ? (
        <CalendarView events={filteredEvents} />
      ) : filteredEvents.length === 0 ? (
        <div className="no-events">
          {events.length === 0 
            ? 'No upcoming events at the moment.'
            : 'No events match your filters. Try adjusting your search criteria.'}
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((event) => (
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
    </div>
  );
};

export default Home;

