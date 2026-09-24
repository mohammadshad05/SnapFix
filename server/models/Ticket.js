const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  title: String,
  category: String,
  location: String,
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'Urgent'],
    default: 'Medium',
  },
  status: {
    type: String,
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Ticket', TicketSchema);