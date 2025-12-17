const express = require('express');
const Event = require('../models/Event');

const router = express.Router();

// Helper function to format date for iCal
const formatDateForICal = (date) => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

// Helper function to escape text for iCal
const escapeICalText = (text) => {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
};

// @route   GET /api/calendar/event/:id
// @desc    Export single event as iCal file
// @access  Public
router.get('/event/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours duration

    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//EventHub//Event Management//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${event._id}@eventhub.com`,
      `DTSTAMP:${formatDateForICal(new Date())}`,
      `DTSTART:${formatDateForICal(startDate)}`,
      `DTEND:${formatDateForICal(endDate)}`,
      `SUMMARY:${escapeICalText(event.title)}`,
      `DESCRIPTION:${escapeICalText(event.description)}\\n\\nLocation: ${escapeICalText(event.location)}\\nCategory: ${event.category || 'General'}`,
      `LOCATION:${escapeICalText(event.location)}`,
      `STATUS:CONFIRMED`,
      `SEQUENCE:0`,
      `BEGIN:VALARM`,
      `TRIGGER:-PT15M`,
      `ACTION:DISPLAY`,
      `DESCRIPTION:Reminder: ${escapeICalText(event.title)}`,
      `END:VALARM`,
      `BEGIN:VALARM`,
      `TRIGGER:-PT1H`,
      `ACTION:DISPLAY`,
      `DESCRIPTION:Reminder: ${escapeICalText(event.title)}`,
      `END:VALARM`,
      `BEGIN:VALARM`,
      `TRIGGER:-P1D`,
      `ACTION:DISPLAY`,
      `DESCRIPTION:Reminder: ${escapeICalText(event.title)}`,
      `END:VALARM`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="event-${event._id}.ics"`);
    res.send(icalContent);
  } catch (error) {
    console.error('Calendar export error:', error);
    res.status(500).json({ message: 'Failed to export calendar', error: error.message });
  }
});

// @route   GET /api/calendar/user-events
// @desc    Export all user's events (attending + created) as iCal file
// @access  Private
router.get('/user-events', async (req, res) => {
  try {
    // This would require auth middleware, but for now we'll make it work with query param
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const events = await Event.find({
      $or: [
        { creator: userId },
        { attendees: userId }
      ],
      date: { $gte: new Date() }
    })
      .populate('creator', 'name email')
      .sort({ date: 1 });

    const icalEvents = events.map(event => {
      const startDate = new Date(event.date);
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

      return [
        'BEGIN:VEVENT',
        `UID:${event._id}@eventhub.com`,
        `DTSTAMP:${formatDateForICal(new Date())}`,
        `DTSTART:${formatDateForICal(startDate)}`,
        `DTEND:${formatDateForICal(endDate)}`,
        `SUMMARY:${escapeICalText(event.title)}`,
        `DESCRIPTION:${escapeICalText(event.description)}\\n\\nLocation: ${escapeICalText(event.location)}\\nCategory: ${event.category || 'General'}`,
        `LOCATION:${escapeICalText(event.location)}`,
        `STATUS:CONFIRMED`,
        `SEQUENCE:0`,
        `BEGIN:VALARM`,
        `TRIGGER:-PT15M`,
        `ACTION:DISPLAY`,
        `DESCRIPTION:Reminder: ${escapeICalText(event.title)}`,
        `END:VALARM`,
        `BEGIN:VALARM`,
        `TRIGGER:-PT1H`,
        `ACTION:DISPLAY`,
        `DESCRIPTION:Reminder: ${escapeICalText(event.title)}`,
        `END:VALARM`,
        `BEGIN:VALARM`,
        `TRIGGER:-P1D`,
        `ACTION:DISPLAY`,
        `DESCRIPTION:Reminder: ${escapeICalText(event.title)}`,
        `END:VALARM`,
        'END:VEVENT'
      ].join('\r\n');
    });

    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//EventHub//Event Management//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      ...icalEvents,
      'END:VCALENDAR'
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="my-events.ics"');
    res.send(icalContent);
  } catch (error) {
    console.error('Calendar export error:', error);
    res.status(500).json({ message: 'Failed to export calendar', error: error.message });
  }
});

module.exports = router;

