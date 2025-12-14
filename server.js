const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const rooms = new Map();

app.post('/signal/:room', (req, res) => {
  const { room } = req.params;
  if (!rooms.has(room)) rooms.set(room, []);
  rooms.get(room).push(req.body);
  setTimeout(() => rooms.delete(room), 10 * 60 * 1000);
  res.json({ ok: true });
});

app.get('/signal/:room', (req, res) => {
  const { room } = req.params;
  const signals = rooms.has(room) ? rooms.get(room) : [];
  rooms.delete(room);
  res.json(signals);
});

app.get('/', (req, res) => {
  res.json({ status: 'WebRTC Signal Server v1.0' });
});

app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
});