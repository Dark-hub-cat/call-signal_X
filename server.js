const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// Настройка CORS с полной поддержкой всех заголовков
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Cache-Control',
    'expires', // ← Критически важный заголовок
    'x-requested-with'
  ],
  credentials: false,
  optionsSuccessStatus: 204
}));

// Обработка OPTIONS-запросов (pre-flight)
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, expires, x-requested-with');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.sendStatus(204);
});

app.use(express.json());

// Хранилище комнат
const rooms = new Map();

// POST /signal/:room
app.post('/signal/:room', (req, res) => {
  const { room } = req.params;
  
  if (!rooms.has(room)) {
    rooms.set(room, []);
    setTimeout(() => rooms.delete(room), 10 * 60 * 1000);
  }

  rooms.get(room).push(req.body);
  res.status(200).json({ ok: true });
});

// GET /signal/:room
app.get('/signal/:room', (req, res) => {
  const { room } = req.params;
  const signals = rooms.has(room) ? rooms.get(room) : [];
  
  if (signals.length > 0) {
    rooms.delete(room);
  }
  
  res.status(200).json(signals);
});

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'WebRTC Signal Server v1.0' });
});

app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
});
