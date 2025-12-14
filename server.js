const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000; // Render требует 10000

app.use(cors());
app.use(express.json());

const rooms = new Map();

// POST /signal/:room — отправить сигнал
app.post('/signal/:room', (req, res) => {
  const { room } = req.params;
  
  // Если комнаты нет — создать и запланировать автоочистку
  if (!rooms.has(room)) {
    rooms.set(room, []);
    // Удалим комнату через 10 минут (600 000 мс)
    setTimeout(() => {
      rooms.delete(room);
      console.log(`🗑️ Комната ${room} удалена (автоочистка)`);
    }, 10 * 60 * 1000);
  }

  rooms.get(room).push(req.body);
  res.json({ ok: true });
});

// GET /signal/:room — получить сигналы (без удаления!)
app.get('/signal/:room', (req, res) => {
  const { room } = req.params;
  if (!rooms.has(room)) {
    return res.json([]); // Если комнаты нет — вернуть пустой массив
  }
  const signals = rooms.get(room);
  res.json(signals || []); // На всякий случай — если signals undefined
});

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'WebRTC Signal Server v1.0' });
});

app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
});
