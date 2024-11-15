# CodeNexus

A real-time collaborative coding platform that enables developers to code together, share knowledge, and learn from each other.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [How It Works](#how-it-works)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Future Scope](#future-scope)
- [Business Model](#business-model)
- [Contributing](#contributing)
- [License](#license)

## Overview

CodeNexus is designed to break down barriers in collaborative coding. Whether you're pair programming, teaching, or seeking help, our platform provides the tools needed for seamless real-time collaboration.

## Features

- **Real-time Collaboration**: Code together with WebSocket-powered live editing
- **Monaco Editor Integration**: Rich code editing experience with syntax highlighting
- **Multiple Language Support**: Write and compile code in various programming languages
- **Instant Compilation**: Run your code directly in the browser
- **Peer Assistance**: Request and provide help in real-time
- **User Authentication**: Secure access with NextAuth.js

## Tech Stack

### Frontend

- React
- Next.js (App Router)
- Tailwind CSS
- shadcn/ui
- Monaco Editor
- Socket.IO Client

### Backend

- Node.js
- Express
- Socket.IO
- MongoDB

## How It Works

### Real-time Collaboration System

1. **Connection Establishment**

   - Users connect via Socket.IO
   - Each user gets a unique session ID
   - Online status is tracked and broadcast

2. **Code Synchronization**

   - Changes are captured by Monaco Editor
   - Operational Transformation ensures consistency
   - Message queue handles race conditions
   - Version vectors track change history

3. **Compilation Process**

   - Code is sent to backend
   - Compilation performed in isolated environment
   - Results streamed back to users
   - Errors and output displayed in real-time

4. **Peer Assistance**
   - Users can request help
   - Helpers receive notifications
   - Both parties join same coding session
   - Chat functionality for communication

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/the-Sunny-Sharma/codenexus_v1.git
cd codenexus_v1
```

2. Install dependencies

```bash
 npm install
```

3. Create a `.env` file in the root directory:

```bash
NEXT_PUBLIC_RAPID_API_URL = "https://judge0-ce.p.rapidapi.com"
NEXT_PUBLIC_RAPID_API_HOST = "judge0-ce.p.rapidapi.com"
NEXT_PUBLIC_RAPID_API_KEY = "your_rapid_api_public_key"
AUTH_SECRET = "your_next_auth_secret_key"
AUTH_GOOGLE_ID = ""
AUTH_GOOGLE_SECRET = ""
MONGODB_URI = "mongodb+srv://<username>:<password_here>@<database_name>.injtshl.mongodb.net/?retryWrites=true&w=majority"
```

4. Start development servers

```bash
 npm run dev
```

## Project Structure

```bash
 codenexus/codenexus/
├── src/
│   ├── app/             # Next.js app router pages
│   ├── components/      # React components
│   ├── lib/            # Utility functions
│   └── types/          # TypeScript types
│   └── ...
├── server/             # Socket.IO server
├── public/             # Static assets
└── package.json

```

## Future Scope

### Technical Enhancements

1. **Advanced Collaboration Features**

   1. Voice and video chat integration
   2. Collaborative debugging tools
   3. Code review system
   4. Version control integration

2. **Performance Optimizations**

   1. Implement WebAssembly for compilation
   2. Edge computing for faster response times
   3. Caching strategies for better performance

3. **Enhanced Editor Features**

   1. AI-powered code suggestions
   2. Advanced code analysis
   3. Custom extension support

### Platform Growth

1. **Educational Features**

   1. Interactive tutorials
   2. Code challenges
   3. Learning paths
   4. Achievement system

2. **Community Features**

   1. Public code sessions
   2. Knowledge sharing forum
   3. Expert mentorship

## Business Model

### Freemium Model

1. **Free Tier**

   1. Basic collaboration features
   2. Limited concurrent users
   3. Standard compilation options
   4. Community support

1. **Professional Tier**

   1. Advanced collaboration tools
   2. Unlimited users
   3. Priority compilation
   4. Extended session history
   5. Premium support

1. **Enterprise Tier**

   1. Custom deployment
   2. Advanced security features
   3. API access
   4. Dedicated support
   5. Usage analytics

### Revenue Streams

1. **Subscription Plans**
2. **Enterprise Licensing**
3. **API Access**
4. **Educational Partnerships**
5. **Premium Features**

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

For major changes, please open an issue first.

## License

This project is licensed under the MIT License [LICENSE].
