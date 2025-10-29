const express = require('express');
const app = express();

app.use(express.json());

// In-memory data storage
let bookings = [
  { id: 1, name: "Karthik", event: "Synergia 2025", email: "Karthik@example.com" },
  { id: 2, name: "Alex", event: "Synergia 2025", email: "alex@example.com" }
];

// 1️⃣ GET – View all bookings
app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

// 2️⃣ POST – Register for the event
app.post('/api/bookings', (req, res) => {
  const newBooking = {
    id: bookings.length + 1,
    ...req.body
  };
  bookings.push(newBooking);
  res.status(201).json(newBooking);
});

// 3️⃣ GET – View a specific booking by ID
app.get('/api/bookings/:id', (req, res) => {
  const booking = bookings.find(b => b.id == req.params.id);
  if (booking) res.json(booking);
  else res.status(404).send("Booking not found");
});

// 4️⃣ PUT – Update participant details
app.put('/api/bookings/:id', (req, res) => {
  const index = bookings.findIndex(b => b.id == req.params.id);
  if (index !== -1) {
    bookings[index] = { id: bookings[index].id, ...req.body };
    res.json(bookings[index]);
  } else {
    res.status(404).send("Booking not found");
  }
});

// 5️⃣ DELETE – Cancel a booking
app.delete('/api/bookings/:id', (req, res) => {
  const index = bookings.findIndex(b => b.id == req.params.id);
  if (index !== -1) {
    const deleted = bookings.splice(index, 1);
    res.json(deleted[0]);
  } else {
    res.status(404).send("Booking not found");
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Synergia Event Booking API running on port 3000");
});