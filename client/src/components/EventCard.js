import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  generateGoogleCalendarUrl, 
  generateOutlookCalendarUrl, 
  generateYahooCalendarUrl,
  downloadICalFile,
  requestNotificationPermission,
  scheduleEventReminders
} from '../utils/calendarUtils';
import './EventCard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const EventCard = ({ event, user, onRSVP, onCancelRSVP, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showCalendarMenu, setShowCalendarMenu] = useState(false);
  const menuRef = useRef(null);
  const calendarMenuRef = useRef(null);
  const userId = user?._id || user?.id;
  const isAttending = user && event.attendees.some(attendee => 
    (typeof attendee === 'object' ? attendee._id : attendee) === userId
  );
  const isCreator = user && event.creator._id === userId;
  const isFull = event.attendees.length >= event.capacity;
  const availableSpots = event.capacity - event.attendees.length;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
      if (calendarMenuRef.current && !calendarMenuRef.current.contains(event.target)) {
        setShowCalendarMenu(false);
      }
    };

    if (showMenu || showCalendarMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu, showCalendarMenu]);

  // Schedule reminders when user RSVPs
  useEffect(() => {
    if (isAttending && user) {
      requestNotificationPermission().then(hasPermission => {
        if (hasPermission) {
          scheduleEventReminders(event);
        }
      });
    }
  }, [isAttending, event, user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      onDelete(event._id);
      setShowMenu(false);
    }
  };

  const handleAddToCalendar = async (type) => {
    setShowCalendarMenu(false);
    
    try {
      if (type === 'google') {
        window.open(generateGoogleCalendarUrl(event), '_blank');
      } else if (type === 'outlook') {
        window.open(generateOutlookCalendarUrl(event), '_blank');
      } else if (type === 'yahoo') {
        window.open(generateYahooCalendarUrl(event), '_blank');
      } else if (type === 'ical') {
        await downloadICalFile(event._id, API_URL);
      }
    } catch (error) {
      console.error('Error adding to calendar:', error);
      alert('Failed to add event to calendar. Please try again.');
    }
  };

  // Calendar SVG Icon
  const CalendarIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  // Three Dots Menu Icon
  const MenuIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
      <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
    </svg>
  );

  // Edit Icon
  const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.5 2.50023C18.8978 2.10243 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.10243 21.5 2.50023C21.8978 2.89804 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.10243 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  // Delete Icon
  const DeleteIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  // Calendar Add Icon
  const CalendarAddIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 14H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const imageUrl = event.image 
    ? (event.image.startsWith('http') ? event.image : `${API_URL.replace('/api', '')}${event.image}`)
    : 'https://via.placeholder.com/400x200?text=No+Image';

  return (
    <div className="event-card">
      {event.image && (
        <div className="event-image">
          <img src={imageUrl} alt={event.title} />
        </div>
      )}
      <div className="event-content">
        <div className="event-header">
          <div className="event-header-content">
            <h3 className="event-title">{event.title}</h3>
            {event.category && (
              <span className="event-category">{event.category}</span>
            )}
          </div>
          {isCreator && (
            <div className="event-menu" ref={menuRef}>
              <button
                className="menu-trigger"
                onClick={() => setShowMenu(!showMenu)}
                aria-label="Event options"
              >
                <MenuIcon />
              </button>
              {showMenu && (
                <div className="menu-dropdown">
                  <Link
                    to={`/edit-event/${event._id}`}
                    className="menu-item"
                    onClick={() => setShowMenu(false)}
                  >
                    <EditIcon />
                    <span>Edit</span>
                  </Link>
                  <button
                    className="menu-item menu-item-danger"
                    onClick={handleDelete}
                  >
                    <DeleteIcon />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <p className="event-description">{event.description}</p>
        <div className="event-details">
          <div className="event-detail">
            <span className="detail-icon">
              <CalendarIcon />
            </span>
            <strong>Date:</strong> {formatDate(event.date)}
          </div>
          <div className="event-detail">
            <strong>Location:</strong> {event.location}
          </div>
          <div className="event-detail">
            <strong>Capacity:</strong> {event.attendees.length} / {event.capacity}
          </div>
          {isFull && (
            <div className="event-full">Event is Full</div>
          )}
          {!isFull && availableSpots > 0 && (
            <div className="event-spots">{availableSpots} spot(s) available</div>
          )}
        </div>
        <div className="event-actions">
          <div className="event-actions-left">
            {isCreator ? (
              <>
                <Link to={`/edit-event/${event._id}`} className="btn btn-edit">
                  Edit
                </Link>
              </>
            ) : user ? (
              isAttending ? (
                <button
                  onClick={() => onCancelRSVP(event._id)}
                  className="btn btn-cancel"
                >
                  Cancel RSVP
                </button>
              ) : (
                <button
                  onClick={() => onRSVP(event._id)}
                  className="btn btn-rsvp"
                  disabled={isFull}
                >
                  {isFull ? 'Full' : 'RSVP'}
                </button>
              )
            ) : (
              <Link to="/login" className="btn btn-rsvp">
                Login to RSVP
              </Link>
            )}
          </div>
          {user && (
            <div className="calendar-menu-wrapper" ref={calendarMenuRef}>
              <button
                className="btn btn-calendar"
                onClick={() => setShowCalendarMenu(!showCalendarMenu)}
                title="Add to Calendar"
              >
                <CalendarAddIcon />
                <span>Add to Calendar</span>
              </button>
              {showCalendarMenu && (
                <div className="calendar-dropdown">
                  <button
                    className="calendar-option"
                    onClick={() => handleAddToCalendar('google')}
                  >
                    📅 Google Calendar
                  </button>
                  <button
                    className="calendar-option"
                    onClick={() => handleAddToCalendar('outlook')}
                  >
                    📅 Outlook
                  </button>
                  <button
                    className="calendar-option"
                    onClick={() => handleAddToCalendar('yahoo')}
                  >
                    📅 Yahoo Calendar
                  </button>
                  <button
                    className="calendar-option"
                    onClick={() => handleAddToCalendar('ical')}
                  >
                    📥 Download .ics File
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;

