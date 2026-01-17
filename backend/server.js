// Neues MongoDB-basiertes Backend
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

const uri = (process.env.MONGODB_URI
  || 'mongodb+srv://appuser:lager2024@zeltlager.ircd8dl.mongodb.net/?retryWrites=true&w=majority&appName=Zeltlager').trim();
const client = new MongoClient(uri);
let kistenCollection;
let dbReady = false;

app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));

async function connectDB() {
  try {
    if (!uri.startsWith('mongodb')) {
      console.warn('Achtung: MONGODB_URI wirkt ungültig (kein "mongodb"-Schema).');
    }
    await client.connect();
    const db = client.db('kistenDB');
    kistenCollection = db.collection('kisten');
    dbReady = true;
    console.log('MongoDB verbunden');
  } catch (error) {
    console.error('MongoDB-Verbindung fehlgeschlagen:', error.message);
    console.error('Bitte MONGODB_URI prüfen oder eine erreichbare Datenbank konfigurieren.');
  }
}

app.use((req, res, next) => {
  if (req.path.startsWith('/api') && !dbReady) {
    return res.status(503).json({ error: 'Datenbank nicht verbunden' });
  }
  next();
});

// Alle Kisten abrufen
app.get('/api/kisten', async (req, res) => {
  const kisten = await kistenCollection
    .find({})
    .collation({ locale: 'de', numericOrdering: true })
    .sort({ id: 1 })
    .toArray();
  res.json(kisten);
});

// Einzelne Kiste abrufen
app.get('/api/kiste/:id', async (req, res) => {
  const box = await kistenCollection.findOne({ id: req.params.id });
  if (!box) return res.status(404).json({ error: 'Kiste nicht gefunden' });
  res.json(box);
});

// Einzelne Kiste aktualisieren
app.post('/api/kiste/:id/update', async (req, res) => {
  await kistenCollection.updateOne(
    { id: req.params.id },
    {
      $set: {
        inhalt: req.body.inhalt,
        bezeichnung: req.body.bezeichnung,
        lagerplatz: req.body.lagerplatz
      }
    }

  );
  res.json({ success: true });
});

// Ganze Kistensammlung überschreiben (Adminzweck)
app.post('/api/overwrite', async (req, res) => {
  await kistenCollection.deleteMany({});
  await kistenCollection.insertMany(req.body.kisten);
  res.json({ success: true });
});

// Neue Kiste hinzufügen
app.post('/api/kiste', async (req, res) => {
  const { id, bezeichnung } = req.body;
  if (!id || !bezeichnung) return res.status(400).json({ error: 'Fehlende Felder' });
  await kistenCollection.insertOne({ id, bezeichnung, inhalt: [] });
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});

connectDB();
