const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'Urgent'], 
    default: 'Medium' 
  },
  status: { 
    type: String, 
    default: 'Pending' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Ticket', ticketSchema);