*This project has been created as part of the 42 curriculum by kgulfida, amayuk, sgokcu, abostano.*

# Planora

## Description

**Planora** is a collaborative task management and communication platform built around the concept of **Circles**. A Circle represents a shared workspace where users can organize tasks, create checklists, assign responsibilities, and communicate in real time.

Inside each Circle, users can:
- Create and manage tasks
- Assign tasks to one or multiple members
- Build checklists
- Chat in real time
- Exchange private messages
- Collaboratively interact with a shared Sudoku game

All core interactions are synchronized instantly using WebSockets, allowing users to work together without refreshing the page.

### Main Goals of the Project

The aim of Planora is to provide:
- A structured environment for group task distribution
- Real-time collaboration
- Simple and intuitive communication tools
- An engaging shared game experience inside each Circle

---

## Team Information

### Members and Roles

- **kgulfida** – Product Owner
- **amayuk** – Project Manager
- **sgokcu** – Technical Lead
- **abostano** – Developer

### Responsibilities

- **sgokcu**
  - Home page
  - Sudoku system
  - Login and Register system
  - UI design for several components

- **amayuk**
  - Dashboard page
  - Chat system
  - Design language and color palette
  - Interface designs and components

- **kgulfida**
  - Chat system
  - Direct Messages
  - Sudoku features
  - KVKK text
  - Task editing system

- **abostano**
  - Docker infrastructure
  - Database architecture
  - API endpoints
  - Debugging and bug fixing

---

## Project Management

### Work Organization

The project was organized through clear feature ownership and task distribution. Each team member focused on specific modules while collaborating on integrations and testing.

### Tools Used

- **Task tracking:** GitHub Issues
- **Communication:** WhatsApp
- **Version control:** Git and GitHub

Regular discussions and meetings were held to ensure smooth coordination and problem solving.

---

## Technical Stack

### Frontend

- **React.js**
- **Bootstrap 5** for responsive design and styling

### Backend

- **Django**
- **Django REST Framework**
- **Django Channels** for WebSocket-based real-time features

### Database

- **PostgreSQL**

PostgreSQL was chosen because it provides strong relational data modeling, stability, and excellent support for multi-user applications.

### Deployment

- Fully containerized using **Docker** and **Docker Compose**
- Entire system can be started with a single command

---

## Database Schema

The database structure of Planora is designed around collaboration within Circles. The main entities and their relationships are summarized below:

### Core Entities

- **Users**
  - Managed by Django's built-in authentication system.
  - Each user can belong to multiple Circles and interact with tasks, messages, and games.

- **User Profiles**
  - Extends the default User model.
  - Stores additional information such as avatar, online status, and KVKK acceptance.

- **Circles**
  - Represents collaborative workspaces.
  - Each Circle has an admin and multiple members.
  - Users can join multiple Circles.

### Task Management

- **Tasks**
  - Belong to a specific Circle.
  - Can be of different types: Assignment, Checklist, or Note.
  - Can be assigned to one or more users.
  - Include status tracking (To Do, In Progress, Done).

- **Checklist Items**
  - Sub-items linked to a Task.
  - Used for checklist-style tasks with individual completion states.

### Communication

- **Circle Messages**
  - Real-time chat messages exchanged within a Circle.
  - Linked to both a Circle and a sender.

- **Direct Messages**
  - Private messages exchanged directly between two users.
  - Support read/unread status.

### Gaming

- **Sudoku Game**
  - Each Circle can have one active shared Sudoku game.
  - Stores the board state and progress.
  - Enables multiple users to interact with the same game in real time.

### Relationships Overview

- Users can be members of many Circles.
- Circles contain Tasks and Messages.
- Tasks can have multiple assigned Users.
- Each Circle can host one shared Sudoku game.
- Users can communicate via Circle chat or private Direct Messages.

This schema supports real-time collaboration, task management, and interactive features in a structured and scalable way.

---

## Features List

### Authentication and Profiles

- User registration and login
- Google OAuth authentication
- User profiles
- Online/offline status

### Circle System

- Create Circles
- Join multiple Circles
- Invite system
- Admin controls (kick members)

### Task Management

- Create tasks
- Assign tasks to users
- Edit tasks
- Create checklists
- Real-time task updates without page refresh

### Communication

- Real-time Circle chat
- Private Direct Messages

### Shared Sudoku

- One synchronized Sudoku board per Circle
- Multiple users can interact with the same board
- Real-time updates for all participants

### Legal Compliance

- KVKK / Privacy Policy page
- Terms of Service page

---

## Modules

### Major Modules (2 Points Each)

1. **Use a framework for both frontend and backend – 2 pts**
   - React for frontend
   - Django + DRF for backend

2. **Implement real-time features using WebSockets – 2 pts**
   - Chat, tasks, status updates, and Sudoku are synchronized in real time

3. **Standard user management and authentication – 2 pts**
   - Secure login, registration, and profile management

4. **Organization system – 2 pts**
   - Circles act as structured collaborative organizations

5. **Multiplayer game (more than two players) – 2 pts**
   - Shared real-time Sudoku allowing multiple users to participate simultaneously

### Minor Modules (1 Point Each)

1. **Use an ORM – 1 pt**
   - Django ORM used for all database operations

2. **Real-time collaborative features – 1 pt**
   - Task updates and interactions synchronized live

3. **Support for additional browsers – 1 pt**
   - Fully tested on **Firefox, Safari, and Chrome**

4. **Remote authentication with OAuth 2.0 – 1 pt**
   - Google OAuth login implemented

### Total Points

- Major: 10
- Minor: 4
- **Total: 14 Points**

> The "Public API" module was intentionally not claimed because the project does not implement an external API with API-key security and full documentation as required by that module.

---

## Instructions

### Prerequisites

- Docker
- Docker Compose
- A modern web browser (Chrome, Firefox, or Safari)

### Setup

1. Create environment configuration:

```bash
cd srcs
cp .env-temp .env
```

2. Configure Google OAuth (if needed):
   - See `GOOGLE_OAUTH_SETUP.md` for detailed instructions
   - Update `.env` file with your Google OAuth credentials

3. Build and start the application:

```bash
cd ..  # Return to project root
make
```

4. Open the application in your browser:

```
https://localhost:8443
```

**Note:** The application runs on custom ports:
- HTTPS: **8443** (recommended)
- HTTP: **8080** (redirects to HTTPS)

**SSL Certificate Warning:** On first access, your browser will show a security warning because we use a self-signed certificate. This is normal for local development. Click "Advanced" and proceed to localhost.


### Security Notes

- Token-based authentication secures protected endpoints
- Only authentication routes are public
- All user input is validated on both frontend and backend

### Resources

- **Django REST Framework** – [official documentation](https://www.django-rest-framework.org/)
- **React** – [official documentation](https://react.dev/)
- **Django Channels** – [real-time WebSocket integration](https://channels.readthedocs.io/)
- **Bootstrap 5** – [responsive UI framework](https://getbootstrap.com/)

### AI Usage

AI tools were used to:

- Help debug issues
- Generate UI and UX improvement ideas
- Assist in preparing technical documentation

All AI-assisted content was reviewed and verified by the team.

### Individual Contributions

**kgulfida**
- Chat and Direct Messages
- Task editing system
- KVKK text
- Sudoku contributions

**amayuk**
- Dashboard
- Chat UI
- Design system and interface components

**sgokcu**
- Login and Register
- Home page
- Sudoku implementation
- UI components

**abostano**
- Docker setup
- Database and backend endpoints
- Debugging and maintenance

### Privacy and Terms

The application includes accessible KVKK / Privacy Policy and Terms of Service pages within the user interface.

### Known Limitations

- Designed primarily for collaborative use within Circles
- Advanced administrative tools may be expanded in future versions

---