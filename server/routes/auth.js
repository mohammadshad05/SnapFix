const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fixit_desk_jwt_secret_key_99';

// Register API
router.post('/register', async (req, res) => {
  try {
    console.log("👉 REGISTER REQUEST RECEIVED:", req.body);
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'user',
    });

    console.log("✅ USER CREATED:", newUser.email);
    return res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    console.error("❌ REGISTER ERROR:", err.message);
    return res.status(500).json({ message: err.message });
  }
});

// Login API
router.post('/login', async (req, res) => {
  try {
    console.log("👉 LOGIN REQUEST RECEIVED:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials (User not found)' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials (Password incorrect)' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log("✅ LOGIN SUCCESSFUL:", user.email);
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ LOGIN ERROR:", err.message);
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;