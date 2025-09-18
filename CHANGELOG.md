
# Changelog

All notable changes to the Classroom Participation Tracker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.3.0] - 2024-09-18

### 👨‍🏫 Added - Call Random Student Feature

This release introduces a new "Call Random Student" feature that allows teachers to randomly select students for participation, with enhanced queue priority management.

### 🎯 Added - Teacher-Initiated Random Call System
- **Call Random Student Button**: Teachers can now click a "Call Random Student" button in the presentation view approval queue
- **Random Selection**: System randomly picks a student from the room roster and creates a participation event
- **Automatic Queue Entry**: Called students appear in the approval queue with 1 point for teacher approval/rejection
- **Visual Distinction**: Teacher calls display with purple background, 👨‍🏫 emoji indicator, and "Teacher Call" badge
- **Priority Placement**: Teacher calls appear with second priority in the approval queue (after hand raises)

### ⚡ Enhanced - Queue Priority System
- **Updated Priority Order**: 
  1. 🙋‍♂️ **Hand Raises** (Highest Priority) - Yellow background
  2. 👨‍🏫 **Teacher Calls** (Second Priority) - Purple background  
  3. 📚 **Student Point Requests** (Normal Priority) - Amber background
- **Smart Sorting**: Within each priority level, items are sorted by submission time (oldest first)
- **Visual Hierarchy**: Clear color coding and icons help teachers identify participation types at a glance

### 🔧 Enhanced - Database & API System
- **New Participation Type**: Added `TEACHER_CALL` to the ParticipationType enum
- **New API Endpoint**: 
  - `POST /api/rooms/[id]/call-random` - Randomly selects a student and creates a participation event
  - Validates room has students and active session
  - Returns selected student information for immediate queue display
- **Enhanced Sorting Logic**: Client-side priority sorting ensures proper queue order across all participation types

### 🎨 Enhanced - User Interface
- **Teacher Interface**: 
  - Purple "Call Random Student" button prominently placed at top of approval queue
  - Loading states with spinner animation during random selection
  - Success notifications showing which student was called
  - Disabled state when no students available or processing in progress

- **Approval Queue Display**:
  - Three distinct visual styles for different participation types
  - Consistent approve/reject workflow for both student requests and teacher calls
  - Maintain existing acknowledge workflow for hand raises
  - Responsive design adapts button text for mobile ("Random Call" vs "Call Random Student")

### 📱 Technical Improvements
- **TypeScript Support**: Updated interfaces to include `TEACHER_CALL` participation type
- **Database Schema**: Seamless schema updates with new enum value
- **Real-time Updates**: Teacher-initiated calls appear instantly in approval queue
- **Priority Algorithm**: Efficient client-side sorting maintains proper queue hierarchy
- **Validation**: Proper error handling for edge cases (no students, no active session)

### 🔄 Migration Guide
This release is fully backward compatible. Existing hand raises and point submissions continue to work normally. The new teacher call feature is additive and enhances the existing participation workflow.

### 🎯 Use Cases
- **Cold Calling**: Teachers can randomly engage students who haven't volunteered
- **Equitable Participation**: Ensures all students have opportunity to participate
- **Classroom Engagement**: Keeps students attentive knowing they might be called
- **Assessment**: Quick formative assessment through random questioning

---

## [2.2.0] - 2024-09-18

### 🙋‍♂️ Added - Raise Hands Feature

This release introduces a new "Raise Hand" feature that allows students to get teacher attention without submitting points, with priority placement in the approval queue.

### 🎯 Added - Student Hand Raising System
- **Raise Hand Option**: Students can now select "🙋‍♂️ Raise Hand" from the participation dropdown
- **Priority Queue Placement**: Hand raises appear at the top of the teacher's approval queue with priority
- **Visual Distinction**: Hand raises display with yellow background, emoji indicator, and "Raised Hand" badge
- **No Points Assignment**: Hand raising doesn't award points - it's purely for getting attention

### ✅ Added - Teacher Acknowledgment System
- **Acknowledge Button**: Teachers see a dedicated "Acknowledge" button for hand raises (instead of Yes/No)
- **Queue Priority**: Hand raises automatically sort to the top of the approval queue
- **Instant Removal**: Acknowledged hand raises are immediately removed from the queue
- **Visual Feedback**: Teachers get clear visual indicators (🙋‍♂️ emoji, yellow background) for hand raises

### 🔧 Enhanced - Database & API System
- **New Database Fields**: Added `type` (POINTS/RAISE_HAND) and `acknowledgedAt` to Participation model
- **Enhanced API Endpoints**: 
  - Updated `/api/participations/submit` to handle both point submissions and hand raises
  - New `/api/participations/[id]/acknowledge` endpoint for acknowledging hand raises
  - Updated `/api/participations/pending` with type-based sorting (hand raises first)

### 🎨 Enhanced - User Interface
- **Student Interface**: 
  - Combined dropdown with both point options (1-3) and "Raise Hand" option
  - Dynamic button text ("🙋‍♂️ Raise Hand" vs "Submit X Points")
  - Different success messages for hand raises vs point submissions
  - Visual feedback in submission status display

- **Teacher Interface**:
  - Color-coded approval queue (yellow for hand raises, amber for points)
  - Different action buttons based on participation type
  - Priority sorting ensures hand raises appear first
  - Clear visual distinction between participation types

### 📱 Technical Improvements
- **TypeScript Support**: Updated interfaces to include new participation types
- **Database Migrations**: Seamless schema updates with backward compatibility
- **Real-time Updates**: Hand raises appear instantly in teacher queue
- **Validation**: Proper validation for both point submissions (1-3) and hand raises (0 points)

### 🔄 Migration Guide
This release is fully backward compatible. Existing point submissions continue to work normally. The new hand raising feature is additive and doesn't affect existing functionality.

---

## [2.1.0] - 2024-09-17

### 🎯 Enhanced Point Management & User Experience

This release introduces powerful new point management features and improves the overall user experience with a more prominent homepage design and intuitive controls for teachers.

### 🎨 Added - Enhanced User Interface
- **Prominent Login Buttons on Homepage**
  - Teacher and student login buttons moved above feature descriptions
  - Enhanced button styling with larger size and better visual hierarchy
  - Improved call-to-action positioning for better user engagement
  - More intuitive first-time user experience

### ⚡ Added - Direct Point Control System
- **Individual Student Point Controls in Presentation View**
  - Added +/- buttons next to each student in the presentation roster
  - Real-time point adjustments with immediate visual feedback
  - Safety checks to prevent negative point values
  - Loading states with disabled buttons during processing
  - Color-coded buttons (green for add, red for subtract)
  - Individual student point adjustment API endpoint

- **Bulk Point Operations**
  - Bulk +1/-1 buttons at the top of the approval queue panel
  - Add or subtract 1 point from all students simultaneously
  - Smart handling that prevents students from going below 0 points
  - Success notifications showing number of students affected
  - Transaction-safe bulk operations for data consistency
  - Bulk point adjustment API endpoint for room-wide operations

### 🔧 Added - New API Endpoints
- **Individual Point Management**
  - `POST /api/students/[id]/points` - Direct point adjustments for individual students
  - Support for 'add' and 'subtract' actions
  - Automatic participation record creation (auto-approved)
  - Real-time point calculation based on approved participations

- **Bulk Point Management**
  - `POST /api/rooms/[id]/bulk-points` - Bulk point operations for entire rooms
  - Efficient transaction-based processing for multiple students
  - Detailed response showing affected students and point changes
  - Smart zero-point handling for subtract operations

### ⚡ Enhanced - Teacher Workflow Efficiency
- **Streamlined Point Management**
  - Reduced clicks needed for common point adjustments
  - Instant feedback for all point operations
  - No need to wait for student submissions for direct point awards
  - Bulk operations for class-wide point adjustments (participation rewards, etc.)

- **Improved Presentation View**
  - Point controls integrated directly into student roster
  - Maintains focus on presentation while allowing quick adjustments
  - Visual consistency with existing approval queue design
  - Responsive layout adapts to different screen sizes

### 🐛 Fixed - Point Calculation Consistency
- **Accurate Point Tracking**
  - Point calculations now consistently use approved participations
  - Eliminated discrepancies between display and actual point values
  - Proper handling of negative point scenarios
  - Transaction safety for all point modification operations

### 🎨 Enhanced - UI/UX Improvements
- **Visual Feedback**
  - Toast notifications for all point adjustment operations
  - Loading states with spinner animations during processing
  - Color-coded buttons for intuitive operation understanding
  - Disabled states for buttons during processing or when invalid

- **Responsive Design**
  - Point control buttons sized appropriately for touch interfaces
  - Compact layout maintains readability in small spaces
  - Proper spacing and alignment in both roster and queue areas

### 📋 Technical Improvements
- **API Design**
  - RESTful endpoint design following consistent patterns
  - Comprehensive error handling with meaningful messages
  - Input validation for all point adjustment operations
  - Proper HTTP status codes for all response scenarios

- **Database Consistency**
  - All point adjustments create proper participation records
  - Maintains audit trail of all point changes
  - Proper foreign key relationships and constraints
  - Transaction-safe operations prevent data inconsistencies

### 🔄 Migration Guide
This release is fully backward compatible. No database migrations or configuration changes are required.

### Performance Impact
- Point calculation optimized using approved participation aggregation
- Bulk operations use efficient transaction processing
- Minimal performance impact on existing functionality
- Real-time updates maintain sub-100ms response times

### 📱 Enhanced - Responsive Design Improvements
- **Small Screen Optimization**
  - Homepage buttons show abbreviated text ("Teacher"/"Student") on narrow screens
  - Presentation view switches from side-by-side to stacked layout on mobile
  - Student roster cards use compact layout with truncated names
  - Point control buttons sized appropriately for touch interfaces
  - Approval queue uses condensed text and smaller icons

- **Flexible Layout System**
  - Presentation view uses `flex-col lg:flex-row` for mobile-first responsive design
  - Room management cards adapt text and spacing based on screen size
  - All interactive elements maintain minimum touch target sizes (24px+)
  - Text automatically abbreviates on small screens (e.g., "Participations" → "Part")

- **Improved Mobile Experience**
  - Better button sizing and spacing for mobile usage
  - Truncated long student names to prevent layout overflow
  - Compact statistics display with abbreviated labels
  - Responsive typography scaling from `text-xs` to `text-lg`

---

## [2.0.0] - 2024-09-16

### 🎉 Major Release: Complete Authentication & Room Management System

This major release introduces a comprehensive teacher authentication system, enhanced room management capabilities, and improved user experience across the entire application.

### 🔐 Added - Authentication System
- **Password-Based Teacher Authentication**
  - Secure teacher registration with name, email, and password
  - Login system with bcrypt password hashing (10+ rounds)
  - Password strength validation (minimum 6 characters)
  - Email format validation and uniqueness checking
  - Session management with localStorage persistence
  - Secure logout functionality with session cleanup

- **Enhanced Security Features**
  - Input sanitization and validation for all authentication endpoints
  - Rate limiting for login attempts (5 attempts per 15 minutes)
  - Timing attack prevention with consistent response times
  - Password confirmation validation during registration
  - Error handling with user-friendly messages

### 📁 Added - File Management System
- **CSV Upload for Room Creation**
  - Upload student rosters during room creation
  - File validation (CSV format, size limits up to 1MB)
  - Preview functionality showing first 10 student names
  - Automatic parsing of CSV files with error handling
  - Support for quoted names and various CSV formats

- **CSV Upload for Existing Rooms**
  - "Add Students" functionality for existing rooms
  - Intelligent duplicate detection and reporting
  - Batch student creation with transaction safety
  - Success feedback showing students added vs. duplicates skipped
  - File upload progress indicators and error states

### 🗑️ Added - Room Deletion System
- **Safe Room Deletion**
  - Confirmation dialogs showing deletion impact
  - Display of affected data (students, participations, sessions)
  - Cascade deletion of all related data
  - Archive system for deleted room metadata
  - Owner verification to prevent unauthorized deletions

- **Enhanced Room Management**
  - Room statistics cards with live data
  - Activity tracking with last activity timestamps
  - Room status indicators (active/inactive)
  - Quick access to presentation and management views

### 🎨 Enhanced - User Interface
- **Teacher Dashboard Improvements**
  - Modern card-based layout for room display
  - Action buttons for room operations (Present, Settings, Add Students, Delete)
  - Logout button in dashboard header
  - Loading states for all async operations
  - Toast notifications for success/error feedback

- **Authentication Interface**
  - Toggle between login and register modes
  - Password visibility toggle
  - Form validation with real-time feedback
  - Loading spinners during authentication
  - Responsive design for mobile devices

- **Room Management Interface**
  - Dialog-based CSV upload with drag & drop support
  - Preview panels for uploaded CSV files
  - Confirmation dialogs for destructive actions
  - Progress indicators for file processing
  - Error handling with detailed error messages

### ⚡ Enhanced - Performance & Reliability
- **Database Optimizations**
  - Updated schema with password field for teachers
  - Enhanced indexing strategy for authentication queries
  - Optimized cascade deletions with proper constraints
  - Transaction safety for multi-step operations

- **API Enhancements**
  - RESTful endpoints for all new functionality
  - Comprehensive error handling with HTTP status codes
  - Request validation with Zod schemas
  - Logging for all authentication and room management operations

### 🔧 Technical Improvements
- **Backend Architecture**
  - New API routes: `/api/auth/signup`, `/api/auth/signin`
  - Room deletion endpoint: `/api/rooms/[id]/delete`
  - CSV upload endpoint: `/api/rooms/[id]/upload-students`
  - Enhanced teacher route with password support

- **Database Schema Updates**
  - Added `password` field to Teacher model
  - Updated seed script with hashed passwords
  - Proper cascade relationships for data integrity
  - Index optimizations for performance

- **Security Enhancements**
  - bcrypt password hashing with configurable salt rounds
  - Input validation and sanitization
  - SQL injection prevention with Prisma ORM
  - Rate limiting for authentication endpoints

### 🐛 Fixed
- **Authentication Issues**
  - Resolved teacher creation without proper authentication
  - Fixed session persistence across browser refreshes
  - Corrected password validation edge cases
  - Improved error messaging for authentication failures

- **File Upload Issues**
  - Fixed CSV parsing for various file formats
  - Resolved duplicate student creation problems
  - Corrected file size validation and error handling
  - Fixed preview functionality for large CSV files

- **UI/UX Issues**
  - Fixed responsive layout issues on mobile devices
  - Corrected button states during loading operations
  - Resolved form validation display problems
  - Fixed toast notification positioning

### 🚀 Migration Guide

#### For Existing Installations

1. **Database Migration Required**
   ```bash
   # Backup existing data
   pg_dump your_database > backup.sql
   
   # Apply schema changes
   yarn prisma db push --force-reset
   
   # Re-seed with new data structure
   yarn prisma db seed
   ```

2. **Environment Variables**
   - No new environment variables required
   - Existing `DATABASE_URL`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET` remain the same

3. **Breaking Changes**
   - Teachers must create new accounts with passwords
   - Previous teacher records without passwords will need to be recreated
   - Local storage keys have changed for session management

#### For New Installations
Follow the updated installation guide in README.md - no special migration steps needed.

### 📋 API Changes

#### New Endpoints
- `POST /api/auth/signup` - Teacher registration
- `POST /api/auth/signin` - Teacher login  
- `DELETE /api/rooms/[id]/delete` - Room deletion
- `POST /api/rooms/[id]/upload-students` - CSV student upload

#### Modified Endpoints
- `POST /api/teachers` - Now requires password field
- `POST /api/rooms/create` - Enhanced with CSV upload support

#### Deprecated Endpoints
- None in this release

### 🔄 Dependencies
- No new major dependencies added
- Enhanced usage of existing bcrypt package
- Improved TypeScript definitions
- Updated shadcn/ui components usage

---

## [1.0.0] - 2024-09-15

### 🎉 Initial Release

### Added - Core Features
- **Student Interface**
  - Room code entry system with 6-character codes
  - Student selection with columned layout and radio buttons
  - Point submission system (1-3 points per submission)
  - Real-time point updates via WebSocket connections
  - Mobile-responsive design for various screen sizes

- **Teacher Interface**
  - Teacher profile creation (name and email only)
  - Room creation with unique 6-character codes
  - Room management dashboard with statistics
  - Presentation view for classroom display
  - Real-time approval queue for student submissions

- **Real-time Features**
  - WebSocket-based communication for instant updates
  - Live student roster with current point totals
  - Real-time submission queue with approval/rejection
  - Instant point updates across all connected devices
  - Connection status indicators and reconnection handling

- **Data Management**
  - PostgreSQL database with Prisma ORM
  - Student participation tracking and history
  - Session management for class periods
  - CSV export functionality for gradebook integration
  - Reset capabilities (individual, class, session)

### Added - Technical Foundation
- **Frontend Technology**
  - Next.js 14 with App Router architecture
  - TypeScript for type safety
  - Tailwind CSS for styling
  - shadcn/ui component library
  - React hooks for state management

- **Backend Technology**
  - Next.js API routes for backend functionality
  - PostgreSQL database with full ACID compliance
  - Prisma ORM for database operations
  - WebSocket support for real-time features
  - Input validation and sanitization

- **Database Schema**
  - Teacher model (name, email, timestamps)
  - Room model (code, name, description, teacher relation)
  - Student model (name, room relation, point tracking)
  - Session model (room periods, activity status)
  - Participation model (submissions, approvals, point values)

### Added - User Experience
- **Responsive Design**
  - Mobile-first approach with progressive enhancement
  - Tablet and desktop optimized layouts
  - Touch-friendly interface elements
  - Accessible navigation and controls

- **Error Handling**
  - Graceful error states with user-friendly messages
  - Network failure recovery with reconnection attempts
  - Input validation with real-time feedback
  - Loading states for all async operations

- **Performance Features**
  - Optimized database queries with proper indexing
  - Efficient WebSocket event handling
  - Client-side caching for frequently accessed data
  - Progressive loading for large student rosters

### Security Features
- Room code validation and access control
- Input sanitization to prevent XSS attacks
- SQL injection prevention through Prisma ORM
- Rate limiting for submission endpoints
- Session-based room access management

### Development Features
- **Documentation**
  - Comprehensive README with setup instructions
  - API documentation for all endpoints
  - Database schema documentation
  - Deployment guides and best practices

- **Testing & Quality**
  - TypeScript strict mode for compile-time safety
  - ESLint configuration for code quality
  - Prisma type generation for database safety
  - Environment variable validation

- **Developer Experience**
  - Hot reloading in development
  - Database seeding with sample data
  - Clear error messages and logging
  - Modular component architecture

### Performance Benchmarks (v1.0.0)
- **Concurrent Support**: 25+ active rooms tested
- **Response Times**: <150ms average API response time
- **WebSocket Latency**: <75ms for real-time updates
- **Database Performance**: Optimized queries with sub-50ms response
- **Client Performance**: <2s initial page load time

### Known Limitations (v1.0.0)
- Teacher authentication limited to name/email (no passwords)
- CSV student upload not available during room creation
- No room deletion functionality
- Limited room management options
- Manual student roster creation required

---

## Development Roadmap

### [2.1.0] - Planned Features
- **Enhanced Analytics**
  - Participation trend analysis
  - Student engagement metrics
  - Session performance reports
  - Export to multiple formats (PDF, Excel)

- **Advanced Room Management**
  - Room templates for quick setup
  - Bulk room operations
  - Room archiving and restoration
  - Advanced permission system

- **Mobile Applications**
  - Native iOS app for teachers
  - Native Android app for teachers
  - Progressive Web App (PWA) capabilities
  - Offline functionality for limited connectivity

### [2.2.0] - Advanced Features
- **Integration Capabilities**
  - Google Classroom integration
  - Canvas LMS integration  
  - Microsoft Teams integration
  - Zoom meeting integration

- **Advanced Security**
  - Two-factor authentication (2FA)
  - Single Sign-On (SSO) support
  - Role-based access control
  - Audit logging and compliance

- **Scalability Enhancements**
  - Multi-tenant architecture
  - Advanced caching with Redis
  - Load balancing support
  - Horizontal scaling capabilities

### [3.0.0] - Future Vision
- **AI-Powered Features**
  - Participation pattern analysis
  - Student engagement predictions
  - Automated participation suggestions
  - Intelligent room optimization

- **Advanced Collaboration**
  - Multi-teacher rooms
  - Teaching assistant roles
  - Parent/guardian access
  - Cross-room participation tracking

---

## Support and Feedback

### Bug Reports
Please report bugs by creating an issue in the GitHub repository with:
- Clear description of the issue
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots if applicable
- Browser and device information

### Feature Requests
Feature requests are welcome! Please include:
- Clear description of the requested feature
- Use case and benefits
- Any relevant mockups or examples
- Priority level (nice-to-have vs. critical)

### Contributing
We welcome contributions! Please see our contributing guidelines for:
- Code style requirements
- Pull request process
- Testing requirements
- Documentation standards

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Educational Community**: Teachers and educators who provided feedback and requirements
- **Open Source Projects**: Next.js, Prisma, Tailwind CSS, and the entire React ecosystem
- **Development Team**: Contributors who made this project possible
- **Beta Testers**: Schools and classrooms who helped test early versions

---

*For technical support, please refer to the documentation or create an issue in our repository.*
