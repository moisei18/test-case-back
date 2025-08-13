const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Создаем миллион элементов
const createItems = () => Array.from({ length: 1000001 }, (_, i) => i + 1);

// Состояние приложения
let itemOrder = createItems(); // порядок элементов
let selectedItems = new Set(); // выбранные элементы

// GET /items - получить элементы с фильтрацией и пагинацией
app.get("/items", (req, res) => {
  const { page = 1, search = "" } = req.query;
  const limit = 20;
  const offset = (parseInt(page) - 1) * limit;

  // Фильтрация
  let filteredItems = itemOrder;
  if (search) {
    filteredItems = itemOrder.filter((id) => id.toString().includes(search));
  }

  // Пагинация
  const items = filteredItems.slice(offset, offset + limit);
  const hasMore = offset + limit < filteredItems.length;

  res.json({
    items: items.map((id) => ({ id })),
    hasMore,
    total: filteredItems.length,
  });
});

// GET /selected - получить выбранные элементы
app.get("/selected", (req, res) => {
  res.json(Array.from(selectedItems));
});

// POST /selected - сохранить выбранные элементы
app.post("/selected", (req, res) => {
  selectedItems = new Set(req.body.selected || []);
  res.json({ ok: true });
});

// POST /reorder - сохранить новый порядок
app.post("/reorder", (req, res) => {
  const { fromIndex, toIndex } = req.body;

  if (
    fromIndex >= 0 &&
    toIndex >= 0 &&
    fromIndex < itemOrder.length &&
    toIndex < itemOrder.length
  ) {
    const item = itemOrder.splice(fromIndex, 1)[0];
    itemOrder.splice(toIndex, 0, item);
  }

  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
