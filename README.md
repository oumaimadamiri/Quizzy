<p align="center">
<img src="quiz-manager-app/assets/images/quizzy-logo.svg" alt="Logo Quizzy" width="120"/>
</p>

<h1 align="center">📝 Quizzy</h1>

<p align="center">
  <strong>Application mobile de gestion de quiz chronométrés</strong><br/>
  <em>Projet académique — Master en Ingénierie des Systèmes Intelligents</em><br/>
  <em>Faculté des Sciences Aïn Chock, Casablanca</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=white" alt="React Native"/>
  <img src="https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo&logoColor=white" alt="Expo"/>
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?logo=springboot&logoColor=white" alt="Spring Boot"/>
  <img src="https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white" alt="Java 21"/>
  <img src="https://img.shields.io/badge/database-PostgreSQL-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/auth-JWT-000000?logo=jsonwebtokens&logoColor=white" alt="JWT"/>
</p>

---

## 📋 Présentation

Quizzy est une application mobile (iOS et Android) qui permet aux professeurs de créer des quiz à choix multiples et aux étudiants de les passer avec un minuteur. Elle repose sur une API REST Spring Boot et gère trois rôles : **Étudiant**, **Professeur** et **Admin**, chacun avec ses propres écrans et ses propres droits.

### Fonctionnalités Clés

| Fonctionnalité | Description |
|---|---|
| 👥 **Trois rôles** | Étudiant, Professeur et Admin, avec des droits vérifiés côté serveur |
| ✏️ **Création de quiz** | Le professeur crée, modifie et supprime ses QCM |
| 🎲 **Quiz aléatoire** | Génération automatique d'un quiz à partir de la banque de questions d'une catégorie |
| 🔑 **Code d'accès** | Un quiz peut être protégé par un code partagé avec les étudiants |
| ⏱️ **Minuteur** | Durée réglable par quiz, soumission automatique à la fin du temps |
| 📊 **Résultats et statistiques** | Historique des tentatives, scores, statistiques par quiz et classement |
| 📧 **Emails** | Vérification du compte, réinitialisation du mot de passe, envoi des résultats aux étudiants |
| 🛡️ **Administration** | Gestion des utilisateurs : rôle, statut (actif ou désactivé), suppression |

---

## 🏗️ Architecture

```text
┌───────────────────────────┐            ┌──────────────────────────────┐
│   Application mobile      │            │      API REST Spring Boot    │
│   React Native (Expo)     │            │      :8080/api               │
│                           │  HTTP +    │                              │
│  • Écrans par rôle        │  JWT       │  • Controllers (REST)        │
│  • AuthContext (jetons)   │◄──────────►│  • Services (logique métier) │
│  • Services Axios         │            │  • Spring Security + JWT     │
│  • Minuteur de quiz       │            │  • Spring Data JPA           │
└───────────────────────────┘            └───────┬──────────────┬───────┘
                                                 │              │
                                         ┌───────▼──────┐ ┌─────▼──────────┐
                                         │  PostgreSQL  │ │   SMTP Gmail   │
                                         │   quiz_db    │ │ (vérification, │
                                         └──────────────┘ │  résultats)    │
                                                          └────────────────┘
```

### Technologies Utilisées

| Couche | Technologie |
|---|---|
| Application mobile | React Native 0.81, Expo SDK 54, React Navigation 7, Axios |
| API | Java 21, Spring Boot 3.2 (Web, Security, Data JPA, Mail), ModelMapper |
| Authentification | JWT : jeton d'accès et jeton de rafraîchissement |
| Base de données | PostgreSQL |
| Emails | SMTP Gmail |

---

## 📁 Structure du Projet

```text
Quizzy/
├── quiz-manager-app/                 # Application mobile (React Native / Expo)
│   ├── App.js                        # Point d'entrée
│   └── src/
│       ├── screens/                  # Écrans (connexion, tableaux de bord, passage, résultats…)
│       ├── components/               # QuizCard, QuestionForm, AccessCodeModal, QuizzyLogo
│       ├── services/                 # api.js, authService.js, userService.js (Axios)
│       ├── context/                  # AuthContext : stockage et rafraîchissement du jeton
│       ├── navigation/               # Navigation selon le rôle
│       ├── utils/                    # quizGenerator.js
│       └── config/                   # apiConfig.js (adresse du backend)
│
├── quiz-manager-backend/             # API REST (Spring Boot)
│   └── src/main/java/com/quizmanager/
│       ├── controller/               # Auth, Quiz, Question, QuizAttempt, User, Email
│       ├── service/                  # Logique métier
│       ├── repository/               # Accès aux données (Spring Data JPA)
│       ├── model/                    # Entités JPA
│       ├── dto/                      # Objets échangés avec l'application
│       ├── exception/                # Gestion des erreurs
│       └── config/                   # Sécurité, CORS, filtre JWT
│
└── README.md
```

---

## 📦 Prérequis

| Outil | Version |
|---|---|
| JDK | 21 (Maven est fourni : `./mvnw`) |
| PostgreSQL | 14 ou plus |
| Node.js | 20 ou plus |
| Téléphone avec **Expo Go**, ou émulateur Android / iOS | — |
| Compte Gmail avec « mot de passe d'application » | Envoi des emails |

---

## 🚀 Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/oumaimadamiri/Quizzy.git
cd Quizzy
```

### 2. Créer la base de données

```bash
psql -U postgres -c "CREATE DATABASE quiz_db;"
```

> Le fichier d'exemple utilise PostgreSQL sur le port **5433**. Si votre PostgreSQL écoute sur 5432, modifiez `spring.datasource.url`.

### 3. Configurer le backend

```bash
cd quiz-manager-backend
cp src/main/resources/application.properties.example src/main/resources/application.properties
```

Les secrets sont lus dans des variables d'environnement :

| Variable | Description |
|---|---|
| `DB_PASSWORD` | Mot de passe PostgreSQL |
| `JWT_SECRET` | Clé de signature des jetons (`openssl rand -hex 32`) |
| `MAIL_USERNAME` | Adresse Gmail d'envoi |
| `MAIL_PASSWORD` | Mot de passe d'application Google |
| `ADMIN_USERNAME` | Identifiant du compte admin (défaut : `admin`) |
| `ADMIN_PASSWORD` | Mot de passe du compte admin |

### 4. Lancer l'API

```bash
./mvnw spring-boot:run
```

L'API est disponible sur `http://localhost:8080/api`. Les tables sont créées au démarrage.

### 5. Lancer l'application mobile

```bash
cd ../quiz-manager-app
npm install
cp src/config/apiConfig.js.example src/config/apiConfig.js   # puis mettre l'adresse du backend
npx expo start
```

Scannez le QR code avec Expo Go. Sur un téléphone physique, l'adresse du backend doit être l'IP du PC (`http://<IP_DU_PC>:8080/api`), pas `localhost`.

---

## 🔄 Fonctionnement

### Inscription et connexion
```text
Inscription → Email de vérification → Lien / code validé → Compte actif
Connexion   → Jeton d'accès + jeton de rafraîchissement (JWT)
  └─ Jeton expiré → rafraîchissement automatique (/auth/refresh-token)
```

### Passage d'un quiz
```text
L'étudiant choisit un quiz
  ├─ 🔑 Quiz protégé → saisie du code d'accès → vérification
  └─ Questions chargées → ⏱️ minuteur lancé
        ├─ ✅ Soumission par l'étudiant → correction automatique → score enregistré
        └─ ⌛ Temps écoulé            → soumission automatique → score enregistré
→ Résultat, statistiques et classement mis à jour
```

### Côté professeur
```text
Création du quiz (questions et options, ou génération aléatoire)
  → Publication (avec ou sans code d'accès)
  → Suivi des tentatives de ses étudiants → envoi des résultats par email
```

---

## 📱 Écrans

| Écran | Rôle | Description |
|---|---|---|
| **Connexion / Inscription** | Tous | Création de compte, vérification de l'email, mot de passe oublié |
| **Accueil / Liste des quiz** | Étudiant | Quiz publiés, recherche, accès par code |
| **Passage du quiz** | Étudiant | Questions, minuteur, soumission |
| **Résultats** | Étudiant | Score, historique et statistiques |
| **Tableau de bord professeur** | Professeur | Ses quiz, résultats de ses étudiants |
| **Éditeur de quiz** | Professeur | Création et modification des questions |
| **Tableau de bord admin** | Admin | Gestion des utilisateurs et des rôles |
| **Profil** | Tous | Modification du profil, suppression du compte |

---

## 🔌 API REST

Toutes les routes sont préfixées par `/api`. Sauf pour `/auth`, elles demandent l'en-tête `Authorization: Bearer <jeton>`.

| Domaine | Routes |
|---|---|
| Authentification | `POST /auth/register`, `/auth/login`, `/auth/refresh-token`, `/auth/verify-email`, `/auth/resend-verification`, `/auth/forgot-password`, `/auth/reset-password` |
| Quiz | `GET /quizzes`, `/quizzes/published`, `/quizzes/search`, `/quizzes/{id}` · `POST /quizzes` · `PUT` et `DELETE /quizzes/{id}` · `POST /quizzes/generate-random` |
| Passage | `POST /quizzes/{id}/verify-access-code` · `GET /quizzes/{id}/take` · `POST /quizzes/{id}/submit` |
| Questions | `GET /questions/quiz/{quizId}`, `/questions/category/{category}`, `/questions/random/{category}` |
| Résultats | `GET /attempts/user/{userId}`, `/attempts/user/{userId}/statistics`, `/attempts/quiz/{quizId}/leaderboard`, `/quizzes/{id}/statistics` |
| Professeur | `GET /quizzes/mine`, `/quizzes/professor/{professorId}/students-results`, `/users/students` · `POST /emails/bulk/quiz-results` |
| Compte | `GET`, `PUT` et `DELETE /users/me` · `GET /users/me/deletion-impact` |
| Admin | `GET /users`, `/users/professors` · `PUT /users/{id}/role`, `/users/{id}/status` · `DELETE /users/{id}` |

---

## 🗄️ Schéma de la Base de Données

| Table | Description |
|---|---|
| `User` | Compte utilisateur, rôle (Étudiant, Professeur, Admin), statut et vérification de l'email |
| `Quiz` | Quiz créé par un professeur : titre, catégorie, durée, code d'accès, publication |
| `Question` | Question d'un quiz |
| `Option` | Réponse possible d'une question (correcte ou non) |
| `QuizAttempt` | Tentative d'un étudiant : date, score, durée |
| `UserAnswer` | Réponse choisie par l'étudiant pour chaque question d'une tentative |

---

## ⚠️ Limites Connues

- **Tests** : seul le test de démarrage de Spring existe. Il n'y a pas de tests métier ni de tests côté mobile.
- **Schéma de base** géré par Hibernate (`ddl-auto=update`), sans migrations (Flyway ou Liquibase).
- **Pas de limite de débit** sur la connexion et l'envoi d'emails.

---

## 👥 Auteurs

| Nom | Rôle |
|---|---|
| **Oumaima Damiri** | Développeuse Full-Stack & IoT |
| **Jihane El Berkaoui** | Développeuse Full-Stack |
| **KAWTAR Elhamraoui** | Développeuse Full-Stack |

**Superviseur :** Pr. EL KASMI ALAOUI Seddiq

---

<p align="center">
  Faculté des Sciences Aïn Chock, Casablanca
</p>


