const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));

// Hilfsfunktionen
function loadData() {
  return JSON.parse(fs.readFileSync('./backend/data.json', 'utf-8'));
}

function saveData(data) {
  fs.writeFileSync('./backend/data.json', JSON.stringify(data, null, 2));
}

// API: Alle Kisten
app.get('/api/kisten', (req, res) => {
  const data = loadData();
  res.json(data.kisten);
});

// API: Eine Kiste anzeigen
app.get('/api/kiste/:id', (req, res) => {
  const data = loadData();
  const box = data.kisten.find(k => k.id === req.params.id);
  if (!box) return res.status(404).json({ error: 'Kiste nicht gefunden' });
  res.json(box);
});

// API: Kiste aktualisieren
app.post('/api/kiste/:id/update', (req, res) => {
  const data = loadData();
  const box = data.kisten.find(k => k.id === req.params.id);
  if (!box) return res.status(404).json({ error: 'Kiste nicht gefunden' });

  box.inhalt = req.body.inhalt;
  saveData(data);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
// Überschreibt die ganze Datei (für Admin-Interface)
app.post('/api/overwrite', (req, res) => {
  const newData = req.body;
  saveData(newData);
  res.json({ success: true });
})


