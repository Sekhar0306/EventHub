import React, { useState } from 'react';
import './CalendarView.css';

const CalendarView = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(prevDate.getMonth() - 1);
      } else {
        newDate.setMonth(prevDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  const isToday = (date) => {
    if (!date) return false;
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <button onClick={() => navigateMonth('prev')} className="calendar-nav-btn">
          ←
        </button>
        <h2>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button onClick={() => navigateMonth('next')} className="calendar-nav-btn">
          →
        </button>
        <button onClick={goToToday} className="calendar-today-btn">
          Today
        </button>
      </div>

      <div className="calendar-grid">
        {/* Day names header */}
        {dayNames.map(day => (
          <div key={day} className="calendar-day-header">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const isCurrentDay = isToday(date);
          const isPast = date && date < today && !isCurrentDay;

          return (
            <div
              key={index}
              className={`calendar-day ${!date ? 'empty' : ''} ${isCurrentDay ? 'today' : ''} ${isPast ? 'past' : ''}`}
            >
              {date && (
                <>
                  <div className="calendar-day-number">{date.getDate()}</div>
                  <div className="calendar-day-events">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event._id}
                        className="calendar-event-dot"
                        title={event.title}
                        style={{
                          background: `linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)`
                        }}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="calendar-event-more">
                        +{dayEvents.length - 3}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Event list for selected month */}
      <div className="calendar-events-list">
        <h3>Events this Month</h3>
        {events
          .filter(event => {
            const eventDate = new Date(event.date);
            return (
              eventDate.getMonth() === currentDate.getMonth() &&
              eventDate.getFullYear() === currentDate.getFullYear()
            );
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map(event => (
            <div key={event._id} className="calendar-event-item">
              <div className="calendar-event-date">
                {new Date(event.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              <div className="calendar-event-info">
                <div className="calendar-event-title">{event.title}</div>
                <div className="calendar-event-location">{event.location}</div>
              </div>
            </div>
          ))}
        {events.filter(event => {
          const eventDate = new Date(event.date);
          return (
            eventDate.getMonth() === currentDate.getMonth() &&
            eventDate.getFullYear() === currentDate.getFullYear()
          );
        }).length === 0 && (
          <div className="calendar-no-events">No events this month</div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;

