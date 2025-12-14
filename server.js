const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// Настройка CORS (проверенная рабочая конфигурация)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
  credentials: false,
  optionsSuccessStatus: 204
}));

// Обязательно: обработка OPTIONS-запросов ДО всех других middleware
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 часа кэширования preflight
  res.sendStatus(204);
});

// Важно: после CORS добавляем body-parser
app.use(express.json());

// Хранилище комнат (в памяти)
const rooms = new Map();

// POST /signal/:room — отправить сигнал
app.post('/signal/:room', (req, res) => {
  const { room } = req.params;
  
  if (!rooms.has(room)) {
    rooms.set(room, []);
    setTimeout(() => rooms.delete(room), 10 * 60 * 1000);
  }

  rooms.get(room).push(req.body);
  res.status(200).json({ ok: true });
});

// GET /signal/:room — получить сигналы
app.get('/signal/:room', (req, res) => {
  const { room } = req.params;
  const signals = rooms.has(room) ? rooms.get(room) : [];
  
  // Удаляем комнату только если есть сигналы
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
