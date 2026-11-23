# Quizzy : gestion de quiz sur mobile

> Projet académique réalisé en équipe. Application mobile React Native (Expo) et API REST Spring Boot pour créer, partager et passer des quiz chronométrés, avec trois rôles : **Étudiant**, **Professeur** et **Admin**.

## Sommaire
1. [Fonctionnalités](#fonctionnalités)
2. [Stack technique](#stack-technique)
3. [Architecture](#architecture)
4. [Prérequis](#prérequis)
5. [Configuration](#configuration)
6. [Installation et lancement](#installation-et-lancement)
7. [API REST](#api-rest)
8. [Limites connues](#limites-connues)
9. [Auteurs](#auteurs)

---

## Fonctionnalités

| Rôle | Fonctionnalités |
|---|---|
| **Étudiant** | Passer un quiz publié ou protégé par un code d'accès, avec un minuteur et une soumission automatique à la fin du temps. Consulter ses résultats, ses statistiques et le classement de chaque quiz. |
| **Professeur** | Créer, modifier et supprimer ses quiz (QCM). Générer un quiz aléatoire à partir de la banque de questions d'une catégorie. Suivre les tentatives et les résultats de ses étudiants, et leur envoyer les résultats par email. |
| **Admin** | Gérer les utilisateurs : rôle, statut (actif ou désactivé), suppression. Consulter la liste des professeurs. |
| **Tous** | Inscription avec vérification de l'email, mot de passe oublié, profil, suppression du compte avec aperçu de ce qui sera supprimé. |

## Stack technique

| Couche | Technologies |
|---|---|
| Mobile | React Native 0.81, Expo SDK 54, React Navigation 7, Axios |
| Backend | Java 21, Spring Boot 3.2 (Web, Security, Data JPA, Mail), ModelMapper |
| Authentification | JWT : jeton d'accès et jeton de rafraîchissement |
| Base de données | PostgreSQL |
| Email | SMTP Gmail (vérification du compte, réinitialisation du mot de passe, résultats) |

## Architecture

```
Quizzy/
├── quiz-manager-app/            Application mobile (React Native / Expo)
│   └── src/
│       ├── screens/             Écrans : connexion, tableaux de bord, passage de quiz, résultats…
│       ├── components/          QuizCard, QuestionForm, AccessCodeModal…
│       ├── services/            Appels à l'API (Axios)
│       ├── context/             AuthContext : stockage et rafraîchissement du jeton
│       ├── navigation/          Navigation par rôle
│       └── utils/               Génération de quiz aléatoires
└── quiz-manager-backend/        API REST (Spring Boot)
    └── src/main/java/com/quizmanager/
        ├── controller/          Routes REST
        ├── service/             Logique métier
        ├── repository/          Accès aux données (Spring Data JPA)
        ├── model/               Entités : User, Quiz, Question, Option, QuizAttempt, UserAnswer
        ├── dto/                 Objets échangés avec l'application
        └── config/              Sécurité, CORS, filtre JWT
```

## Prérequis

| Outil | Version |
|---|---|
| JDK | 21 (Maven est fourni : `./mvnw`) |
| PostgreSQL | 14 ou plus |
| Node.js | 20 ou plus |
| Téléphone avec **Expo Go**, ou émulateur Android / iOS | |

## Configuration

### Backend
Copier `quiz-manager-backend/src/main/resources/application.properties.example` vers `application.properties`. Les secrets sont lus dans des variables d'environnement :

| Variable | Description |
|---|---|
| `DB_PASSWORD` | Mot de passe PostgreSQL |
| `JWT_SECRET` | Clé de signature des jetons (générer avec `openssl rand -hex 32`) |
| `MAIL_USERNAME` | Adresse Gmail d'envoi |
| `MAIL_PASSWORD` | Mot de passe d'application Google |
| `ADMIN_USERNAME` | Identifiant du compte admin (défaut : `admin`) |
| `ADMIN_PASSWORD` | Mot de passe du compte admin |

> Le fichier d'exemple utilise PostgreSQL sur le port **5433**. Si votre PostgreSQL écoute sur 5432, adaptez `spring.datasource.url`.

### Mobile
Copier `quiz-manager-app/src/config/apiConfig.js.example` vers `apiConfig.js` et y mettre l'adresse du backend. Sur un téléphone physique, utilisez l'IP du PC (`http://<IP>:8080/api`), pas `localhost`.

## Installation et lancement

```bash
# 1. Base de données
psql -U postgres -c "CREATE DATABASE quiz_db;"

# 2. Backend : API sur http://localhost:8080/api
cd quiz-manager-backend
cp src/main/resources/application.properties.example src/main/resources/application.properties
./mvnw spring-boot:run

# 3. Application mobile (autre terminal)
cd quiz-manager-app
npm install
cp src/config/apiConfig.js.example src/config/apiConfig.js
npx expo start
```

Scanner le QR code avec Expo Go, ou appuyer sur `a` (Android) ou `i` (iOS) pour ouvrir un émulateur.

## API REST

Toutes les routes sont préfixées par `/api`. Sauf pour `/auth`, elles demandent l'en-tête `Authorization: Bearer <jeton>`.

| Domaine | Routes |
|---|---|
| Authentification | `POST /auth/register`, `/auth/login`, `/auth/refresh-token`, `/auth/verify-email`, `/auth/resend-verification`, `/auth/forgot-password`, `/auth/reset-password` |
| Quiz | `GET /quizzes`, `/quizzes/published`, `/quizzes/search`, `/quizzes/{id}` · `POST /quizzes` · `PUT` et `DELETE /quizzes/{id}` · `POST /quizzes/generate-random` |
| Passage d'un quiz | `POST /quizzes/{id}/verify-access-code` · `GET /quizzes/{id}/take` · `POST /quizzes/{id}/submit` |
| Questions | `GET /questions/quiz/{quizId}`, `/questions/category/{category}`, `/questions/random/{category}` |
| Résultats | `GET /attempts/user/{userId}`, `/attempts/user/{userId}/statistics`, `/attempts/quiz/{quizId}/leaderboard`, `/quizzes/{id}/statistics` |
| Professeur | `GET /quizzes/mine`, `/quizzes/professor/{professorId}/students-results`, `/users/students` · `POST /emails/bulk/quiz-results` |
| Compte | `GET`, `PUT` et `DELETE /users/me` · `GET /users/me/deletion-impact` |
| Admin | `GET /users`, `/users/professors` · `PUT /users/{id}/role`, `/users/{id}/status` · `DELETE /users/{id}` |

Les droits sont vérifiés côté serveur (`@PreAuthorize`) : seuls les professeurs et les admins peuvent créer ou supprimer un quiz et consulter les résultats des étudiants.

## Limites connues

- **Tests** : seul le test de démarrage de Spring existe. Il n'y a pas de tests métier ni de tests côté mobile.
- **Schéma de base** géré par Hibernate (`ddl-auto=update`), sans outil de migration (Flyway ou Liquibase).
- **Pas de limite de débit** sur la connexion et l'envoi d'emails.

## Auteurs

| Nom | Rôle |
|---|---|
| **Oumaima Damiri** | Développeuse Full-Stack & IoT |
| **Jihane EL Berkaoui** | Développeuse Full-Stack |
| **KAWTAR ELHAMRAOUI** | Développeuse Full-Stack |

**Superviseur :** Pr. EL KASMI ALAOUI Seddiq
