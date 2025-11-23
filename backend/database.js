const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'moodi.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDatabase();
    }
});

function initDatabase() {
    db.serialize(() => {
        // Table for User Stats
        db.run(`CREATE TABLE IF NOT EXISTS stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            overall_health INTEGER DEFAULT 50,
            hunger INTEGER DEFAULT 50,
            stress_level INTEGER DEFAULT 50,
            energy_level INTEGER DEFAULT 50,
            sleep_quality INTEGER DEFAULT 50,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Initialize stats if empty
        db.get("SELECT count(*) as count FROM stats", (err, row) => {
            if (row.count === 0) {
                db.run(`INSERT INTO stats (overall_health, hunger, stress_level, energy_level, sleep_quality) 
                        VALUES (50, 50, 50, 50, 50)`);
                console.log("Initialized default stats.");
            }
        });

        // Table for Quests
        db.run(`CREATE TABLE IF NOT EXISTS quests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            status TEXT DEFAULT 'active', -- active, completed
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Table for Scans (storing the raw JSON data)
        db.run(`CREATE TABLE IF NOT EXISTS scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    });
}

module.exports = db;
