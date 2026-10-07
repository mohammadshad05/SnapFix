const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');

// GET all tickets
router.get('/', async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (err) {
    console.error("X FETCH ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST create ticket
router.post('/', async (req, res) => {
  try {
    const { title, category, location, priority } = req.body;

    const newTicket = await Ticket.create({
      title: title || 'Untitled Issue',
      category: category || 'Other',
      location: location || 'General',
      priority: priority || 'Medium',
      status: 'Pending'
    });

    console.log("✔ TICKET CREATED:", newTicket._id);
    return res.status(201).json(newTicket);
  } catch (err) {
    console.error("X CREATE ERROR:", err.message);
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;