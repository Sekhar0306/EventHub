const express = require('express');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/rsvp/:eventId
// @desc    RSVP to an event
// @access  Private
router.post('/:eventId', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const eventId = req.params.eventId;
    const userId = req.user.userId;

    // Use findByIdAndUpdate with session for atomic operation
    const event = await Event.findById(eventId).session(session);
    
    if (!event) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is in the past
    if (new Date(event.date) < new Date()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Cannot RSVP to past events' });
    }

    // Check if user already RSVP'd
    // Convert userId to ObjectId for comparison
    const userIdObj = new mongoose.Types.ObjectId(userId);
    if (event.attendees.some(attendee => attendee.toString() === userIdObj.toString())) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'You have already RSVP\'d to this event' });
    }

    // Check capacity using atomic operation
    // This ensures that even if multiple requests come simultaneously,
    // only the correct number of users can RSVP
    if (event.attendees.length >= event.capacity) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Event is at full capacity' });
    }

    // Atomic update: add user to attendees array only if capacity allows
    // Using $addToSet ensures no duplicates
    // Using conditional update with $size check for better concurrency handling
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        $expr: { $lt: [{ $size: '$attendees' }, '$capacity'] },
        attendees: { $ne: userId }
      },
      {
        $addToSet: { attendees: userId }
      },
      {
        new: true,
        session: session
      }
    ).populate('creator', 'name email').populate('attendees', 'name email');

    // If update returned null, it means capacity was exceeded or user already RSVP'd
    if (!updatedEvent) {
      // Re-check the event to provide accurate error message
      const recheckEvent = await Event.findById(eventId).session(session);
      if (recheckEvent.attendees.some(attendee => attendee.toString() === userIdObj.toString())) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: 'You have already RSVP\'d to this event' });
      }
      if (recheckEvent.attendees.length >= recheckEvent.capacity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: 'Event is at full capacity' });
      }
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Unable to RSVP. Please try again.' });
    }

    // Final capacity check (defense in depth)
    if (updatedEvent.attendees.length > updatedEvent.capacity) {
      // Rollback if somehow we exceeded capacity
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Event capacity exceeded' });
    }

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: 'Successfully RSVP\'d to event',
      event: updatedEvent
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('RSVP error:', error);
    res.status(500).json({ message: 'Server error during RSVP' });
  }
});

// @route   DELETE /api/rsvp/:eventId
// @desc    Cancel RSVP to an event
// @access  Private
router.delete('/:eventId', auth, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.user.userId;

    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user has RSVP'd
    const userIdObj = new mongoose.Types.ObjectId(userId);
    if (!event.attendees.some(attendee => attendee.toString() === userIdObj.toString())) {
      return res.status(400).json({ message: 'You have not RSVP\'d to this event' });
    }

    // Remove user from attendees
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      {
        $pull: { attendees: userId }
      },
      { new: true }
    ).populate('creator', 'name email').populate('attendees', 'name email');

    res.json({
      message: 'RSVP cancelled successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Cancel RSVP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/rsvp/my-events
// @desc    Get events user is attending and created
// @access  Private
router.get('/my-events', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Events user created
    const createdEvents = await Event.find({ creator: userId })
      .populate('creator', 'name email')
      .populate('attendees', 'name email')
      .sort({ date: 1 });

    // Events user is attending (but didn't create)
    const attendingEvents = await Event.find({
      attendees: userId,
      creator: { $ne: userId }
    })
      .populate('creator', 'name email')
      .populate('attendees', 'name email')
      .sort({ date: 1 });

    res.json({
      created: createdEvents,
      attending: attendingEvents
    });
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

