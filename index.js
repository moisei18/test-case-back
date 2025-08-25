const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const createItems = () => Array.from({ length: 1000001 }, (_, i) => i + 1);

let itemOrder = createItems();
let selectedItems = new Set();

app.get("/items", (req, res) => {
  const { page = 1, search = "" } = req.query;
  const limit = 20;
  const offset = (parseInt(page, 10) - 1) * limit;

  let filteredItems = itemOrder;
  if (search) {
    const s = String(search).trim();
    filteredItems = itemOrder.filter((id) => id.toString().includes(s));
  }

  const items = filteredItems.slice(offset, offset + limit);
  const hasMore = offset + limit < filteredItems.length;

  res.json({
    items: items.map((id) => ({ id })),
    hasMore,
    total: filteredItems.length,
  });
});

app.get("/selected", (req, res) => {
  res.json(Array.from(selectedItems));
});

app.post("/selected", (req, res) => {
  const arr = Array.isArray(req.body.selected) ? req.body.selected : [];
  selectedItems = new Set(arr.map((n) => Number(n)).filter(Number.isFinite));
  res.json({ ok: true });
});

app.post("/reorder", (req, res) => {
  const { fromId, toId, position = "after" } = req.body;

  if (
    typeof fromId !== "number" ||
    typeof toId !== "number" ||
    fromId === toId
  ) {
    return res.status(400).json({ error: "Invalid IDs" });
  }

  const fromIndex = itemOrder.indexOf(fromId);
  const toIndex = itemOrder.indexOf(toId);

  if (fromIndex === -1 || toIndex === -1) {
    return res.status(400).json({ error: "IDs not found" });
  }

  const [moved] = itemOrder.splice(fromIndex, 1);

  let insertIndex;
  if (position === "before") {
    insertIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
  } else {
    insertIndex = fromIndex < toIndex ? toIndex : toIndex + 1;
  }

  itemOrder.splice(insertIndex, 0, moved);

  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
