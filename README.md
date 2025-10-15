# Dynamic Profile API

A Node.js/Express API that provides a dynamic profile endpoint with real-time cat facts from an external API.

## 🚀 Features

- **Dynamic Profile Endpoint**: GET `/api/v1/me` returns profile information with current timestamp
- **Cat Facts Integration**: Fetches random cat facts from [Cat Facts API](https://catfact.ninja/fact)
- **Graceful Error Handling**: Fallback cat facts when external API is unavailable
- **Rate Limiting**: Built-in protection against abuse
- **CORS Support**: Configurable cross-origin resource sharing
- **Swagger Documentation**: Interactive API documentation
- **Logging**: Comprehensive logging with Winston
- **TypeScript**: Full TypeScript support with type safety

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (optional, for user management features)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Peliah/dynamic-profile
   cd dynamic-profile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=3030
   MONGODB_URI=mongodb://localhost:27017/dynamic-profile
   JWT_SECRET=your-jwt-secret-here
   WHITELIST_ORIGINS=http://localhost:3000,http://localhost:3030
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

The server will start on `http://localhost:3030` (or your configured PORT).

## 📚 API Documentation

### Core Endpoint

#### GET `/api/v1/me`
Returns a dynamic profile with a random cat fact.

**Response:**
```json
{
  "status": "success",
  "user": {
    "email": "pelepoupa@gmail.com",
    "name": "Pelayah Epoupa",
    "stack": "Node.js/Express"
  },
  "timestamp": "2025-01-15T12:34:56.789Z",
  "fact": "The technical term for a cat's hairball is a 'bezoar.'"
}
```

**Features:**
- ✅ Dynamic timestamp (ISO 8601 format)
- ✅ Random cat fact on every request
- ✅ Graceful fallback if Cat Facts API is down
- ✅ No authentication required

### Interactive Documentation
Visit `http://localhost:3030/api-docs` for Swagger UI documentation.

## 🧪 Testing

### Test the `/me` endpoint
```bash
# Using curl
curl -X GET http://localhost:3030/api/v1/me -H "Content-Type: application/json"


### Expected Response
- Status code: `200 OK`
- Content-Type: `application/json`
- All required fields present
- Different cat fact on each request
- Current UTC timestamp

## 🏗️ Project Structure

```
src/
├── config/           # Configuration files
├── controllers/      # Route controllers
│   └── v1/
│       ├── auth/     # Authentication controllers
│       ├── profile/  # Profile controllers
│       └── user/     # User management controllers
├── lib/              # Utility libraries
├── middleware/       # Express middleware
├── models/           # Database models
├── routes/           # Route definitions
│   └── v1/
├── utils/            # Utility functions
│   ├── catFacts.ts   # Cat Facts API integration
│   └── index.ts      # Utility exports
└── server.ts         # Main server file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3030` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/dynamic-profile` |
| `JWT_SECRET` | JWT signing secret | Required |
| `WHITELIST_ORIGINS` | CORS allowed origins | `http://localhost:3030` |

### CORS Configuration
The API supports CORS with configurable origins. In development, all origins are allowed. In production, only whitelisted origins are permitted.

## 🛡️ Security Features

- **Rate Limiting**: Prevents API abuse
- **Helmet**: Security headers
- **CORS**: Cross-origin request protection
- **Input Validation**: Request validation with express-validator
- **Error Handling**: Graceful error responses

## 📦 Dependencies

### Core Dependencies
- `express`: Web framework
- `typescript`: Type safety
- `winston`: Logging
- `cors`: Cross-origin resource sharing
- `helmet`: Security headers
- `express-rate-limit`: Rate limiting

### Development Dependencies
- `nodemon`: Development server
- `ts-node`: TypeScript execution
- `tsc-alias`: TypeScript path aliases


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill process on port 3030
lsof -ti:3030 | xargs kill -9
```

**MongoDB connection issues**
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network connectivity

**Cat Facts API errors**
- The API includes fallback cat facts
- Check internet connectivity
- Review rate limiting

### Logs
Check application logs for detailed error information:
```bash
# Development
npm run dev

# Production
pm2 logs
```

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check the API documentation at `/api-docs`
- Review the logs for error details

---

**Happy coding! 🐱**
