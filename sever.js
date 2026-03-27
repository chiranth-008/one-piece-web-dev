const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database('./onepiece.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    role TEXT,
    description TEXT,
    power TEXT
  )`);

  // Insert One Piece characters if table is empty
  db.get("SELECT COUNT(*) as count FROM characters", (err, row) => {
    if (row.count === 0) {
      const pirates = [
        ["Monkey D. Luffy", "Captain", "Rubber-man who dreams of becoming Pirate King", "Gomu Gomu no Mi"],
        ["Roronoa Zoro", "Swordsman", "World's greatest swordsman in training", "Three Sword Style"],
        ["Nami", "Navigator", "Genius cartographer and thief", "Clima-Tact"],
        ["Usopp", "Sniper", "Brave warrior of the sea", "Pop Green + inventions"],
        ["Sanji", "Cook", "Master chef and fighter", "Black Leg Style"],
        ["Tony Tony Chopper", "Doctor", "Reindeer with Human-Human fruit", "Hito Hito no Mi"]
      ];

      const stmt = db.prepare("INSERT INTO characters (name, role, description, power) VALUES (?, ?, ?, ?)");
      pirates.forEach(p => stmt.run(...p));
      stmt.finalize();
      console.log('✅ One Piece characters loaded into database!');
    }
  });
});

// API Routes
app.get('/api/characters', (req, res) => {
  db.all("SELECT * FROM characters", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/characters', (req, res) => {
  const { name, role, description, power } = req.body;
  db.run(`INSERT INTO characters (name, role, description, power) VALUES (?, ?, ?, ?)`,
    [name, role, description, power],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'New character added to the crew!' });
    });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running → http://localhost:${PORT}`);
});
