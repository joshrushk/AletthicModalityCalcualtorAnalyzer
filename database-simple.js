const fs = require('fs');
const path = require('path');

// Database file path
const dbFile = path.join(__dirname, 'database.json');

// Default data structure
const defaultData = {
    users: [],
    user_profiles: [],
    security_questions: [],
    messages: [],
    quiz_results: [],
    online_users: [],
    calculation_history: [],
    user_preferences: []
};

// Initialize database
function initializeDatabase() {
    try {
        if (!fs.existsSync(dbFile)) {
            fs.writeFileSync(dbFile, JSON.stringify(defaultData, null, 2));
        }
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

// Database operations
class Database {
    constructor() {
        this.dbFile = dbFile;
    }

    read() {
        try {
            if (!fs.existsSync(this.dbFile)) {
                return defaultData;
            }
            const data = fs.readFileSync(this.dbFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading database:', error);
            return defaultData;
        }
    }

    write(data) {
        try {
            fs.writeFileSync(this.dbFile, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error writing database:', error);
        }
    }

    // Users
    createUser(userData) {
        const data = this.read();
        const user = {
            id: Date.now() + Math.random(), // Simple ID generation
            ...userData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        data.users.push(user);
        this.write(data);
        return user;
    }

    getUserByEmail(email) {
        const data = this.read();
        return data.users.find(user => user.email === email);
    }

    getUserById(id) {
        const data = this.read();
        return data.users.find(user => user.id === id);
    }

    updateUser(id, updateData) {
        const data = this.read();
        const userIndex = data.users.findIndex(user => user.id === id);
        if (userIndex !== -1) {
            data.users[userIndex] = {
                ...data.users[userIndex],
                ...updateData,
                updated_at: new Date().toISOString()
            };
            this.write(data);
            return data.users[userIndex];
        }
        return null;
    }

    // Security Questions
    createSecurityQuestions(userId, questions) {
        const data = this.read();
        const securityQuestions = {
            id: Date.now() + Math.random(),
            user_id: userId,
            ...questions,
            created_at: new Date().toISOString()
        };
        data.security_questions.push(securityQuestions);
        this.write(data);
        return securityQuestions;
    }

    getSecurityQuestions(userId) {
        const data = this.read();
        return data.security_questions.find(sq => sq.user_id === userId);
    }

    // Messages
    createMessage(messageData) {
        const data = this.read();
        const message = {
            id: Date.now() + Math.random(),
            ...messageData,
            created_at: new Date().toISOString()
        };
        data.messages.push(message);
        this.write(data);
        return message;
    }

    getMessages(senderId, receiverId) {
        const data = this.read();
        return data.messages.filter(msg => 
            (msg.sender_id === senderId && msg.receiver_id === receiverId) ||
            (msg.sender_id === receiverId && msg.receiver_id === senderId)
        ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    // Quiz Results
    createQuizResult(resultData) {
        const data = this.read();
        const result = {
            id: Date.now() + Math.random(),
            ...resultData,
            created_at: new Date().toISOString()
        };
        data.quiz_results.push(result);
        this.write(data);
        return result;
    }

    getQuizResults(userId) {
        const data = this.read();
        return data.quiz_results.filter(result => result.user_id === userId);
    }

    // Online Users
    addOnlineUser(userId) {
        const data = this.read();
        if (!data.online_users.includes(userId)) {
            data.online_users.push(userId);
            this.write(data);
        }
    }

    removeOnlineUser(userId) {
        const data = this.read();
        data.online_users = data.online_users.filter(id => id !== userId);
        this.write(data);
    }

    getOnlineUsers() {
        const data = this.read();
        return data.online_users;
    }

    // User Profiles
    createUserProfile(profileData) {
        const data = this.read();
        const profile = {
            id: Date.now() + Math.random(),
            ...profileData,
            join_date: new Date().toISOString()
        };
        data.user_profiles.push(profile);
        this.write(data);
        return profile;
    }

    getUserProfile(userId) {
        const data = this.read();
        return data.user_profiles.find(profile => profile.user_id === userId);
    }

    updateUserProfile(userId, updateData) {
        const data = this.read();
        const profileIndex = data.user_profiles.findIndex(profile => profile.user_id === userId);
        if (profileIndex !== -1) {
            data.user_profiles[profileIndex] = {
                ...data.user_profiles[profileIndex],
                ...updateData
            };
            this.write(data);
            return data.user_profiles[profileIndex];
        }
        return null;
    }

    // Get all users (for API)
    getAllUsers() {
        const data = this.read();
        return data.users;
    }

    // Calculation History
    saveCalculation(userId, calculationData) {
        const data = this.read();
        const calculation = {
            id: Date.now() + Math.random(),
            user_id: userId,
            ...calculationData,
            created_at: new Date().toISOString()
        };
        data.calculation_history.push(calculation);
        this.write(data);
        return calculation;
    }

    getCalculationHistory(userId, limit = 50) {
        const data = this.read();
        return data.calculation_history
            .filter(calc => calc.user_id === userId)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, limit);
    }

    deleteCalculation(calculationId, userId) {
        const data = this.read();
        const calcIndex = data.calculation_history.findIndex(
            calc => calc.id === calculationId && calc.user_id === userId
        );
        if (calcIndex !== -1) {
            data.calculation_history.splice(calcIndex, 1);
            this.write(data);
            return true;
        }
        return false;
    }

    // User Preferences
    saveUserPreferences(userId, preferences) {
        const data = this.read();
        const existingIndex = data.user_preferences.findIndex(pref => pref.user_id === userId);
        const userPrefs = {
            id: existingIndex !== -1 ? data.user_preferences[existingIndex].id : Date.now() + Math.random(),
            user_id: userId,
            ...preferences,
            updated_at: new Date().toISOString()
        };
        
        if (existingIndex !== -1) {
            data.user_preferences[existingIndex] = userPrefs;
        } else {
            data.user_preferences.push(userPrefs);
        }
        
        this.write(data);
        return userPrefs;
    }

    getUserPreferences(userId) {
        const data = this.read();
        return data.user_preferences.find(pref => pref.user_id === userId) || {
            user_id: userId,
            theme: 'light',
            language: 'en',
            notifications: true,
            auto_save: true
        };
    }
}

module.exports = { Database, initializeDatabase };

