# PulseForge ⚡ — Cloud-Native AI Fitness & Activity Tracking Platform

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1.0-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Cloud](https://img.shields.io/badge/Spring_Cloud-Eureka%20%7C%20Config%20%7C%20Gateway-6DB33F)](https://spring.io/projects/spring-cloud)
[![Keycloak](https://img.shields.io/badge/Keycloak-26.7.1-0080FF?logo=keycloak&logoColor=white)](https://www.keycloak.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Cloud-4169E1?logo=postgresql&logoColor=white)](https://neon.tech/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_Cloud-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-4.0_Management-FF6600?logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)

**PulseForge** is an enterprise-grade, event-driven microservices fitness tracker application powered by Spring Cloud, Keycloak IAM, polyglot cloud databases (Neon PostgreSQL & MongoDB Atlas), asynchronous RabbitMQ messaging, and AI Coaching (Groq / Grok LLaMA 3.3).

---

## 🏗️ Architecture Overview

`
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
                                                       Grok / Groq LLaMA 3.3
                                                                 ▼
                                                       ┌───────────────────┐
                                                       │   MongoDB Atlas   │
                                                       │ (Recommendations) │
                                                       └───────────────────┘
`

---

## 📦 Microservices Breakdown

| Service | Port | Description | Tech Stack |
| :--- | :--- | :--- | :--- |
| **gateway** | 8080 | Reactive API Gateway, Route Dispatcher, Keycloak JWT Validation, User Sync Filter, CORS | Spring Cloud Gateway, WebFlux, Spring Security OAuth2 |
| **eureka** | 8761 | Dynamic Service Discovery & Registry | Spring Cloud Netflix Eureka Server |
| **configServer** | 8888 | Centralized Configuration Server | Spring Cloud Config |
| **userService** | 8081 | User profile management & Keycloak synchronization | Spring Data JPA, PostgreSQL (Neon Cloud) |
| **ctivityService** | 8082 | Activity logging, metric tracking & event publishing | Spring Data MongoDB, MongoDB Atlas, RabbitTemplate |
| **iService** | 8083 | Event-driven AI workout coach & performance analysis | Spring AMQP, Groq / Grok API (LLaMA 3.3), MongoDB Atlas |
| **keycloak** | 8181 | Identity & Access Management (OAuth2 PKCE / OIDC) | Keycloak 26.7.1 |
| **abbitmq** | 5672 / 15672 | Asynchronous event broker with DLQ & Retry | RabbitMQ 4 Management |
| **rontend** | 3000 | Responsive SPA Dashboard | React, Vite, Material UI, Redux Toolkit, Nginx |

---

## 🚀 Quick Start & Deployment

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v24+)
* [Git](https://git-scm.com/)

### 1. Clone the Repository
`ash
git clone https://github.com/<your-username>/pulseforge.git
cd pulseforge
`

### 2. Configure Environment Variables
Copy .env.example to .env and fill in your cloud database credentials and API keys:
`ash
cp .env.example .env
`

### 3. Launch with Docker Compose
Start all microservices with a single command:
`ash
docker compose up -d --build
`

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
