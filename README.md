# 🎉 Clubify - Club Management System

A modern, full-stack club management application built with Next.js, Node.js, and MongoDB.

## 🚀 Features

- **User Management**: Member, Lead, and Board roles
- **Task Assignment**: Create and track tasks
- **Event Management**: Plan and organize club events
- **Sales Tracking**: Manage products and sales
- **Proposal System**: Submit and review proposals
- **Messaging**: Internal communication system
- **Analytics**: Sales and activity analytics

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **UI Components**: Radix UI, Lucide Icons
- **Authentication**: JWT-based authentication

## 📁 Project Structure

```
clubify/
├── client/          # Next.js frontend
├── server/          # Node.js backend
├── vercel.json      # Vercel deployment config
└── README.md
```

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd clubify
   ```

2. **Start the backend**
   ```bash
   cd server
   npm install
   npm run dev
   ```

3. **Start the frontend** (in a new terminal)
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5001

### Environment Variables

#### Backend (.env)
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/clubify
JWT_SECRET=your-secret-key
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5001
```

## 🌐 Deployment

This project is configured for easy deployment on Vercel:

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Deploy automatically**

## 📱 Usage

1. **Sign up** for a new account
2. **Choose your role**: Member, Lead, or Board
3. **Start managing** your club activities!

## 👥 User Roles

- **Members**: Submit proposals, view tasks, send messages
- **Leads**: Assign tasks, create events, manage sales
- **Board**: Oversee leads, system settings, user management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
