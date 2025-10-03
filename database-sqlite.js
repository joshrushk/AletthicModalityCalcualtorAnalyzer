const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database file path
const dbPath = path.join(__dirname, 'database.sqlite');

class SQLiteDatabase {
    constructor() {
        this.db = null;
    }

    // Initialize database connection and create tables
    async initialize() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err);
                    reject(err);
                    return;
                }
                console.log('Connected to SQLite database');
                this.createTables().then(resolve).catch(reject);
            });
        });
    }

    // Create all necessary tables
    async createTables() {
        const tables = [
            // Users table
            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // User profiles table
            `CREATE TABLE IF NOT EXISTS user_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                bio TEXT,
                avatar_url TEXT,
                join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )`,

            // Security questions table
            `CREATE TABLE IF NOT EXISTS security_questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                question1 TEXT,
                answer1 TEXT,
                question2 TEXT,
                answer2 TEXT,
                question3 TEXT,
                answer3 TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )`,

            // Messages table
            `CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sender_id INTEGER NOT NULL,
                receiver_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
                FOREIGN KEY (receiver_id) REFERENCES users (id) ON DELETE CASCADE
            )`,

            // Quiz results table
            `CREATE TABLE IF NOT EXISTS quiz_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                score INTEGER NOT NULL,
                total_questions INTEGER NOT NULL,
                answers TEXT, -- JSON string of answers
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )`,

            // Online users table
            `CREATE TABLE IF NOT EXISTS online_users (
                user_id INTEGER PRIMARY KEY,
                last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )`,

            // Calculation history table
            `CREATE TABLE IF NOT EXISTS calculation_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                type TEXT NOT NULL,
                input TEXT NOT NULL,
                result TEXT NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )`,

            // User preferences table
            `CREATE TABLE IF NOT EXISTS user_preferences (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER UNIQUE NOT NULL,
                theme TEXT DEFAULT 'light',
                language TEXT DEFAULT 'en',
                notifications BOOLEAN DEFAULT 1,
                auto_save BOOLEAN DEFAULT 1,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )`
        ];

        for (const table of tables) {
            await this.runQuery(table);
        }

        console.log('All tables created successfully');
    }

    // Generic query runner
    runQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    // Generic query getter
    getQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Generic query all
    allQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // User operations
    async createUser(userData) {
        const sql = `INSERT INTO users (email, password, name) VALUES (?, ?, ?)`;
        const result = await this.runQuery(sql, [userData.email, userData.password, userData.name]);
        return { id: result.id, ...userData, created_at: new Date().toISOString() };
    }

    async getUserByEmail(email) {
        const sql = `SELECT * FROM users WHERE email = ?`;
        return await this.getQuery(sql, [email]);
    }

    async getUserById(id) {
        const sql = `SELECT * FROM users WHERE id = ?`;
        return await this.getQuery(sql, [id]);
    }

    async updateUser(id, updateData) {
        const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updateData);
        const sql = `UPDATE users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        await this.runQuery(sql, [...values, id]);
        return await this.getUserById(id);
    }

    async getAllUsers() {
        const sql = `SELECT * FROM users`;
        return await this.allQuery(sql);
    }

    // Calculation history operations
    async saveCalculation(userId, calculationData) {
        const sql = `INSERT INTO calculation_history (user_id, type, input, result, description) VALUES (?, ?, ?, ?, ?)`;
        const result = await this.runQuery(sql, [
            userId,
            calculationData.type,
            calculationData.input,
            calculationData.result,
            calculationData.description || ''
        ]);
        return { id: result.id, user_id: userId, ...calculationData, created_at: new Date().toISOString() };
    }

    async getCalculationHistory(userId, limit = 50) {
        const sql = `SELECT * FROM calculation_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`;
        return await this.allQuery(sql, [userId, limit]);
    }

    async deleteCalculation(calculationId, userId) {
        const sql = `DELETE FROM calculation_history WHERE id = ? AND user_id = ?`;
        const result = await this.runQuery(sql, [calculationId, userId]);
        return result.changes > 0;
    }

    // User preferences operations
    async saveUserPreferences(userId, preferences) {
        const existing = await this.getUserPreferences(userId);
        
        if (existing) {
            const fields = Object.keys(preferences).map(key => `${key} = ?`).join(', ');
            const values = Object.values(preferences);
            const sql = `UPDATE user_preferences SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`;
            await this.runQuery(sql, [...values, userId]);
        } else {
            const fields = ['user_id', ...Object.keys(preferences)].join(', ');
            const placeholders = ['?', ...Object.keys(preferences).map(() => '?')].join(', ');
            const values = [userId, ...Object.values(preferences)];
            const sql = `INSERT INTO user_preferences (${fields}) VALUES (${placeholders})`;
            await this.runQuery(sql, values);
        }
        
        return await this.getUserPreferences(userId);
    }

    async getUserPreferences(userId) {
        const sql = `SELECT * FROM user_preferences WHERE user_id = ?`;
        const prefs = await this.getQuery(sql, [userId]);
        
        if (!prefs) {
            return {
                user_id: userId,
                theme: 'light',
                language: 'en',
                notifications: true,
                auto_save: true
            };
        }
        
        return prefs;
    }

    // Security questions operations
    async createSecurityQuestions(userId, questions) {
        const sql = `INSERT INTO security_questions (user_id, question1, answer1, question2, answer2, question3, answer3) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const result = await this.runQuery(sql, [
            userId,
            questions.question1, questions.answer1,
            questions.question2, questions.answer2,
            questions.question3, questions.answer3
        ]);
        return { id: result.id, user_id: userId, ...questions, created_at: new Date().toISOString() };
    }

    async getSecurityQuestions(userId) {
        const sql = `SELECT * FROM security_questions WHERE user_id = ?`;
        return await this.getQuery(sql, [userId]);
    }

    // Messages operations
    async createMessage(messageData) {
        const sql = `INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)`;
        const result = await this.runQuery(sql, [messageData.sender_id, messageData.receiver_id, messageData.content]);
        return { id: result.id, ...messageData, created_at: new Date().toISOString() };
    }

    async getMessages(senderId, receiverId) {
        const sql = `SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC`;
        return await this.allQuery(sql, [senderId, receiverId, receiverId, senderId]);
    }

    // Quiz results operations
    async createQuizResult(resultData) {
        const sql = `INSERT INTO quiz_results (user_id, score, total_questions, answers) VALUES (?, ?, ?, ?)`;
        const result = await this.runQuery(sql, [
            resultData.user_id,
            resultData.score,
            resultData.total_questions,
            JSON.stringify(resultData.answers || [])
        ]);
        return { id: result.id, ...resultData, created_at: new Date().toISOString() };
    }

    async getQuizResults(userId) {
        const sql = `SELECT * FROM quiz_results WHERE user_id = ? ORDER BY created_at DESC`;
        return await this.allQuery(sql, [userId]);
    }

    // Online users operations
    async addOnlineUser(userId) {
        const sql = `INSERT OR REPLACE INTO online_users (user_id, last_seen) VALUES (?, CURRENT_TIMESTAMP)`;
        await this.runQuery(sql, [userId]);
    }

    async removeOnlineUser(userId) {
        const sql = `DELETE FROM online_users WHERE user_id = ?`;
        await this.runQuery(sql, [userId]);
    }

    async getOnlineUsers() {
        const sql = `SELECT user_id FROM online_users`;
        const results = await this.allQuery(sql);
        return results.map(row => row.user_id);
    }

    // User profiles operations
    async createUserProfile(profileData) {
        const sql = `INSERT INTO user_profiles (user_id, bio, avatar_url) VALUES (?, ?, ?)`;
        const result = await this.runQuery(sql, [profileData.user_id, profileData.bio || '', profileData.avatar_url || '']);
        return { id: result.id, ...profileData, join_date: new Date().toISOString() };
    }

    async getUserProfile(userId) {
        const sql = `SELECT * FROM user_profiles WHERE user_id = ?`;
        return await this.getQuery(sql, [userId]);
    }

    async updateUserProfile(userId, updateData) {
        const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updateData);
        const sql = `UPDATE user_profiles SET ${fields} WHERE user_id = ?`;
        await this.runQuery(sql, [...values, userId]);
        return await this.getUserProfile(userId);
    }

    // Close database connection
    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                } else {
                    console.log('Database connection closed');
                }
            });
        }
    }
}

// Initialize database function
async function initializeSQLiteDatabase() {
    const db = new SQLiteDatabase();
    await db.initialize();
    return db;
}

module.exports = { SQLiteDatabase, initializeSQLiteDatabase };
