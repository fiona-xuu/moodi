require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const multer = require('multer');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('./database');

const app = express();
const upload = multer({ dest: 'uploads/' }); // Temp storage for images
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
// Create a separate WebSocket server on port 8080
const wss = new WebSocket.Server({ port: 8080 });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const SYSTEM_PROMPT = `
You are a supportive and motivating health companion named Moodi. Your goal is to encourage the user to take care of their well-being through small, manageable actions like taking a nap, eating a healthy snack, or doing some light exercise.

When the user talks to you, listen to their state and suggest appropriate health-improving activities.
- If they seem tired, suggest a power nap or rest.
- If they seem low on energy or hungry, suggest a nutritious snack.
- If they seem stressed or sluggish, suggest a walk, stretching, or a quick workout.

When you use a tool to update a user's stat (like hunger or sleep), your final response should first confirm the action in a friendly way. For example: "That sounds delicious! I've updated your hunger stat." or "That's great to hear. I've updated your sleep quality."

Always be kind, encouraging, and non-judgmental. Keep your responses concise and friendly.
`;

// WebSocket Logic
let connectedClients = new Set();

wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket on port 8080');
    connectedClients.add(ws);

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            
            if (data.type === 'scan') {
                console.log('Received scan data. Saving and Running AI Analysis...');
                
                // Save scan to DB
                db.run("INSERT INTO scans (data) VALUES (?)", [JSON.stringify(data.data)], (err) => {
                    if (err) console.error("Error saving scan:", err);
                });

                // Expect data.data to contain { pulse: [], breathing: [], ... }
                await runAIAnalysis(data.data);
            } else if (data.type === 'debug') {
                console.log(`DEBUG FROM APP: ${data.unit}`);
            }

            // Broadcast to other clients (like the web dashboard)
            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });

        } catch (e) {
            console.error('Error parsing message:', e);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        connectedClients.delete(ws);
    });
});

async function runAIAnalysis(metrics) {
    const avg = (arr) => (arr && arr.length) ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    
    const pulseAvg = avg(metrics.pulse);
    const breathAvg = avg(metrics.breathing);
    const ieAvg = avg(metrics.ie_ratio);
    const ampAvg = avg(metrics.breath_amp);
    const bpAvg = avg(metrics.blood_pressure);
    const apneaAvg = avg(metrics.apnea);

    const prompt = `
    Analyze these physiological metrics collected from a health scan:
    Average Pulse: ${pulseAvg.toFixed(1)} BPM
    Average Breathing: ${breathAvg.toFixed(1)} RPM
    Average Inhale/Exhale Ratio: ${ieAvg.toFixed(2)}
    Average Breath Amplitude: ${ampAvg.toFixed(2)} AU
    Average Blood Pressure (Phasic): ${bpAvg.toFixed(1)} mmHg
    Apnea Status (0=None, 1=Detected): ${apneaAvg.toFixed(2)}
    
    Based on these metrics, estimate the following states on a scale of 1-100 and provide a 1-sentence justification for each.
    If the heart rate (Pulse) is high (e.g., > 100 BPM) or stress seems high, suggest a "quest" to help them relax (e.g., "Meditate for 5 mins", "Take 3 deep breaths"). If they seem low energy, suggest a quest like "Do 10 jumping jacks".
    
    Return ONLY valid JSON in the following format (no markdown formatting):
    {
        "overall_health": { "score": 0, "justification": "..." },
        "hunger": { "score": 0, "justification": "..." },
        "stress_level": { "score": 0, "justification": "..." },
        "energy_level": { "score": 0, "justification": "..." },
        "sleep_quality": { "score": 0, "justification": "..." },
        "quest": { "title": "...", "description": "..." }
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        
        // Clean up markdown
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        
        const insightData = JSON.parse(text);
        
        // Save Stats to DB
        db.run(`UPDATE stats SET 
            overall_health = ?, 
            hunger = ?, 
            stress_level = ?, 
            energy_level = ?, 
            sleep_quality = ?,
            last_updated = CURRENT_TIMESTAMP
            WHERE id = 1`, 
            [
                insightData.overall_health.score,
                insightData.hunger.score,
                insightData.stress_level.score,
                insightData.energy_level.score,
                insightData.sleep_quality.score
            ], (err) => {
                if (err) console.error("Error updating stats:", err);
            }
        );

        // Save Quest to DB
        if (insightData.quest) {
            db.run(`INSERT INTO quests (title, description, status) VALUES (?, ?, 'active')`,
                [insightData.quest.title, insightData.quest.description],
                (err) => { if (err) console.error("Error saving quest:", err); }
            );
        }

        const message = JSON.stringify({
            type: "ai_analysis",
            data: insightData,
            timestamp: new Date().toISOString()
        });

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
        console.log('AI Analysis sent and saved to DB.');

    } catch (error) {
        console.error('Error generating insight:', error);
    }
}

// --- API Endpoints ---

// Get latest scan data
app.get('/api/scan/latest', (req, res) => {
    db.get("SELECT * FROM scans ORDER BY id DESC LIMIT 1", (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "No scans found" });
        res.json(JSON.parse(row.data));
    });
});

// Get current stats
app.get('/api/stats', (req, res) => {
    db.get("SELECT * FROM stats WHERE id = 1", (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

// Manually update stats (e.g. "I ate an apple")
app.post('/api/stats/update', (req, res) => {
    const { stat, value } = req.body; // e.g. { stat: 'hunger', value: 10 } (adds 10)
    
    if (!['overall_health', 'hunger', 'stress_level', 'energy_level', 'sleep_quality'].includes(stat)) {
        return res.status(400).json({ error: "Invalid stat name" });
    }

    db.run(`UPDATE stats SET ${stat} = MIN(100, MAX(0, ${stat} + ?)), last_updated = CURRENT_TIMESTAMP WHERE id = 1`, [value], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        // Return updated stats
        db.get("SELECT * FROM stats WHERE id = 1", (err, row) => {
            res.json(row);
        });
    });
});

// Get active quests
app.get('/api/quests', (req, res) => {
    db.all("SELECT * FROM quests WHERE status = 'active' ORDER BY id DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Generate new quests based on current stats
app.post('/api/quests/generate', (req, res) => {
    db.get("SELECT * FROM stats WHERE id = 1", async (err, stats) => {
        if (err) return res.status(500).json({ error: err.message });

        const prompt = `
        Generate 3 fun, small "health quests" based on these user stats (0-100):
        Hunger: ${stats.hunger} (Lower is hungrier? No, let's assume 0=Starving, 100=Full)
        Stress: ${stats.stress_level} (0=Calm, 100=Stressed)
        Energy: ${stats.energy_level} (0=Tired, 100=Energetic)
        
        Return JSON array: [{ "title": "...", "description": "..." }]
        `;

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
            const quests = JSON.parse(text);

            // Save quests
            const stmt = db.prepare("INSERT INTO quests (title, description) VALUES (?, ?)");
            quests.forEach(q => stmt.run(q.title, q.description));
            stmt.finalize();

            res.json(quests);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
});

// Recompute stats from the latest scan
app.post('/api/stats/recompute', (req, res) => {
    db.get("SELECT * FROM scans ORDER BY id DESC LIMIT 1", async (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "No scans found to recompute from" });

        try {
            const scanData = JSON.parse(row.data);
            await runAIAnalysis(scanData); // This will update the stats in the DB
            
            // Return the newly computed stats
            db.get("SELECT * FROM stats WHERE id = 1", (err, updatedStats) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(updatedStats);
            });
        } catch (e) {
            res.status(500).json({ error: "Failed to recompute stats: " + e.message });
        }
    });
});

// Reset player stats to default
app.post('/api/stats/reset', (req, res) => {
    db.run(`UPDATE stats SET 
        overall_health = 50, 
        hunger = 50, 
        stress_level = 50, 
        energy_level = 50, 
        sleep_quality = 50,
        last_updated = CURRENT_TIMESTAMP
        WHERE id = 1`, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Player stats have been reset to default." });
    });
});

// Reset quests
app.post('/api/quests/reset', (req, res) => {
    db.run("DELETE FROM quests", function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "All quests have been reset." });
    });
});

// Reset scans
app.post('/api/scans/reset', (req, res) => {
    db.run("DELETE FROM scans", function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "All scans have been reset." });
    });
});

// Helper for images
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: fs.readFileSync(path).toString("base64"),
      mimeType
    },
  };
}

// Tool Definitions
const tools = [
  {
    functionDeclarations: [
      {
        name: "update_user_stat",
        description: "Update a user's health stat based on their actions (e.g. eating food improves hunger).",
        parameters: {
          type: "OBJECT",
          properties: {
            stat_name: {
              type: "STRING",
              description: "The stat to update: 'hunger', 'stress_level', 'energy_level', 'sleep_quality', 'overall_health'."
            },
            change_amount: {
              type: "NUMBER",
              description: "Amount to change. Positive adds to the score (0-100). For hunger, +20 means becoming LESS hungry (more full/satisfied)."
            }
          },
          required: ["stat_name", "change_amount"]
        }
      }
    ]
  }
];

app.post('/api/chat', upload.single('image'), async (req, res) => {
  try {
    const message = req.body.message || "";
    const history = req.body.history ? JSON.parse(req.body.history) : [];
    const imageFile = req.file;

    // Initialize model with tools
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash", // 2.5-flash might not support tools yet in this SDK version, sticking to 1.5-flash for safety or 2.0-flash-exp
        tools: tools
    });

    // Construct chat history
    let chatHistory = [
      {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT }],
      },
      {
        role: "model",
        parts: [{ text: "Understood. I am ready to be a supportive health companion named Moodi." }],
      },
      ...history
    ];

    const chat = model.startChat({
      history: chatHistory,
    });

    // Prepare message parts
    let msgParts = [{ text: message }];
    if (imageFile) {
        msgParts.push(fileToGenerativePart(imageFile.path, imageFile.mimetype));
    }

    console.log("Sending message to Gemini...");
    const result = await chat.sendMessage(msgParts);
    const response = result.response;
    
    // Check for function calls
    const functionCalls = response.functionCalls();
    if (functionCalls && functionCalls.length > 0) {
        console.log("Gemini wants to call functions:", functionCalls.map(c => ({ name: c.name, args: c.args })));

        // Execute DB updates in parallel and format responses correctly
        const dbPromises = functionCalls.map(call => {
            if (call.name === 'update_user_stat') {
                const { stat_name, change_amount } = call.args;
                return new Promise((resolve, reject) => {
                    db.run(`UPDATE stats SET ${stat_name} = MIN(100, MAX(0, ${stat_name} + ?)), last_updated = CURRENT_TIMESTAMP WHERE id = 1`, 
                        [change_amount], (err) => {
                            if (err) reject(err);
                            else resolve({
                                functionResponse: {
                                    name: "update_user_stat",
                                    response: { name: "update_user_stat", content: { success: true, message: `Updated ${stat_name} by ${change_amount}` } }
                                }
                            });
                        });
                });
            }
            return Promise.resolve(null);
        });

        const functionResponses = (await Promise.all(dbPromises)).filter(Boolean);
        
        // Send all function results back to Gemini in the correct format
        const finalResult = await chat.sendMessage(functionResponses);
        res.json({ reply: finalResult.response.text() });
        
    } else {
        res.json({ reply: response.text() });
    }

    // Cleanup uploaded file
    if (imageFile) fs.unlinkSync(imageFile.path);

  } catch (error) {
    console.error('Error communicating with Gemini:', error);
    res.status(500).json({ error: 'Failed to generate response.' });
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
