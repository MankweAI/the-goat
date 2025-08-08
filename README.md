# The GOAT - WhatsApp EdTech MVP

A WhatsApp-based educational platform for Grade 12 South African learners, focusing on mathematics learning through interactive lessons, worked examples, and practice questions.

## 🎯 Project Overview

**Target Users:** Grade 12 South African public school learners  
**Platform:** WhatsApp integration via Baileys  
**Backend:** Node.js + Express  
**Database:** Supabase (PostgreSQL)  
**Pilot Size:** ~40 students  

## 🏗️ Project Structure

```
the-goat-whatsapp-mvp/
├── src/
│   ├── controllers/     # Request handlers
│   ├── models/         # Data models
│   ├── services/       # Business logic
│   ├── utils/          # Helper functions
│   └── templates/      # Message templates
├── config/             # Configuration files
├── docs/              # Documentation
├── tests/             # Test files
├── content/           # Educational content
└── scripts/           # Database scripts
```

## 🚀 Quick Start

1. **Clone and setup:**
   ```cmd
   git clone <repository-url>
   cd the-goat-whatsapp-mvp
   npm install
   ```

2. **Environment setup:**
   ```cmd
   copy .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development:**
   ```cmd
   npm run dev
   ```

## 📋 Development Roadmap

- [x] Project setup and dependencies
- [ ] Database schema design
- [ ] WhatsApp integration
- [ ] Core learning features
- [ ] Pilot launch
- [ ] Evaluation and scaling

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm test` - Run test suite
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data

## 📚 Documentation

- [API Documentation](docs/API.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Message Flows](docs/MESSAGE_FLOWS.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🤝 Contributing

This is an MVP project. For questions or contributions, contact DithetoAI.

## 📄 License

MIT License - see LICENSE file for details.
