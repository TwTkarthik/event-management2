// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json()); // Enable JSON body parsing

// ✅ MongoDB Connection
const connectDb = "mongodb+srv://karthik:karthik123@cluster0.abcdef.mongodb.net/test";
mongoose.connect(connectDb)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Booking Schema & Model
const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  event: { type: String, required: true },
  phone: { type: String },
  seats: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);

// ✅ Helper function for validation
function validateBooking(body) {
  const { name, email, event } = body;
  if (!name || !email || !event) return { ok: false, message: 'name, email and event are required' };
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) return { ok: false, message: 'invalid email format' };
  return { ok: true };
}

/* ------------------------------------------------------------------
   ROUTES
------------------------------------------------------------------ */

// 🔵 Health Check
app.get('/', (req, res) => {
  res.send('Synergia Event Booking API (MongoDB Version) is up 🚀');
});

/* 1️⃣ GET /api/bookings - List all bookings */
app.get('/api/bookings', async (req, res) => {
  try {
    const { limit, skip } = req.query;
    const query = Booking.find();

    if (skip) query.skip(parseInt(skip));
    if (limit) query.limit(parseInt(limit));

    const bookings = await query.exec();
    res.json({ count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* 2️⃣ POST /api/bookings - Create new booking */
app.post('/api/bookings', async (req, res) => {
  try {
    const validation = validateBooking(req.body);
    if (!validation.ok) return res.status(400).json({ error: validation.message });

    const { name, email, event, phone, seats } = req.body;

    const newBooking = new Booking({
      name,
      email,
      event,
      phone,
      seats,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const saved = await newBooking.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* 3️⃣ GET /api/bookings/:id - Get booking by ID */
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Invalid ID format or internal error' });
  }
});

/* 4️⃣ PUT /api/bookings/:id - Update booking */
app.put('/api/bookings/:id', async (req, res) => {
  try {
    const { name, email, event, phone, seats } = req.body;

    if (email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) return res.status(400).json({ error: 'invalid email format' });
    }

    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { name, email, event, phone, seats, updatedAt: new Date() },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking updated successfully', booking: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* 5️⃣ DELETE /api/bookings/:id - Cancel booking */
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking cancelled successfully', deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* 6️⃣ DELETE /api/bookings - Clear all bookings (for testing only) */
app.delete('/api/bookings', async (req, res) => {
  try {
    const count = await Booking.countDocuments();
    await Booking.deleteMany({});
    res.json({ message: 'Cleared {count} bookings from MongoDB' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ------------------------------------------------------------------
   SERVER START
------------------------------------------------------------------ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('🚀 Server running at http://localhost:3000'));