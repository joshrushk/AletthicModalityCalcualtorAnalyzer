const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const { SQLiteDatabase, initializeSQLiteDatabase } = require('./database-sqlite');
const puppeteer = require('puppeteer');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 3000;

// Initialize database
let db;
initializeSQLiteDatabase().then(database => {
    db = database;
    console.log('SQLite database initialized successfully');
}).catch(error => {
    console.error('Failed to initialize SQLite database:', error);
    process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// API Routes

// Migration endpoint
app.post('/api/migrate', async (req, res) => {
    try {
        const { migrateData } = require('./migrate-to-sqlite');
        await migrateData();
        res.json({ success: true, message: 'Migration completed successfully' });
    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get calculation history for a user
app.get('/api/calculations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const calculations = await db.getCalculationHistory(userId, limit);
        res.json({ success: true, data: calculations });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Save a new calculation
app.post('/api/calculations', async (req, res) => {
    try {
        const { userId, type, input, result, description } = req.body;
        
        if (!userId || !type || !input || !result) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields: userId, type, input, result' 
            });
        }

        const calculation = await db.saveCalculation(userId, {
            type,
            input,
            result,
            description: description || ''
        });

        res.json({ success: true, data: calculation });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete a calculation
app.delete('/api/calculations/:calculationId', async (req, res) => {
    try {
        const { calculationId } = req.params;
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                error: 'userId is required' 
            });
        }

        const deleted = await db.deleteCalculation(calculationId, userId);
        
        if (deleted) {
            res.json({ success: true, message: 'Calculation deleted successfully' });
        } else {
            res.status(404).json({ success: false, error: 'Calculation not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user preferences
app.get('/api/preferences/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const preferences = await db.getUserPreferences(userId);
        res.json({ success: true, data: preferences });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Save user preferences
app.post('/api/preferences', async (req, res) => {
    try {
        const { userId, ...preferences } = req.body;
        
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                error: 'userId is required' 
            });
        }

        const userPrefs = await db.saveUserPreferences(userId, preferences);
        res.json({ success: true, data: userPrefs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PDF Export endpoints
app.post('/api/export/pdf', async (req, res) => {
    try {
        const { calculations, title = 'Calculation Report' } = req.body;
        
        if (!calculations || !Array.isArray(calculations)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Calculations array is required' 
            });
        }

        const html = generateCalculationHTML(calculations, title);
        const pdfBuffer = await generatePDF(html);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/[^a-z0-9]/gi, '_')}.pdf"`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/export/calculation/:calculationId', async (req, res) => {
    try {
        const { calculationId } = req.params;
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                error: 'userId is required' 
            });
        }

        const calculations = await db.getCalculationHistory(userId, 100);
        const calculation = calculations.find(calc => calc.id == calculationId);
        
        if (!calculation) {
            return res.status(404).json({ 
                success: false, 
                error: 'Calculation not found' 
            });
        }

        const html = generateCalculationHTML([calculation], 'Single Calculation Report');
        const pdfBuffer = await generatePDF(html);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="calculation_${calculationId}.pdf"`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Helper function to generate HTML for PDF
function generateCalculationHTML(calculations, title) {
    const currentDate = new Date().toLocaleDateString();
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                background: white;
                color: #333;
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #667eea;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #2c3e50;
                margin: 0;
                font-size: 28px;
            }
            .header p {
                color: #6c757d;
                margin: 10px 0 0 0;
            }
            .calculation-item {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
                border-left: 4px solid #667eea;
            }
            .calculation-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            .calculation-type {
                font-weight: bold;
                color: #2c3e50;
                font-size: 18px;
            }
            .calculation-date {
                color: #6c757d;
                font-size: 14px;
            }
            .calculation-input {
                background: white;
                padding: 10px;
                border-radius: 4px;
                margin: 10px 0;
                font-family: monospace;
                border: 1px solid #dee2e6;
            }
            .calculation-result {
                background: #e3f2fd;
                padding: 15px;
                border-radius: 4px;
                margin: 10px 0;
                font-family: monospace;
                font-weight: bold;
                color: #1976d2;
                border: 1px solid #bbdefb;
            }
            .calculation-description {
                color: #6c757d;
                font-style: italic;
                margin: 10px 0;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e9ecef;
                color: #6c757d;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>${title}</h1>
            <p>Generated on ${currentDate}</p>
        </div>
        
        ${calculations.map(calc => `
            <div class="calculation-item">
                <div class="calculation-header">
                    <span class="calculation-type">${calc.type}</span>
                    <span class="calculation-date">${new Date(calc.created_at).toLocaleDateString()}</span>
                </div>
                ${calc.description ? `<div class="calculation-description">${calc.description}</div>` : ''}
                <div class="calculation-input">
                    <strong>Input:</strong> ${calc.input}
                </div>
                <div class="calculation-result">
                    <strong>Result:</strong> ${calc.result}
                </div>
            </div>
        `).join('')}
        
        <div class="footer">
            <p>Modal Realism Calculator Suite - Generated Report</p>
        </div>
    </body>
    </html>
    `;
}

// Helper function to generate PDF using Puppeteer
async function generatePDF(html) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
            }
        });
        
        return pdfBuffer;
    } finally {
        await browser.close();
    }
}

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join calculation room
    socket.on('join-calculation', (data) => {
        socket.join(`calculation-${data.calculationId}`);
        console.log(`User ${socket.id} joined calculation ${data.calculationId}`);
    });

    // Leave calculation room
    socket.on('leave-calculation', (data) => {
        socket.leave(`calculation-${data.calculationId}`);
        console.log(`User ${socket.id} left calculation ${data.calculationId}`);
    });

    // Share calculation
    socket.on('share-calculation', (data) => {
        socket.to(`calculation-${data.calculationId}`).emit('calculation-shared', {
            calculation: data.calculation,
            user: data.user,
            timestamp: new Date().toISOString()
        });
    });

    // Real-time collaboration on calculations
    socket.on('calculation-update', (data) => {
        socket.to(`calculation-${data.calculationId}`).emit('calculation-updated', {
            calculation: data.calculation,
            user: data.user,
            timestamp: new Date().toISOString()
        });
    });

    // Chat in calculation room
    socket.on('calculation-chat', (data) => {
        socket.to(`calculation-${data.calculationId}`).emit('calculation-message', {
            message: data.message,
            user: data.user,
            timestamp: new Date().toISOString()
        });
    });

    // User presence
    socket.on('user-online', (data) => {
        socket.broadcast.emit('user-status', {
            userId: data.userId,
            status: 'online',
            timestamp: new Date().toISOString()
        });
    });

    socket.on('user-offline', (data) => {
        socket.broadcast.emit('user-status', {
            userId: data.userId,
            status: 'offline',
            timestamp: new Date().toISOString()
        });
    });

    // Disconnect handling
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Modal Realism Calculator Suite API is ready!');
    console.log('WebSocket server is running for real-time collaboration');
});
