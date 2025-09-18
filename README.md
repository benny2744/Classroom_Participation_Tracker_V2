
# Classroom Participation Tracker

A real-time, multi-teacher classroom participation tracking system that allows students to self-submit participation points with teacher approval workflow. Built for educators who need to efficiently manage classroom engagement during busy teaching sessions.

## 🎯 Overview

The Classroom Participation Tracker is a comprehensive online platform that solves the challenge of tracking student participation in real-time during class. Teachers create secure accounts, manage room sessions with unique codes, students join via a simple interface, and participation points are managed through a streamlined approval system.

### Key Features

- **🔐 Secure Teacher Authentication**: Password-based registration and login system
- **🏫 Multi-Teacher Platform**: Support for unlimited concurrent teacher sessions
- **📱 Room Code System**: Simple 6-character codes for easy student access
- **⚡ Real-Time Updates**: Instant synchronization across all connected devices
- **👥 Student Self-Submission**: Students can request 1-3 participation points or raise their hand for teacher attention  
- **✅ Teacher Approval Queue**: Streamlined approval interface with three-tier priority system
- **🙋‍♂️ Raise Hands Feature**: Students can raise hands for attention with highest priority queue placement and teacher acknowledgment
- **👨‍🏫 Call Random Student**: Teachers can randomly select students for participation with second priority placement
- **📊 Presentation View**: Full class roster with live point tracking
- **🎯 Direct Point Controls**: Individual +/- buttons for each student in presentation view
- **⚡ Bulk Point Operations**: Add or subtract points for all students simultaneously
- **🎨 Enhanced UI**: Prominent login buttons and improved user experience
- **🔄 Reset Functionality**: Individual student or full class reset options
- **📱 Responsive Design**: Optimized for all screen sizes with mobile-first design and adaptive layouts
- **📈 CSV Export**: Export participation data for gradebooks
- **📁 CSV Import**: Upload student rosters via CSV files
- **🗑️ Room Management**: Safe room deletion with confirmation dialogs

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and yarn
- PostgreSQL database
- Modern web browser

### Installation

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd classroom_participation_tracker
   cd app
   yarn install
   ```

2. **Environment Setup**
   Create `.env` file in the app directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/participation_tracker"
   
   # Authentication
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # Optional: Cloud storage (if using file uploads)
   AWS_BUCKET_NAME="your-bucket-name"
   AWS_FOLDER_PREFIX="participation-tracker/"
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

#### 1. Getting Started
- Navigate to `/teacher`
- **New teachers**: Click "Don't have an account? Create one"
  - Enter full name, email, and secure password (minimum 6 characters)
  - Click "Create Account"
- **Returning teachers**: Enter email and password, click "Sign In"

#### 2. Creating a Room
- Click "Create Room" on the dashboard
- Enter room name and description
- Upload a CSV file with student names (one name per line)
- Click "Create Room"
- Share the generated 6-character room code with students

#### 3. Managing Existing Rooms
- **Add Students**: Click "Add Students" button on any room card
  - Upload CSV file with new student names
  - System automatically skips duplicates
- **Delete Room**: Click the red trash icon
  - Confirms deletion impact (students and participation records)
  - Permanently removes all associated data

#### 4. Running Sessions
- Click "Present" to start a classroom session
- Toggle room active/inactive as needed
- Use teacher-initiated actions:
  - **Call Random Student**: Click purple button to randomly select a student for participation
- Monitor student submissions in real-time approval queue with priority ordering:
  - **🙋‍♂️ Hand Raises** (Priority 1): Appear first with yellow background and emoji indicator - click "Acknowledge" to clear
  - **👨‍🏫 Teacher Calls** (Priority 2): Your random calls appear with purple background - use "Yes/No" to approve/reject
  - **📚 Point Submissions** (Priority 3): Regular student requests with amber background - use "Yes/No" to approve/reject
- View full class roster with live point updates

#### 5. Presentation Mode
- Use `/teacher/room/[roomCode]/presentation` for classroom display
- Shows full student roster with current points
- **Direct Point Controls**: Use +/- buttons next to each student for instant point adjustments
- **Bulk Point Operations**: Use the buttons at top of approval queue to add/subtract 1 point from all students
- Fixed approval queue remains accessible on the side
- Optimized for screen sharing and projection

#### 6. Reset and Management Options
- **Individual Reset**: Reset specific student's points
- **Class Reset**: Reset entire class (with safety confirmations)
- **Session Reset**: Clear approval queue and reset session
- **CSV Export**: Download participation data for gradebooks

### For Students

#### 1. Joining a Room
- Go to `/student`
- Enter the 6-character room code provided by teacher
- Click "Join Room"

#### 2. Selecting Identity
- Choose your name from the columned student list
- Use radio buttons to select your name
- Click "Continue" to enter the participation interface

#### 3. Submitting Participation
- Choose between:
  - **🙋‍♂️ Raise Hand**: Get teacher attention for questions or help (appears at top of queue with priority)
  - **Point Submission**: Select 1, 2, or 3 points based on your contribution level
- Click the corresponding button (🙋‍♂️ "Raise Hand" or "Submit Points")
- For points: Wait for teacher approval and see your updated points in real-time
- For hand raises: Teacher will be notified and can acknowledge your request

## 🏗️ System Architecture

### Technology Stack

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Node.js with API routes
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: WebSocket connections for live updates
- **Authentication**: Custom password-based authentication with bcrypt
- **Styling**: Tailwind CSS with shadcn/ui components

### Key Components

```
├── app/                    # Next.js 14 app directory
│   ├── api/               # Backend API endpoints
│   │   ├── auth/          # Authentication endpoints
│   │   ├── rooms/         # Room management & bulk operations
│   │   ├── students/      # Student operations & point controls
│   │   ├── participations/# Participation approvals
│   │   ├── reset/         # Reset functionality
│   │   └── export/        # Data export functionality
│   ├── student/           # Student interfaces
│   ├── teacher/           # Teacher interfaces
│   └── components/        # Reusable React components
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
yarn test         # Run test suite (if implemented)
```

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | `postgresql://user:pass@localhost:5432/db` |
| `NEXTAUTH_URL` | Application base URL | Yes | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret key for sessions | Yes | Generate with `openssl rand -base64 32` |
| `AWS_BUCKET_NAME` | S3 bucket for file uploads | No | `my-participation-bucket` |
| `AWS_FOLDER_PREFIX` | S3 folder prefix | No | `participation-tracker/` |

### Development Workflow

1. **Database Changes**: Update `prisma/schema.prisma` and run `yarn prisma db push`
2. **API Endpoints**: Add new routes in `app/api/`
3. **Components**: Create reusable components in `components/`
4. **Authentication**: Extend auth system in `app/api/auth/`
5. **Real-time Features**: Extend WebSocket events in socket implementations

## 📊 Database Schema

### Core Tables

- **Teacher**: Secure teacher accounts with password authentication
- **Room**: Teacher sessions with room codes and settings
- **Student**: Class rosters linked to rooms
- **Session**: Individual class sessions within rooms
- **Participation**: Student participation requests and approvals

### Key Relationships

- Teachers can have multiple Rooms
- Rooms contain multiple Students
- Rooms have multiple Sessions
- Students can have multiple Participations
- Participations belong to specific Sessions

## 🚀 Deployment

### Production Checklist

- [ ] Set secure `NEXTAUTH_SECRET` in production
- [ ] Configure production PostgreSQL database
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Enable HTTPS in production environment
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Test authentication flow
- [ ] Verify real-time functionality

### Performance Considerations

- **Concurrent Support**: 50+ rooms, 1,500+ simultaneous users
- **WebSocket Scaling**: Real-time connections with load balancing
- **Database Optimization**: Indexed queries for real-time updates
- **Responsive Design**: Optimized for all device types
- **Caching Strategy**: Static assets and API response caching

## 🔒 Security Features

- **Password Authentication**: Secure bcrypt hashing (10 rounds)
- **Room Code Validation**: Unique 6-character codes with expiration
- **Rate Limiting**: Prevents abuse of submission endpoints
- **Input Sanitization**: All user inputs validated and sanitized
- **SQL Injection Prevention**: Prisma ORM with prepared statements
- **HTTPS Enforcement**: Secure connections in production
- **Session Management**: Secure local storage with logout capability

## 📈 Monitoring and Analytics

### Key Metrics to Track

- Active rooms and concurrent users
- Student submission and approval rates
- WebSocket connection stability
- Database query performance
- Authentication success/failure rates
- CSV upload success rates

### Performance Metrics

- Page load times
- API response times
- Real-time update latency
- Database connection pool usage
- Memory and CPU utilization

## 🆘 Troubleshooting

### Common Issues

**Students can't join room**
- Verify room is active and room code is correct
- Check that student roster is populated
- Ensure room hasn't been deleted

**Teacher can't login**
- Verify email and password are correct
- Check if account exists (try registration if new)
- Clear browser cache and cookies

**Real-time updates not working**
- Check WebSocket connection in browser dev tools
- Verify server is running and accessible
- Check firewall settings for WebSocket traffic

**CSV upload issues**
- Ensure file is in CSV format (.csv extension)
- Check that file contains one student name per line
- Verify file size is reasonable (under 1MB)

**Performance issues**
- Monitor database connection pool
- Check for memory leaks in WebSocket connections
- Review server resource usage (CPU, RAM)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the coding standards
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Submit a pull request

### Code Standards

- Use TypeScript for all new code
- Follow ESLint configuration
- Write meaningful commit messages
- Add JSDoc comments for functions
- Test all API endpoints
- Ensure responsive design

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For issues and questions:

- **Documentation**: Check this README and technical specifications
- **Issues**: Create an issue in the repository with detailed information
- **Security Concerns**: Contact maintainers directly
- **Feature Requests**: Submit via GitHub issues with "enhancement" label

## 🎉 Acknowledgments

Built with ❤️ for educators who want to enhance classroom engagement and streamline participation tracking. Special thanks to the open-source community for the amazing tools and libraries that make this project possible.

---

**Version**: 2.3.1  
**Last Updated**: September 2024  
**Node.js**: 18+  
**Next.js**: 14.2.28  
**Database**: PostgreSQL with Prisma ORM  
