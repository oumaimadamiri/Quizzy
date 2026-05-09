# Quizzy - Quiz Management System

A full-stack quiz management application built with React Native (Expo) and Spring Boot, featuring role-based access, JWT authentication, timed quiz sessions, and detailed statistics.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile Frontend | React Native (Expo), React Navigation |
| Backend API | Spring Boot 3.2, Java 21 |
| Database | PostgreSQL |
| Authentication | JWT (Access + Refresh tokens) |
| Email | Gmail SMTP (verification, password reset) |

## Features

- **Role-based access** — Student, Professor, Admin roles with distinct permissions
- **Quiz management** — Create, edit, and delete quizzes with multiple-choice questions
- **Timed sessions** — Configurable countdown timer per quiz with auto-submit
- **Access codes** — Share quizzes via generated access codes
- **Random quiz generation** — Auto-generate quizzes from a question bank by category
- **Statistics & reporting** — Attempt history, scores, and performance analytics
- **Email verification** — Account activation and password reset via email
- **Modern UI** — Gradient backgrounds, animations, and responsive design

## Architecture

```
Quizzy/
├── quiz-manager-app/          # React Native (Expo) frontend
│   └── src/
│       ├── screens/           # UI screens (login, dashboard, quiz, stats...)
│       ├── components/        # Reusable components (Timer, ScoreDisplay...)
│       ├── services/          # Axios API service layer
│       ├── context/           # AuthContext (JWT storage & refresh)
│       └── navigation/        # Stack & tab navigators
│
└── quiz-manager-backend/      # Spring Boot REST API
    └── src/main/java/com/quizmanager/
        ├── controller/        # REST endpoints
        ├── service/           # Business logic
        ├── repository/        # Spring Data JPA
        ├── model/             # JPA entities
        ├── dto/               # Request/response DTOs
        └── config/            # Security, CORS, JWT filter
```

## Getting Started

### Prerequisites

- Java 21+
- Maven 3.8+
- PostgreSQL 14+
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)

### Backend Setup

```bash
cd quiz-manager-backend

# Copy and fill in your environment values
cp src/main/resources/application.properties.example \
   src/main/resources/application.properties
# Edit application.properties with your DB credentials, JWT secret, and email config

# Create the database
psql -U postgres -c "CREATE DATABASE quiz_db;"

# Run the application
mvn spring-boot:run
```

The API will be available at `http://localhost:8080/api`.

### Frontend Setup

```bash
cd quiz-manager-app

# Install dependencies
npm install

# Copy and configure the API URL
cp src/config/apiConfig.js.example src/config/apiConfig.js
# Edit apiConfig.js with your backend URL

# Start Expo
npx expo start
```

Scan the QR code with the Expo Go app or run on a simulator.

## API Overview

| Resource | Endpoints |
|----------|-----------|
| Auth | `POST /auth/login`, `/auth/register`, `/auth/refresh` |
| Quizzes | `GET/POST /quizzes`, `PUT/DELETE /quizzes/{id}` |
| Questions | `GET/POST /questions`, `PUT/DELETE /questions/{id}` |
| Attempts | `POST /attempts/start`, `POST /attempts/submit` |
| Users | `GET /users`, `PUT /users/{id}`, `DELETE /users/{id}` |
| Email | `POST /email/verify`, `POST /email/password-reset` |

## Environment Variables

See `quiz-manager-backend/src/main/resources/application.properties.example` for the full list of required variables:

```
DB_PASSWORD       — PostgreSQL password
JWT_SECRET        — Random secret for signing JWT tokens
MAIL_USERNAME     — Gmail address for sending emails
MAIL_PASSWORD     — Gmail app password
ADMIN_PASSWORD    — Default admin account password
```

## License

MIT
