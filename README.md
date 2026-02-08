# ft_transcendence

*This project has been created as part of the 42 curriculum by kgulfida, amayuk, sgokcu, abostano.*

## 1. Description

**ft_transcendence**, 42 müfredatının son ve en kapsamlı projesidir. Bu proje, kullanıcıların gerçek zamanlı olarak çok oyunculu oyunlar (Sudoku) oynayabileceği, sohbet edebileceği ve sosyalleşebileceği modern bir Single Page Application (SPA) web platformudur.

**Project Goal:**
To simplify team collaboration and gaming through a unified interface involving real-time interactions, robust task management, and competitive gameplay.

**Key Features:**
- 🎮 **Real-time Multiplayer Game:** A synced Sudoku experience supporting multiple players simultaneously.
- 💬 **Live Chat System:** Direct messages and circle (group) chats powered by WebSockets.
- 📊 **Task Management:** A Trello-like dashboard for managing circle tasks.
- 🔐 **Secure Authentication:** JWT based auth + Google OAuth 2.0 integration.
- 📱 **Responsive Design:** Fully accessible on desktop and mobile devices.

---

## 2. Instructions & Resources

### Prerequisites
Ensure you have the following installed on your machine:
- **Docker Engine** (v20.10+)
- **Docker Compose** (v2.0+)
- **Make**

### Setup & Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Start-sys/ft_transcendence.git
    cd ft_transcendence
    ```

2.  **Environment Variables:**
    Create a `.env` file in the `srcs/` directory based on the example provided.
    ```bash
    cp srcs/.env.example srcs/.env
    # Edit the file with your API keys and secrets
    ```

3.  **Run the Project:**
    We use a Makefile to simplify docker operations.
    ```bash
    make        # Builds and starts all containers in detached mode
    ```

4.  **Access the App:**
    Open your browser and navigate to:
    - **App:** `https://localhost` (Secure SSL via Caddy)
    - **Frontend:** `http://localhost:3000` (Dev)
    - **Backend:** `http://localhost:8000/api/`

### Useful Commands
- `make logs`: View real-time logs of all services.
- `make down`: Stop and remove containers.
- `make clean`: Deep clean (removes volumes, images, and networks).
- `make re`: Full rebuild.

### Resources
- **Django REST Framework:** [Official Docs](https://www.django-rest-framework.org/) for API structure.
- **React.js:** [React Docs](https://react.dev/) for component lifecycle.
- **Django Channels:** For implementing WebSockets (Asynchronous Server Gateway Interface).
- **Bootstrap 5:** For responsive grid system and styling.

### AI Usage Disclosure
Artificial Intelligence tools (ChatGPT, Claude) were used in this project for:
- **Debugging:** Analyzing complex traceback errors in WebSocket consumers.
- **Algorithm Optimization:** Improving the efficiency of the Sudoku generation algorithm.
- **Boilerplate Code:** Generating initial CSS structures for the dashboard components.
- **Documentation:** Assisting in structuring this README and commenting code for clarity.

---

## 3. Team & Management

### Team Information
We operated as a full-stack agile team with specific domain focuses:

| Member | Role | Focus Area | Responsibilities |
| :--- | :--- | :--- | :--- |
| **kgulfida** | **Product Owner (PO)** | Backend & DB | Defined database schema, managed feature backlog, ensured API compliance with requirements. |
| **amayuk** | **Project Manager (PM)** | Frontend | Managed timeline, oversaw UI/UX consistency, ensured task completion. |
| **sgokcu** | **Tech Lead** | Frontend | Established React architecture, enforced code quality standards, handled complex state logic. |
| **abostano** | **Developer** | Backend & DevOps | Implemented WebSocket logic, Docker orchestration, Caddy configuration, and CI/CD. |

### Project Management
- **Methodology:** Agile/Scrum with weekly sprints.
- **Task Tracking:** We used **GitHub Projects** (Kanban board) to track issues, bugs, and feature requests.
- **Communication:**
    - **WhatsApp:** For daily stand-ups and instant communication.
    - **Google Meet:** For weekly sprint reviews and pair-programming sessions.
    - **GitHub:** For code reviews (Pull Requests) and CI/CD pipeline checks.

---

## 4. Technical Details

### Technical Stack

#### Frontend
- **Framework:** **React.js** (Create React App)
    - *Rationale:* Component-based architecture allows for reusable UI elements. The Virtual DOM ensures high performance for real-time game updates.
- **Styling:** **CSS Modules / Bootstrap**
    - *Rationale:* Rapid development of responsive layouts compatible with all screen sizes.

#### Backend
- **Framework:** **Django + Django REST Framework (DRF)**
    - *Rationale:* "Batteries-included" framework providing robust security (CSRF/XSS protection), built-in Admin panel, and an excellent ORM.
- **Real-time:** **Django Channels (Daphne/Redis)**
    - *Rationale:* Necessary for handling WebSocket connections for Chat and Game state synchronization.

#### Database & Infrastructure
- **Database:** **PostgreSQL**
    - *Rationale:* A powerful, open-source object-relational database system with strong ACID compliance, ideal for handling complex relationships between Users, Circles, and Tasks.
- **Proxy/Server:** **Caddy**
    - *Rationale:* Automatically handles SSL/TLS certificates (HTTPS) and acts as a reverse proxy, simplifying the production-like local setup compared to Nginx.
- **Containerization:** **Docker Compose**
    - *Rationale:* Ensures consistency across all developer environments.

### Database Schema (Simplified)
Our schema focuses on the relationship between Users and their Circles (Workspaces/Groups).

- **User:** Extended AbstractUser (Auth).
- **UserProfile:** Avatar, Online Status, Relation to User.
- **Circle:** Represents a group. Has Admin and Many-to-Many Members.
- **Task:** Belongs to a Circle. Has Status (Todo/Done), Type (Note/Assignment).
- **Message:** Belongs to a Circle (Group Chat) or DirectMessage (User-to-User).
- **SudokuGame:** One-to-One relation with Circle. Stores board state.

---

## 5. Features & Modules

### Features List
- **User Auth:** Login, Register, Google OAuth, Profile Management. *(Owner: kgulfida)*
- **Dashboard:** Interactive sidebar, stats view, and task management. *(Owner: amayuk & sgokcu)*
- **Circle System:** Create/Join groups, invite members via code. *(Owner: abostano)*
- **Real-time Chat:** Persistent group chat and direct messaging. *(Owner: abostano & kgulfida)*
- **Sudoku Game:** Multiplayer logic, difficulty selection, live board sync. *(Owner: kgulfida & sgokcu)*

### Modules
We aimed for **15 Points** to satisfy the mandatory 14 points requirement.

| Category | Module Name | Type | Points | Justification/Implementation |
| :--- | :--- | :--- | :---: | :--- |
| **Web** | Use a Framework | Major | 2 | React for Frontend, Django for Backend. |
| **Web** | Real-time Features | Major | 2 | WebSocket implementation for Chat and Game. |
| **Web** | Frontend Framework | Minor | 1 | React is used for the entire client-side. |
| **Web** | Backend Framework | Minor | 1 | Django REST Framework handles all API requests. |
| **Web** | ORM | Minor | 1 | Django ORM used for all database queries. |
| **Game** | Web-based Game | Major | 2 | Sudoku: Custom logic, win/loss conditions. |
| **Game** | Multiplayer (3+) | Major | 2 | Multiple users in a Circle can edit the board simultaneously. |
| **Game** | Customization | Minor | 1 | Difficulty levels (Easy, Medium, Hard). |
| **Game** | Spectator Mode | Minor | 1 | Users can watch the board update without acting. |
| **User** | OAuth 2.0 | Minor | 1 | Google Login integration. |
| **Web** | Notification System | Minor | 1 | Real-time alerts for messages and invites. |
| **Total** | | | **15** | |

### Individual Contributions

#### **kgulfida (PO & Backend)**
*   **Contribution:** Designed the core database schema for Circles and Tasks. Implemented the Authentication system including Google OAuth.
*   **Challenge:** Managing race conditions in DB during concurrent User writes.
*   **Solution:** Used atomic transactions in Django to ensure data integrity.

#### **amayuk (PM & Frontend)**
*   **Contribution:** Designed the complete UI/UX of the Dashboard. Created the responsive `Sidebar` and `Topbar` components.
*   **Challenge:** Ensuring the layout worked seamlessly on mobile devices.
*   **Solution:** Implemented extensive CSS media queries and conditional rendering in React.

#### **sgokcu (Tech Lead & Frontend)**
*   **Contribution:** Built the `Sudoku` frontend logic and grid rendering. Optimized React `useEffect` hooks for WebSocket performance.
*   **Challenge:** Preventing infinite render loops when receiving rapid WebSocket updates.
*   **Solution:** Implemented `useMemo` and careful dependency management in hooks.

#### **abostano (Dev & DevOps)**
*   **Contribution:** Configured Docker Compose network and Caddy reverse proxy. Wrote WebSocket consumers for Chat and Online Presence.
*   **Challenge:** Configuring Secure Websockets (WSS) behind a reverse proxy locally.
*   **Solution:** Configured Caddy to handle SSL termination and forward headers correctly to Daphne.

---
