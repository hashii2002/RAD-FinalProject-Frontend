# 🐾 PawPath – Pet Sales & Training Management System (Frontend)

<p align="center">
  <strong>A Modern Web-Based Platform for Pet Sales and Training Management</strong>
</p>

<p align="center">
  <a href="https://rad-final-project-frontend-o63g0sdv4-hashiniemalsha06-3367.vercel.app/">
    <strong>🌐 Live Application</strong>
  </a>
</p>

---

## 📌 Project Overview

**PawPath** is a modern web-based Pet Sales and Training Management System designed to simplify and streamline pet sales, training services, customer interactions, and administrative operations.

The frontend provides a responsive and user-friendly interface for three main user roles: **Admin, Trainer, and Customer**. Each role has access to specific features and dashboards based on its responsibilities.

This repository contains the frontend application developed using React, TypeScript, and modern web development technologies. It communicates with a RESTful backend API to manage application data and operations.

## 🌐 Live Demo

**Frontend URL:**  
https://rad-final-project-frontend-o63g0sdv4-hashiniemalsha06-3367.vercel.app

## ✨ Key Features

### 🔐 Authentication & Authorization
- User registration and login.
- Role-based access control.
- Protected routes.
- Forgot password and password reset functionality.
- User profile and authentication management.

### 👨‍💼 Admin Dashboard
- Overview of system activities.
- Pet sales analytics.
- Training program statistics.
- Booking and payment summaries.
- Dashboard charts and visual reports.

### 🐶 Pet Management
- View and manage pet records.
- Add new pets with images.
- Update existing pet details.
- Delete pet records.
- Search and filter pets.
- Manage pet availability status.

### 🛍️ Pet Sales Management
- Browse available pets.
- Manage pet orders.
- Track order statuses.
- View pet sales information.

### 🎓 Training Management
- Browse available training programs.
- Manage training bookings.
- View training sessions.
- Trainer-related management features.

### 👩‍🏫 Trainer Dashboard
- Trainer-specific dashboard.
- View assigned training bookings.
- Access training session information.
- Monitor training activities.

### 👤 Customer Dashboard
- Customer-specific dashboard.
- Browse available pets and training programs.
- Manage pet orders.
- View training bookings.
- Track relevant activities.

### 💳 Payment Management
- View payment information.
- Manage payment records.
- Track payment statuses.
- Access payment-related information.

### 📊 Reports & Analytics
- Pet sales reports.
- Training reports.
- Payment reports.
- System summary reports.
- Download reports as PDF documents.

### 📞 Company Contact
- Contact information for the company.
- Customer communication interface.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| React | Frontend UI development |
| TypeScript | Type-safe development |
| Vite | Development server and build tool |
| Tailwind CSS | Responsive UI styling |
| React Router DOM | Client-side routing |
| Axios | REST API communication |
| Recharts | Dashboard charts and analytics |
| Lucide React | Icons |
| jsPDF | PDF report generation |
| jspdf-autotable | PDF table generation |
| Vercel | Frontend deployment |

## 🏗️ Project Structure

```text
rad-finalProject-frontend/
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   └── ...
│   │
│   ├── context/
│   │
│   ├── hooks/
│   │
│   ├── pages/
│   │   ├── admin/
│   │   ├── customer/
│   │   ├── trainer/
│   │   └── auth/
│   │
│   ├── routes/
│   │
│   ├── services/
│   │
│   ├── types/
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── .env
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

*Note: The structure above represents the main frontend organization. Actual folders and files may vary according to the current implementation.*

## ⚙️ Installation & Setup

Follow these steps to run the frontend application locally.

### 1. Clone the Repository

```bash
git clone <YOUR_FRONTEND_GITHUB_REPOSITORY_URL>
```

### 2. Navigate to the Project Directory

```bash
cd rad-finalProject-frontend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root directory.

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Make sure the backend server is running and the API URL matches your backend configuration.

### 5. Start the Development Server

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

## 🏭 Production Build

To create an optimized production build, run:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## 🔗 Backend Integration

The PawPath frontend communicates with a RESTful backend API developed using:

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose

The frontend uses Axios to send HTTP requests and retrieve data from the backend.

The API base URL is configured through the `VITE_API_BASE_URL` environment variable.

## 🚀 Deployment

The frontend application is deployed using **Vercel**.

**Live Application:**  
https://rad-final-project-frontend-o63g0sdv4-hashiniemalsha06-3367.vercel.app

For production deployment, configure the following environment variable in Vercel:

```env
VITE_API_BASE_URL=<YOUR_DEPLOYED_BACKEND_API_URL>/api
```

After updating environment variables, redeploy the application.

## 🔒 Security

- Role-based route protection.
- JWT-based authentication integration.
- Protected API requests using authorization headers.
- Environment variables for API configuration.
- Sensitive environment files excluded from version control.

## 🎯 Project Objectives

- Digitize pet sales and training management processes.
- Provide a centralized platform for administrators, trainers, and customers.
- Improve the efficiency of pet order and training booking management.
- Provide meaningful analytics and downloadable reports.
- Deliver a responsive and user-friendly experience.

## 👩‍💻 Development

**Project Name:** PawPath – Pet Sales & Training Management System  
**Project Type:** RAD Coursework  
**Frontend:** React + TypeScript  
**Deployment Platform:** Vercel

---

<p align="center">
  <strong>🐾 PawPath – Making Pet Sales and Training Management Easier!</strong>
</p>
