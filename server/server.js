const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Auth & Ticket Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fixit_desk')
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

// Existing Ticket Routes
const Ticket = require('./models/Ticket');

app.get('/api/tickets', async (req, res) => {
  const tickets = await Ticket.find().sort({ createdAt: -1 });
  res.json(tickets);
});

app.post('/api/tickets', async (req, res) => {
  const newTicket = new Ticket(req.body);
  await newTicket.save();
  res.json(newTicket);
});

app.patch('/api/tickets/:id', async (req, res) => {
  const updatedTicket = await Ticket.findByIdAndUpdate(
    req.params.id,
    { status: 'Resolved' },
    { new: true }
  );
  res.json(updatedTicket);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));