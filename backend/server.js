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

Carefully read every message AND inspect every image the user uploads. Interpret what you see:
- Food, snacks, or beverages that would satisfy hunger → call update_user_stat with stat_name "hunger" and a positive change_amount between 10 and 25 (bigger meals = larger boost). This represents becoming more full / less hungry.
- Beds, pillows, couches set up for rest, people sleeping, or anything clearly showing rest/nap prep → call update_user_stat with stat_name "energy_level" and a positive change_amount between 10 and 25.
- Only make one update per distinct action. If unsure, ask for clarification instead of guessing.

When the user talks to you, listen to their state and suggest appropriate health-improving activities.
- If they seem tired, suggest a power nap or rest.
- If they seem low on energy or hungry, suggest a nutritious snack.
- If they seem stressed or sluggish, suggest a walk, stretching, or a quick workout.

Whenever you call a tool, your final response MUST: (1) confirm the stat update in a friendly way ("Yum! I've bumped up your hunger bar."), and (2) provide one supportive suggestion or observation based on the situation.

Always be kind, encouraging, and non-judgmental. Keep your responses concise and friendly.
`;

// WebSocket Logic
let connectedClients = new Set();
let lastScanTime = 0;

const METRIC_CONFIG = {
    pulse: { label: 'Average Pulse', units: 'BPM', fallback: 72, decimals: 1 },
    breathing: { label: 'Average Breathing', units: 'RPM', fallback: 14, decimals: 1 },
    ie_ratio: { label: 'Inhale/Exhale Ratio', units: 'ratio', fallback: 1.0, decimals: 2 },
    breath_amp: { label: 'Breath Amplitude', units: 'AU', fallback: 0.5, decimals: 2 },
    blood_pressure: { label: 'Blood Pressure (Phasic)', units: 'mmHg', fallback: 118, decimals: 1 },
    apnea: { label: 'Apnea Status', units: '(0=None, 1=Detected)', fallback: 0, decimals: 2 },
};

wss.on('connection', (ws) => {
    console.log('[DEBUG] ========== NEW WEBSOCKET CLIENT CONNECTED ==========');
    console.log('[DEBUG] Total connected clients:', connectedClients.size + 1);
    connectedClients.add(ws);

    ws.on('message', async (message) => {
        try {
            const rawMessage = message.toString();
            console.log('[DEBUG] Raw WebSocket message received (length:', rawMessage.length, 'bytes)');
            
            const data = JSON.parse(rawMessage);
            console.log('[DEBUG] Parsed message type:', data.type);
            
            if (data.type === 'scan') {
                console.log('[DEBUG] ========== SCAN MESSAGE DETECTED ==========');
                console.log('[DEBUG] Raw scan payload:', JSON.stringify(data.data, null, 2));
                console.log('[DEBUG] Scan data keys:', Object.keys(data.data || {}));
                console.log('[DEBUG] Scan data summary:', {
                    pulse: data.data?.pulse?.length || 0,
                    breathing: data.data?.breathing?.length || 0,
                    ie_ratio: data.data?.ie_ratio?.length || 0,
                    breath_amp: data.data?.breath_amp?.length || 0,
                    blood_pressure: data.data?.blood_pressure?.length || 0,
                    apnea: data.data?.apnea?.length || 0
                });
                
                const now = Date.now();
                const timeSinceLastScan = now - lastScanTime;
                const shouldRunAnalysis = timeSinceLastScan >= 3000;
                if (!shouldRunAnalysis) {
                    console.log(`[DEBUG] Scan received ${timeSinceLastScan}ms after previous one. Will skip AI analysis but still store raw data.`);
                } else {
                    lastScanTime = now;
                }

                console.log('[DEBUG] Processing scan - saving to database...');
                
                // Save scan to DB
                const scanDataJson = JSON.stringify(data.data);
                db.run("INSERT INTO scans (data) VALUES (?)", [scanDataJson], (err) => {
                    if (err) {
                        console.error('[DEBUG] Error saving scan to database:', err);
                    } else {
                        console.log('[DEBUG] ✓ Scan saved to database successfully');
                    }
                });

                if (shouldRunAnalysis) {
                    console.log('[DEBUG] Running AI analysis on scan data...');
                    // Expect data.data to contain { pulse: [], breathing: [], ... }
                    await runAIAnalysis(data.data);
                    console.log('[DEBUG] ========== SCAN PROCESSING COMPLETE ==========');
                } else {
                    console.log('[DEBUG] Skipping AI analysis for this scan to avoid rapid reprocessing.');
                }
            } else if (data.type === 'debug') {
                console.log(`[DEBUG] DEBUG FROM APP: ${data.unit}`);
            } else {
                console.log('[DEBUG] Unknown message type:', data.type);
            }

            // Broadcast to other clients (like the web dashboard)
            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });

        } catch (e) {
            console.error('[DEBUG] Error parsing WebSocket message:', e);
            console.error('[DEBUG] Raw message (first 200 chars):', message.toString().substring(0, 200));
        }
    });

    ws.on('close', () => {
        console.log('[DEBUG] ========== WEBSOCKET CLIENT DISCONNECTED ==========');
        connectedClients.delete(ws);
        console.log('[DEBUG] Remaining connected clients:', connectedClients.size);
    });
});

async function runAIAnalysis(metrics) {
    const avg = (arr) => (arr && arr.length) ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    const metricEntries = Object.entries(METRIC_CONFIG).map(([key, config]) => {
        const samples = Array.isArray(metrics[key]) ? metrics[key] : [];
        const hasData = samples.length > 0;
        const value = hasData ? avg(samples) : config.fallback;
        return { key, ...config, hasData, value };
    });

    const measuredMetrics = metricEntries.filter((entry) => entry.hasData);
    const metricLines = metricEntries.map((entry) => {
        const prefix = entry.hasData ? '[measured]' : '[assumed-normal]';
        const suffix = entry.hasData ? '' : ' — no readings received, treat as healthy baseline.';
        return `${prefix} ${entry.label}: ${entry.value.toFixed(entry.decimals)} ${entry.units}${suffix}`;
    }).join('\n');

    const guidance = measuredMetrics.length
        ? `Focus your reasoning on the metrics marked "[measured]" (${measuredMetrics.map(m => m.label).join(', ')}).`
        : `No metrics were actually measured in this scan. Provide calm, default encouragement while keeping all stats neutral.`;

    const prompt = `
    Analyze these physiological metrics collected from a health scan.

    ${metricLines}

    ${guidance}
    Metrics labeled "[assumed-normal]" had no samples this time; interpret them as neutral/healthy and do not reduce scores because of them.
    IMPORTANT: "stress_level.score" represents calmness. A value of 100 means the person is completely relaxed / low stress, and 0 means extremely stressed. Output higher stress scores when the user appears calm.
    
    Based on the measured data, estimate the following states on a scale of 1-100 and provide a one-sentence justification for each.
    If the heart rate (Pulse) is high (e.g., > 100 BPM) or stress_level score drops low (meaning high stress), suggest a "quest" to help them relax (e.g., "Meditate for 5 mins", "Take 3 deep breaths"). If they seem low energy, suggest a quest like "Do 10 jumping jacks".
    
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

// Recompute overall health based on other stats
async function recomputeOverallHealth() {
  return new Promise((resolve, reject) => {
    db.get("SELECT hunger, stress_level, energy_level, sleep_quality FROM stats WHERE id = 1", (err, row) => {
      if (err) {
        console.error("Error fetching stats for recomputation:", err);
        return reject(err);
      }
      if (row) {
        const { hunger, stress_level, energy_level, sleep_quality } = row;
        const overallHealth = Math.round((hunger + stress_level + energy_level + sleep_quality) / 4);
        
        db.run("UPDATE stats SET overall_health = ? WHERE id = 1", [overallHealth], (updateErr) => {
          if (updateErr) {
            console.error("Error updating overall_health:", updateErr);
            return reject(updateErr);
          }
          console.log("Recomputed overall_health:", overallHealth);
          resolve();
        });
      } else {
        resolve(); // No stats row found, do nothing
      }
    });
  });
}

// --- API Endpoints ---

// Simple API root for health checks
app.get('/api', (_req, res) => {
    res.json({
        status: 'ok',
        message: 'Moodi backend API',
        endpoints: [
            '/api/stats',
            '/api/scan/latest',
            '/api/quests',
            '/api/stats/recompute',
            '/api/chat'
        ]
    });
});

// Serve admin dashboard
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/dashboard.html');
});

const REQUIRED_SCAN_FIELDS = ['pulse', 'breathing', 'ie_ratio', 'blood_pressure', 'apnea', 'breath_amp'];

const parseScanRow = (row) => {
    try {
        return JSON.parse(row.data);
    } catch (error) {
        console.error('[DEBUG] Failed to parse scan row', row.id, error);
        return null;
    }
};

const addFieldLengths = (data) => {
    return REQUIRED_SCAN_FIELDS.reduce((acc, field) => {
        acc[field] = Array.isArray(data[field]) ? data[field].length : 0;
        return acc;
    }, {});
};

// Get latest scan data (preferring the most recent one that has every required field populated)
app.get('/api/scan/latest', (req, res) => {
    console.log('[DEBUG] /api/scan/latest endpoint called');
    db.all("SELECT * FROM scans ORDER BY id DESC LIMIT 50", (err, rows) => {
        if (err) {
            console.error('[DEBUG] Database error fetching latest scan:', err);
            return res.status(500).json({ error: err.message });
        }
        if (!rows || rows.length === 0) {
            console.log('[DEBUG] No scans found in database');
            return res.status(404).json({ error: "No scans found" });
        }

        const parseRow = (row) => {
            try {
                const parsed = JSON.parse(row.data);
                return parsed;
            } catch (parseErr) {
                console.error('[DEBUG] Error parsing scan data for row', row.id, parseErr);
                return null;
            }
        };

        const hasAllFieldsPopulated = (data) => {
            return REQUIRED_SCAN_FIELDS.every((field) => Array.isArray(data[field]) && data[field].length > 0);
        };

        let chosenRow = null;
        let chosenData = null;

        for (const row of rows) {
            const data = parseRow(row);
            if (!data) continue;
            if (hasAllFieldsPopulated(data)) {
                chosenRow = row;
                chosenData = data;
                console.log('[DEBUG] Found scan with all required fields:', row.id);
                break;
            }
            if (!chosenRow) {
                // Keep the latest valid (parseable) row as a fallback
                chosenRow = row;
                chosenData = data;
            }
        }

        if (!chosenRow || !chosenData) {
            console.log('[DEBUG] No valid scans could be parsed');
            return res.status(500).json({ error: "Failed to parse scan data" });
        }

        // Attach metadata so the admin dashboard can display which scan was used
        const responsePayload = {
            ...chosenData,
            metadata: {
                scan_id: chosenRow.id,
                created_at: chosenRow.created_at,
                required_fields_present: hasAllFieldsPopulated(chosenData),
                fields_lengths: REQUIRED_SCAN_FIELDS.reduce((acc, field) => {
                    acc[field] = Array.isArray(chosenData[field]) ? chosenData[field].length : 0;
                    return acc;
                }, {})
            }
        };

        console.log('[DEBUG] Sending scan id', chosenRow.id, 'to client. All fields present:', responsePayload.metadata.required_fields_present);
        res.json(responsePayload);
    });
});

// Get recent scans
app.get('/api/scans', (req, res) => {
    const requestedLimit = parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requestedLimit)
        ? Math.min(Math.max(requestedLimit, 1), 200)
        : 20;

    db.all("SELECT * FROM scans ORDER BY id DESC LIMIT ?", [limit], (err, rows) => {
        if (err) {
            console.error('[DEBUG] Database error fetching scans:', err);
            return res.status(500).json({ error: err.message });
        }

        const payload = rows.map((row) => {
            const data = parseScanRow(row);
            return {
                id: row.id,
                created_at: row.created_at,
                data,
                field_lengths: data ? addFieldLengths(data) : {},
                parse_error: data ? null : 'Failed to parse JSON payload'
            };
        });

        res.json(payload);
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
    const history = (req.body.history && req.body.history !== '[]') ? JSON.parse(req.body.history) : [];
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
        const dbPromises = functionCalls.map(async (call) => {
            if (call.name === 'update_user_stat') {
                const { stat_name, change_amount } = call.args;
                await new Promise((resolve, reject) => {
                    db.run(`UPDATE stats SET ${stat_name} = MIN(100, MAX(0, ${stat_name} + ?)), last_updated = CURRENT_TIMESTAMP WHERE id = 1`, 
                        [change_amount], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                });

                // After updating a stat, recompute overall health
                if (stat_name !== 'overall_health') {
                  await recomputeOverallHealth();
                }
                
                return {
                    functionResponse: {
                        name: "update_user_stat",
                        response: { name: "update_user_stat", content: { success: true, message: `Updated ${stat_name} by ${change_amount}` } }
                    }
                };
            }
            return null;
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
