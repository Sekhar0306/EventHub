// Utility functions for calendar integration

// Generate Google Calendar URL
export const generateGoogleCalendarUrl = (event) => {
  const startDate = new Date(event.date);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: `${event.description}\n\nLocation: ${event.location}\nCategory: ${event.category || 'General'}`,
    location: event.location,
    sf: 'true',
    output: 'xml'
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

// Generate Outlook Calendar URL
export const generateOutlookCalendarUrl = (event) => {
  const startDate = new Date(event.date);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    subject: event.title,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    body: `${event.description}\n\nLocation: ${event.location}\nCategory: ${event.category || 'General'}`,
    location: event.location
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

// Generate Yahoo Calendar URL
export const generateYahooCalendarUrl = (event) => {
  const startDate = new Date(event.date);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  const formatDate = (date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}00`;
  };

  const params = new URLSearchParams({
    v: '60',
    view: 'd',
    type: '20',
    title: event.title,
    st: formatDate(startDate),
    dur: '0200',
    desc: `${event.description}\n\nLocation: ${event.location}`,
    in_loc: event.location
  });

  return `https://calendar.yahoo.com/?${params.toString()}`;
};

// Download iCal file
export const downloadICalFile = async (eventId, API_URL) => {
  try {
    const response = await fetch(`${API_URL}/calendar/event/${eventId}`);
    if (!response.ok) throw new Error('Failed to download calendar file');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-${eventId}.ics`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading calendar file:', error);
    throw error;
  }
};

// Request browser notification permission
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Show browser notification
export const showNotification = (title, options = {}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const notification = new Notification(title, {
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    ...options
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  return notification;
};

// Schedule event reminders
export const scheduleEventReminders = (event) => {
  const eventDate = new Date(event.date);
  const now = new Date();

  // Don't schedule reminders for past events
  if (eventDate <= now) {
    return;
  }

  // 1 day before reminder
  const oneDayBefore = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);
  if (oneDayBefore > now) {
    const delay = oneDayBefore.getTime() - now.getTime();
    setTimeout(() => {
      showNotification(`Event Reminder: ${event.title}`, {
        body: `Your event "${event.title}" is tomorrow at ${eventDate.toLocaleString()}`,
        tag: `event-${event._id}-1day`
      });
    }, delay);
  }

  // 1 hour before reminder
  const oneHourBefore = new Date(eventDate.getTime() - 60 * 60 * 1000);
  if (oneHourBefore > now) {
    const delay = oneHourBefore.getTime() - now.getTime();
    setTimeout(() => {
      showNotification(`Event Reminder: ${event.title}`, {
        body: `Your event "${event.title}" starts in 1 hour at ${eventDate.toLocaleString()}`,
        tag: `event-${event._id}-1hour`
      });
    }, delay);
  }

  // 15 minutes before reminder
  const fifteenMinBefore = new Date(eventDate.getTime() - 15 * 60 * 1000);
  if (fifteenMinBefore > now) {
    const delay = fifteenMinBefore.getTime() - now.getTime();
    setTimeout(() => {
      showNotification(`Event Starting Soon: ${event.title}`, {
        body: `Your event "${event.title}" starts in 15 minutes!`,
        tag: `event-${event._id}-15min`
      });
    }, delay);
  }
};

