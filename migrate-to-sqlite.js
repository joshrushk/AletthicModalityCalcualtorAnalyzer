const fs = require('fs');
const path = require('path');
const { SQLiteDatabase } = require('./database-sqlite');

// Paths
const jsonDbPath = path.join(__dirname, 'database.json');
const sqliteDbPath = path.join(__dirname, 'database.sqlite');

async function migrateData() {
    console.log('Starting migration from JSON to SQLite...');
    
    // Initialize SQLite database
    const sqliteDb = new SQLiteDatabase();
    await sqliteDb.initialize();
    
    try {
        // Read JSON data
        if (!fs.existsSync(jsonDbPath)) {
            console.log('No JSON database found. Creating fresh SQLite database.');
            return;
        }
        
        const jsonData = JSON.parse(fs.readFileSync(jsonDbPath, 'utf8'));
        console.log('JSON database loaded successfully');
        
        // Migrate users
        if (jsonData.users && jsonData.users.length > 0) {
            console.log(`Migrating ${jsonData.users.length} users...`);
            for (const user of jsonData.users) {
                try {
                    await sqliteDb.createUser({
                        email: user.email,
                        password: user.password,
                        name: user.name
                    });
                } catch (error) {
                    console.error(`Error migrating user ${user.email}:`, error.message);
                }
            }
            console.log('Users migration completed');
        }
        
        // Migrate user profiles
        if (jsonData.user_profiles && jsonData.user_profiles.length > 0) {
            console.log(`Migrating ${jsonData.user_profiles.length} user profiles...`);
            for (const profile of jsonData.user_profiles) {
                try {
                    await sqliteDb.createUserProfile({
                        user_id: profile.user_id,
                        bio: profile.bio,
                        avatar_url: profile.avatar_url
                    });
                } catch (error) {
                    console.error(`Error migrating profile for user ${profile.user_id}:`, error.message);
                }
            }
            console.log('User profiles migration completed');
        }
        
        // Migrate security questions
        if (jsonData.security_questions && jsonData.security_questions.length > 0) {
            console.log(`Migrating ${jsonData.security_questions.length} security questions...`);
            for (const sq of jsonData.security_questions) {
                try {
                    await sqliteDb.createSecurityQuestions(sq.user_id, {
                        question1: sq.question1,
                        answer1: sq.answer1,
                        question2: sq.question2,
                        answer2: sq.answer2,
                        question3: sq.question3,
                        answer3: sq.answer3
                    });
                } catch (error) {
                    console.error(`Error migrating security questions for user ${sq.user_id}:`, error.message);
                }
            }
            console.log('Security questions migration completed');
        }
        
        // Migrate messages
        if (jsonData.messages && jsonData.messages.length > 0) {
            console.log(`Migrating ${jsonData.messages.length} messages...`);
            for (const message of jsonData.messages) {
                try {
                    await sqliteDb.createMessage({
                        sender_id: message.sender_id,
                        receiver_id: message.receiver_id,
                        content: message.content
                    });
                } catch (error) {
                    console.error(`Error migrating message ${message.id}:`, error.message);
                }
            }
            console.log('Messages migration completed');
        }
        
        // Migrate quiz results
        if (jsonData.quiz_results && jsonData.quiz_results.length > 0) {
            console.log(`Migrating ${jsonData.quiz_results.length} quiz results...`);
            for (const result of jsonData.quiz_results) {
                try {
                    await sqliteDb.createQuizResult({
                        user_id: result.user_id,
                        score: result.score,
                        total_questions: result.total_questions,
                        answers: result.answers
                    });
                } catch (error) {
                    console.error(`Error migrating quiz result ${result.id}:`, error.message);
                }
            }
            console.log('Quiz results migration completed');
        }
        
        // Migrate calculation history
        if (jsonData.calculation_history && jsonData.calculation_history.length > 0) {
            console.log(`Migrating ${jsonData.calculation_history.length} calculations...`);
            for (const calc of jsonData.calculation_history) {
                try {
                    await sqliteDb.saveCalculation(calc.user_id, {
                        type: calc.type,
                        input: calc.input,
                        result: calc.result,
                        description: calc.description
                    });
                } catch (error) {
                    console.error(`Error migrating calculation ${calc.id}:`, error.message);
                }
            }
            console.log('Calculation history migration completed');
        }
        
        // Migrate user preferences
        if (jsonData.user_preferences && jsonData.user_preferences.length > 0) {
            console.log(`Migrating ${jsonData.user_preferences.length} user preferences...`);
            for (const prefs of jsonData.user_preferences) {
                try {
                    await sqliteDb.saveUserPreferences(prefs.user_id, {
                        theme: prefs.theme,
                        language: prefs.language,
                        notifications: prefs.notifications,
                        auto_save: prefs.auto_save
                    });
                } catch (error) {
                    console.error(`Error migrating preferences for user ${prefs.user_id}:`, error.message);
                }
            }
            console.log('User preferences migration completed');
        }
        
        // Migrate online users
        if (jsonData.online_users && jsonData.online_users.length > 0) {
            console.log(`Migrating ${jsonData.online_users.length} online users...`);
            for (const userId of jsonData.online_users) {
                try {
                    await sqliteDb.addOnlineUser(userId);
                } catch (error) {
                    console.error(`Error migrating online user ${userId}:`, error.message);
                }
            }
            console.log('Online users migration completed');
        }
        
        console.log('Migration completed successfully!');
        
        // Create backup of JSON database
        const backupPath = path.join(__dirname, 'database.json.backup');
        fs.copyFileSync(jsonDbPath, backupPath);
        console.log(`JSON database backed up to ${backupPath}`);
        
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        sqliteDb.close();
    }
}

// Run migration if this file is executed directly
if (require.main === module) {
    migrateData()
        .then(() => {
            console.log('Migration script completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration script failed:', error);
            process.exit(1);
        });
}

module.exports = { migrateData };
