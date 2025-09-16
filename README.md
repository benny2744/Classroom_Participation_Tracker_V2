
# Classroom Participation Tracker

A real-time, multi-teacher classroom participation tracking system that allows students to self-submit participation points with teacher approval workflow. Built for educators who need to efficiently manage classroom engagement during busy teaching sessions.

## 🎯 Overview

The Classroom Participation Tracker is an online platform that solves the challenge of tracking student participation in real-time during class. Teachers create room sessions with unique codes, students join via a simple landing page, and participation points are managed through a streamlined approval system.

### Key Features

- **Multi-Teacher Platform**: Support for unlimited concurrent teacher sessions
- **Room Code System**: Simple 6-character codes for easy student access
- **Real-Time Updates**: Instant synchronization across all connected devices
- **Student Self-Submission**: Students can request 1-3 participation points
- **Teacher Approval Queue**: Streamlined yes/no approval interface
- **Presentation View**: Full class roster with live point tracking
- **Reset Functionality**: Individual student or full class reset options
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **CSV Export**: Export participation data for gradebooks

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Modern web browser

### Installation

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd classroom_participation_tracker
   yarn install
   ```

2. **Environment Setup**
   Create `.env.local` file:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/participation_tracker"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

3. **Database Setup**
   ```bash
   yarn prisma generate
   yarn prisma db push
   yarn prisma db seed
   ```

4. **Start Development Server**
   ```bash
   yarn dev
   ```

   Access at: `http://localhost:3000`

## 📚 Usage Guide

### For Teachers

#### 1. Creating a Room
- Navigate to `/teacher`
- Click "Create New Room"
- Enter room name and upload one-column CSV file with student names
- Share the generated 6-character room code with students

#### 2. Managing Sessions
- Toggle room active/inactive as needed
- Monitor student submissions in real-time
- Use the approval queue for quick yes/no decisions
- View full class roster with live point updates

#### 3. Presentation Mode
- Use `/teacher/[roomCode]/presentation` for classroom display
- Shows full student roster with current points
- Fixed approval queue remains accessible
- Optimized for screen sharing and projection

#### 4. Reset Options
- **Individual Reset**: Reset specific student's points
- **Class Reset**: Reset entire class (with safety confirmations)
- **Session Reset**: Clear approval queue and reset session

### For Students

#### 1. Joining a Room
- Go to `/student`
- Enter the 6-character room code
- Select your name from the columned student list using radio buttons

#### 2. Submitting Points
- Choose point amount (1, 2, or 3) from the dropdown at the top
- Click submit
- Wait for teacher approval
- See your updated points in real-time

## 🏗️ Architecture

### System Components

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Node.js with Express and Socket.io
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: WebSocket connections for live updates
- **Authentication**: Room-based access control

### Key Directories

```
├── pages/                  # Next.js pages and API routes
│   ├── api/               # Backend API endpoints
│   ├── student/           # Student interfaces
│   ├── teacher/           # Teacher interfaces
│   └── index.tsx          # Landing page
├── components/            # Reusable React components
├── lib/                   # Utility libraries and configurations
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── styles/               # CSS and styling
```

## 🔧 Development

### Available Scripts

```bash
yarn dev          # Start development server
yarn build        # Build for production
yarn start        # Start production server
yarn lint         # Run ESLint
yarn prisma       # Prisma CLI commands
yarn test         # Run test suite
```

### Environment Variables

Required environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `NEXTAUTH_URL` | Application base URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret key for sessions | Generate with `openssl rand -base64 32` |

### Development Workflow

1. **Database Changes**: Update `prisma/schema.prisma` and run `yarn prisma db push`
2. **API Endpoints**: Add new routes in `pages/api/`
3. **Components**: Create reusable components in `components/`
4. **Real-time Features**: Extend WebSocket events in `lib/socket.ts`

## 📊 Database Schema

### Core Tables

- **Room**: Teacher sessions with room codes and settings
- **Student**: Class rosters linked to rooms
- **Submission**: Student participation requests
- **ApprovalQueue**: Pending teacher approvals

See `ARCHITECTURE.md` for detailed schema documentation.

## 🚀 Deployment

### Production Build

```bash
yarn build
yarn start
```

### Environment Setup

Ensure production environment variables are configured:
- Set `NEXTAUTH_URL` to your production domain
- Use a secure `NEXTAUTH_SECRET`
- Configure production PostgreSQL database

### Performance Considerations

- Supports 50+ concurrent rooms
- WebSocket connections scale with load balancing
- Database queries optimized for real-time updates
- Responsive design works across all device types

## 🔒 Security Features

- Room code validation and expiration
- Rate limiting on submissions
- Session-based access control
- Input sanitization and validation
- HTTPS enforcement in production

## 📈 Monitoring

Key metrics to monitor:
- Active rooms and concurrent users
- WebSocket connection stability
- Database query performance
- Student submission and approval rates

## 🆘 Troubleshooting

### Common Issues

**Students can't join room**
- Verify room is active
- Check room code spelling
- Confirm student roster is populated

**Real-time updates not working**
- Check WebSocket connection
- Verify CORS settings
- Confirm database connectivity

**Performance issues**
- Monitor database query performance
- Check WebSocket connection limits
- Review server resource usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For issues and questions:
- Check the troubleshooting section above
- Review the architecture documentation
- Create an issue in the repository

---

Built with ❤️ for educators who want to enhance classroom engagement and streamline participation tracking.
