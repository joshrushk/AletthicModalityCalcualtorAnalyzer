# Modal Realism Calculator Suite with Database & Messaging

A comprehensive web application for exploring Takashi Yagisawa's Extended Modal Realism with user authentication, database storage, encrypted passwords, real-time messaging, and social login integration.

## Features

###  Authentication & Security
- **Secure Password Storage**: Passwords are encrypted using bcrypt with salt rounds
- **JWT Token Authentication**: Secure token-based authentication system
- **Social Login**: Google and Facebook OAuth integration
- **Security Questions**: Password recovery system using security questions
- **Password Reset**: Secure password reset without email verification
- **Rate Limiting**: Protection against brute force attacks
- **CORS Protection**: Secure cross-origin resource sharing

###  Real-time Messaging
- **User-to-User Messaging**: Private messaging between registered users
- **Real-time Updates**: WebSocket-based instant messaging
- **Online Status**: See which users are currently online
- **Message History**: Persistent message storage in database
- **Classical Logic Filter**: All messages automatically processed to comply with classical logic principles

### Database Features
- **SQLite Database**: Lightweight, serverless database
- **User Management**: Complete user registration and profile system
- **Quiz History**: Track and store quiz results
- **Profile Management**: User profiles with images, bio, and interests

###  Calculator Tools
- **Numerical World Calculator**: Mathematical analysis of possible worlds
- **Proposition Logic Calculator**: Classical logic translation and analysis
- **Philosophy Quiz**: Interactive knowledge testing system
- **Classical Logic Filter Demo**: Interactive demonstration of message processing

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:3000

# JWT Secret (Change this to a secure random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Session Secret (Change this to a secure random string in production)
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth Configuration
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Database Configuration
DATABASE_URL=./database.sqlite
```

### 3. OAuth Setup

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
6. Copy Client ID and Client Secret to your `.env` file

#### Facebook OAuth Setup
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Set Valid OAuth Redirect URIs: `http://localhost:3000/auth/facebook/callback`
5. Copy App ID and App Secret to your `.env` file

### 4. Start the Server
```bash
# Development mode with auto-restart
npm run dev

# Or production mode
npm start
```

The server will start on `http://localhost:3000`

## Database Schema

### Users Table
- `id`: Primary key
- `email`: Unique email address
- `password`: Hashed password (for local users)
- `name`: User's full name
- `provider`: Authentication provider ('local', 'google', 'facebook')
- `provider_id`: Provider-specific user ID
- `profile_image`: URL to profile image
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

### Security Questions Table
- `id`: Primary key
- `user_id`: Foreign key to users table
- `question_1`: First security question
- `answer_1`: Hashed answer to first question
- `question_2`: Second security question
- `answer_2`: Hashed answer to second question
- `question_3`: Third security question
- `answer_3`: Hashed answer to third question
- `created_at`: Security questions creation timestamp

### User Profiles Table
- `id`: Primary key
- `user_id`: Foreign key to users table
- `display_name`: User's display name
- `bio`: User biography
- `interests`: User interests
- `join_date`: Profile creation date

### Messages Table
- `id`: Primary key
- `sender_id`: Foreign key to users table (sender)
- `receiver_id`: Foreign key to users table (receiver)
- `content`: Processed message content (classical logic compliant)
- `original_content`: Original message before processing
- `message_type`: Type of message ('text', 'image', etc.)
- `logic_processed`: Boolean indicating if message was processed
- `logic_analysis`: JSON data of logical analysis
- `created_at`: Message timestamp
- `read_at`: Message read timestamp

### Quiz History Table
- `id`: Primary key
- `user_id`: Foreign key to users table
- `score`: Quiz score
- `total_questions`: Total number of questions
- `percentage`: Score percentage
- `quiz_data`: JSON data of quiz details
- `created_at`: Quiz completion timestamp

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /auth/google` - Google OAuth login
- `GET /auth/facebook` - Facebook OAuth login

### User Management
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profile/image` - Upload profile image
- `POST /api/change-password` - Change password
- `DELETE /api/delete-account` - Delete user account

### Messaging
- `GET /api/users` - Get list of users
- `GET /api/messages/:userId` - Get messages with specific user
- `POST /api/messages` - Send message

### Quiz History
- `GET /api/quiz-history` - Get user's quiz history
- `POST /api/quiz-history` - Save quiz result
- `DELETE /api/quiz-history/:id` - Delete quiz result

## WebSocket Events

### Client to Server
- `user_online` - Notify server user is online
- `join_conversation` - Join a conversation room
- `leave_conversation` - Leave a conversation room

### Server to Client
- `new_message` - New message received
- `user_status_change` - User online/offline status change

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt with salt rounds
2. **JWT Tokens**: Secure token-based authentication with expiration
3. **Rate Limiting**: API rate limiting to prevent abuse
4. **CORS Protection**: Configured CORS for secure cross-origin requests
5. **Input Validation**: Server-side validation for all inputs
6. **SQL Injection Protection**: Parameterized queries prevent SQL injection
7. **XSS Protection**: Helmet.js provides security headers

## File Structure

```
modal-realism-calculator-suite/
├── server.js                 # Main server file
├── package.json             # Dependencies and scripts
├── database.sqlite          # SQLite database (created automatically)
├── uploads/                 # Profile image uploads directory
├── index.html              # Main application page
├── messaging.html          # Messaging interface
├── profile.html            # User profile page
├── logic-filter-demo.html  # Classical logic filter demonstration
├── classical-logic-filter.js # Classical logic processing module
├── auth.js                 # Authentication utilities
├── modal_realism_calculator.html
├── proposition_calculator.html
├── quiz.html
└── README.md
```

## Classical Logic Filtering

The application includes an advanced classical logic filter that automatically processes all user messages to ensure they comply with classical logic principles, similar to the propositional calculator.

### Features
- **Vague Language Correction**: Converts imprecise terms to specific language
- **Fallacy Detection**: Identifies and corrects logical fallacies
- **Temporal Indexing**: Adds proper time references (t_-1, t_0, t_+1)
- **Modal Operators**: Applies existential (∃w) and universal (∀w) quantification
- **Logical Structure**: Ensures proper sentence structure and logical flow
- **Quantifier Clarification**: Refines universal and existential quantifiers

### Example Transformations
- "I think maybe something might happen" → "I think possibly a specific event might happen (possibly)"
- "You are wrong about everything" → "The argument appears to contain errors (currently)"
- "All people always do the same thing" → "Most people frequently perform similar actions (necessarily)"

### Usage
- All messages in the messaging system are automatically processed
- Original content is preserved and can be viewed
- Logic analysis is displayed for complex messages
- Demo page available at `/logic-filter-demo.html`

## Development

### Adding New Features
1. Create new API endpoints in `server.js`
2. Update frontend JavaScript to call new endpoints
3. Add database migrations if needed
4. Update documentation

### Database Migrations
The database schema is automatically created on first run. For production, consider using a proper migration system.

## Production Deployment

1. **Environment Variables**: Set secure, unique values for all secrets
2. **Database**: Consider using PostgreSQL or MySQL for production
3. **HTTPS**: Enable HTTPS for secure communication
4. **Domain**: Update OAuth redirect URIs for production domain
5. **Monitoring**: Add logging and monitoring for production use

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please create an issue in the repository or contact the development team.

---

**Modal Realism Calculator Suite** - Exploring the Mathematical Structure of Possible Worlds with Modern Web Technologies
