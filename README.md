# PulseForge AI ⚡ — Cloud-Native Athletic Intelligence & Community Fitness Microservices

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1.0-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Cloud](https://img.shields.io/badge/Spring_Cloud-Eureka%20%7C%20Config%20%7C%20Gateway-6DB33F)](https://spring.io/projects/spring-cloud)
[![Keycloak](https://img.shields.io/badge/Keycloak-26.7.1-0080FF?logo=keycloak&logoColor=white)](https://www.keycloak.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Cloud-4169E1?logo=postgresql&logoColor=white)](https://neon.tech/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_Cloud-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-4.0_Management-FF6600?logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)

**PulseForge AI** is an enterprise-grade, event-driven athletic intelligence and community competition platform. Built on Spring Cloud, Keycloak IAM, polyglot databases (PostgreSQL & MongoDB Atlas), asynchronous RabbitMQ messaging, and Grok AI sports science coaching, PulseForge empowers athletes with precision biometric logging, dynamic ACSM caloric formulas, live community contests, and dynamic PulseScore podium rankings.

---

## 🏗️ Architecture Overview

```
                          ┌──────────────────────┐
                          │   React Frontend     │ (Port 3000)
                          │ (Vite + Nginx + MUI) │
                          └──────────┬───────────┘
                                     │
                        OAuth2 PKCE / REST API
                                     │
                                     ▼
                          ┌──────────────────────┐
                          │  Spring Cloud API    │ (Port 8080)
                          │       Gateway        │
                          └──────────┬───────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌──────────────────┐       ┌───────────────────┐       ┌───────────────────┐
│   User Service   │       │ Activity Service  │       │    AI Service     │
│   (Port 8081)    │       │    (Port 8082)    │       │    (Port 8083)    │
└────────┬─────────┘       └─────────┬─────────┘       └─────────▲─────────┘
         │                           │                           │
         │ JPA                       │ Mongo                     │ AMQP Consumer
         ▼                           ▼                           │
┌──────────────────┐       ┌───────────────────┐       ┌─────────┴─────────┐
│ Neon PostgreSQL  │       │   MongoDB Atlas   │       │     RabbitMQ      │
│  (User Profiles) │       │   (Activities)    │──────▶│ (fitness.exchange)│
└──────────────────┘       └───────────────────┘       └───────────────────┘
                                                                 │
                                                       Grok Sports Science LLM
                                                                 ▼
                                                       ┌───────────────────┐
                                                       │   MongoDB Atlas   │
                                                       │ (Recommendations) │
                                                       └───────────────────┘
```

---

## ✨ Key Platform Capabilities

1. **Precision Stanford ACSM Caloric Engine**:
   - Dynamic scientific formula: Caloric energy expenditure calculated across 7 specialized sports (Running, Weightlifting, Swimming, Cycling, HIIT, Yoga, Walking).
2. **24/7 Grok AI Athletic Coach & In-Memory Token Caching**:
   - Biomechanical post-workout physiological analysis, progressive overload cues, recovery suggestions, and safety guidelines.
   - Sub-second interactive chat with zero-token in-memory caching and sports science heuristic fallbacks.
3. **Dynamic PulseScore Rating & Community Podium**:
   - Real-time athletic scoring combining active calories, duration, consistency streaks, and contest bonuses.
   - Dynamic tiered rankings (Gold, Silver, Bronze, Elite, Challenger) with admin filtering.
4. **Live Timed Community Contests**:
   - Admin-managed challenges with live ticking countdown timers, dynamic goal progress bars, and bonus PulsePoints.
5. **Fitness & Sports Centres GPS Locator**:
   - Geolocation-based discovery for gyms, Olympic swimming pools, CrossFit boxes, and yoga studios with one-tap directions.
6. **Robust Cascade Deletion & Data Consistency**:
   - Immediate recalculation of athlete totals, streaks, and leaderboard ranks upon workout or user lifecycle changes.

---

## 📦 Microservices Breakdown

| Service | Port | Description | Tech Stack |
| :--- | :--- | :--- | :--- |
| **gateway** | 8080 | Reactive API Gateway, Route Dispatcher, Keycloak JWT Validation, User Sync Filter, CORS | Spring Cloud Gateway, WebFlux, Spring Security OAuth2 |
| **eureka** | 8761 | Dynamic Service Discovery & Registry | Spring Cloud Netflix Eureka Server |
| **configServer** | 8888 | Centralized Configuration Server | Spring Cloud Config |
| **userService** | 8081 | User profile management, biometric settings & Keycloak synchronization | Spring Data JPA, PostgreSQL (Neon Cloud) |
| **activityService** | 8082 | Activity logging, metric tracking, contests & leaderboard calculation | Spring Data MongoDB, MongoDB Atlas, RabbitTemplate |
| **aiService** | 8083 | Event-driven AI workout coach & 24/7 Grok athletic assistant | Spring AMQP, Grok API, MongoDB Atlas |
| **keycloak** | 8181 | Identity & Access Management (OAuth2 PKCE / OIDC) | Keycloak 26.7.1 |
| **rabbitmq** | 5672 / 15672 | Asynchronous event broker with DLQ & Retry | RabbitMQ 4 Management |
| **frontend** | 3000 | Luxury dark-themed athlete SPA dashboard | React 19, Vite, Material UI, Nginx |

---

## 🚀 Quick Start & Deployment

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v24+)
* [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/rohanhubs1/fitness-microservices.git
cd fitness-microservices
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your cloud database credentials and Grok API keys:
```bash
cp .env.example .env
```

### 3. Launch with Docker Compose
Start all microservices with a single command:
```bash
docker compose up -d --build
```

### 4. Access the Application
* 🌐 **Web Dashboard**: [http://localhost:3000](http://localhost:3000)
* 🔐 **Keycloak Admin Console**: [http://localhost:8181/admin](http://localhost:8181/admin) (admin/admin)
* 🔍 **Eureka Dashboard**: [http://localhost:8761](http://localhost:8761)
* 🐰 **RabbitMQ Management**: [http://localhost:15672](http://localhost:15672) (guest/guest)
* 🚪 **API Gateway**: [http://localhost:8080](http://localhost:8080)

---

## 🔒 Security & Privacy
* Real secrets and database credentials in .env are git-ignored.
* Passwords are never stored in application databases; authentication is entirely delegated to Keycloak using OAuth2 PKCE.

---

## 📄 License
This project is open-source under the MIT License.
