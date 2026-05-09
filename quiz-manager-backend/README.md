# Quizzy — Backend (Spring Boot)

REST API for the Quizzy quiz management system.

## Stack

- Java 21, Spring Boot 3.2
- Spring Security + JWT (access & refresh tokens)
- Spring Data JPA + PostgreSQL
- JavaMailSender (Gmail SMTP)
- Maven

## Project Structure

```
src/main/java/com/quizmanager/
├── controller/     # REST controllers (Auth, Quiz, Question, Attempt, User, Email)
├── service/        # Business logic
├── repository/     # Spring Data JPA repositories
├── model/          # JPA entities (User, Quiz, Question, Option, QuizAttempt, UserAnswer)
├── dto/            # Request & response DTOs
├── config/         # SecurityConfig, CorsConfig, JwtAuthenticationFilter
└── exception/      # GlobalExceptionHandler, ResourceNotFoundException
```

## Setup

```bash
# 1. Create the database
psql -U postgres -c "CREATE DATABASE quiz_db;"

# 2. Configure secrets
cp src/main/resources/application.properties.example \
   src/main/resources/application.properties
# Fill in: DB_PASSWORD, JWT_SECRET, MAIL_USERNAME, MAIL_PASSWORD, ADMIN_PASSWORD

# 3. Run
mvn spring-boot:run
```

API base URL: `http://localhost:8080/api`

## Key Endpoints

```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh

GET    /api/quizzes
POST   /api/quizzes
PUT    /api/quizzes/{id}
DELETE /api/quizzes/{id}

GET    /api/questions
POST   /api/questions
PUT    /api/questions/{id}
DELETE /api/questions/{id}

POST   /api/attempts/start
POST   /api/attempts/submit
GET    /api/attempts/user/{userId}

GET    /api/users
PUT    /api/users/{id}
DELETE /api/users/{id}
```

## Security

- JWT access tokens (24h) + refresh tokens (7 days)
- Role-based authorization: `STUDENT`, `PROFESSOR`, `ADMIN`
- Email verification required on registration
- Passwords hashed with BCrypt
