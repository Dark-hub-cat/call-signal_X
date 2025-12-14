const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors({
  origin: '*', // Разрешить всем
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Хранилище комнат (в памяти)
const rooms = new Map();

// POST /signal/:room — отправить сигнал (offer/answer/ice)
app.post('/signal/:room', (req, res) => {
  const { room } = req.params;
  
  // Если комнаты нет — создать
  if (!rooms.has(room)) {
    rooms.set(room, []);
    // Автоочистка через 10 минут
    setTimeout(() => {
      rooms.delete(room);
      console.log(`🗑️ Комната ${room} удалена`);
    }, 10 * 60 * 1000);
  }

  // Добавляем сигнал
  rooms.get(room).push(req.body);

  // Ответ
  res.status(200).json({ ok: true });
});

// GET /signal/:room — получить все непрочитанные сигналы
app.get('/signal/:room', (req, res) => {
  const { room } = req.params;
  
  // Если комнаты нет — вернуть пустой массив
  if (!rooms.has(room)) {
    return res.status(200).json([]);
  }

  // Получаем сигналы
  const signals = rooms.get(room);
  rooms.delete(room); // ← Удаляем комнату после первого чтения
  // Возвращаем сигналы, но НЕ удаляем комнату
  // Комнату удалим через setTimeout при создании
  res.status(200).json(signals || []);
});

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'WebRTC Signal Server v1.0' });
});

// Обработка ошибок (на всякий случай)
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
});
