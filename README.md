# Tour Booking System

A full-stack tour booking platform integrated with an AI-powered RAG chatbot for personalized travel recommendations. The system is engineered to handle concurrent booking requests and process background tasks asynchronously.

**Live Demo:** [https://tlong1312.me](https://tlong1312.me)

## System Architecture & Features

* **Intelligent Search (RAG):** Utilized Spring AI and PostgreSQL (pgvector) with HNSW indexing to build a chatbot capable of analyzing user intent and providing direct navigation to relevant tours.
* **Concurrency Control:** Implemented Redis-based distributed locks to ensure strict data consistency and prevent double-booking during high-traffic scenarios.
* **Asynchronous Processing:** Integrated RabbitMQ to decouple email notifications (booking confirmations, payment receipts) from the main thread, significantly reducing API response latency.
* **Performance Optimization:** Applied Redis caching to accelerate page load times and minimize database query loads.
* **Payment Integration:** Integrated VNPay Sandbox to handle secure, real-time online transactions.
* **Deployment & Load Balancing:** Containerized the entire architecture (Frontend, Backend, Database, Message Broker) using Docker. Deployed on Digital Ocean with Nginx configured as a reverse proxy and load balancer.

## Tech Stack

* **Backend:** Java 17, Spring Boot 3, Spring Security (JWT), Spring AI, Spring Data JPA.
* **Frontend:** ReactJS, Axios, Tailwind CSS.
* **Database & Vector Store:** PostgreSQL, pgvector.
* **Caching & Message Broker:** Redis, RabbitMQ.
* **Infrastructure:** Docker, Docker Compose, Nginx, DigitalOcean.

## Local Setup

The repository is structured as a monorepo containing both frontend and backend codebases, fully orchestratable via Docker Compose.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tlong1312/TourWebApplication.git
   cd TourWebApplication
