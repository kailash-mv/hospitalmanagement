# Hospital Management Web Application

## Overview
This is a hospital management web application. It enables managers to set **location perimeters** and oversee his/her employees and their shifts remotely. It also enables careworker clock-ins and clock-outs. It also provides detailed **shift tracking and analytics**.

The application is built with:
- **Next.js (TypeScript)** for the frontend
- **prisma** for database management
- **Auth0 & Google OAuth** for authentication
- **MongoDB** as the database
- **Ant Design & Tailwind CSS** for responsive and friendly UI components
- **Vercel** for deployment

## Features Attempted
### Core Features Implemented
- **Authentication:**
  - Google OAuth authentication via NextAuth.js
  - Custom credentials login using Prisma
  - Role-based access control (Manager, Care Worker)

- **Shift Management:**
  - Managers can set **location perimeters** for staff clock-in
  - Care Workers can **log their shifts** (clock-in/out) and can also add an optional note
  - Display current careworkers clocked in
  - Display careworker history
  - Shift data persistence with MongoDB

- **Engagement analytics:**
  - Average shift duration
  - Total shifts per day
  - Total hours clocked per staff (last 7 days)

### Features In Progress 
- **Automated notifications** for clock-in and clock-out reminders
- Cnversion to **Progressive Web Application (PWA)**

## Installation & Setup
### Prerequisites
Test users:
- **Manager**
  
    - Email: **manager@gmail.com**
  
    - Password: 123
  
- **Careworker**
  
   - Email: **vigi@gmail.com**
  
   - Password:123

### Prerequisites
Ensure you have the following installed:
- **Node.js** (v18+)
- **MongoDB**
- **NextAuth / Google OAuth configured**

### Steps to Run Locally
1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-repo.git
   cd shift-tracker
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Setup environment variables:**
   Create a `.env` file and configure:
   ```plaintext
   DATABASE_URL=mongodb+srv://your_mongo_connection
   NEXTAUTH_SECRET=your_secret
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

4. **Run the development server:**
   ```sh
   npm run dev
   ```
   Open `http://localhost:3000` to access the app.

## Deployment
The application is deployed using **Vercel**. Steps:
1. **Push to GitHub**
2. **Link repository to Vercel**
3. **Set up environment variables on Vercel**
4. **Trigger deployment**

### Prisma Issue on Vercel (Fix)
If you face **`PrismaClientInitializationError`**, ensure you add the following:
- In `package.json`, under `scripts`:
  ```json
  "postinstall": "prisma generate"
  ```
- Update **Vercel build command**:
  ```sh
  npm run build && prisma generate
  ```
