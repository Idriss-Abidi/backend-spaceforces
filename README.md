# 🌠 SpaceForces

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.3-green.svg)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.17-black.svg)](https://nextjs.org/)
[![Java](https://img.shields.io/badge/Java-23-orange.svg)](https://openjdk.java.net/)
[![Node.js](https://img.shields.io/badge/Node.js-18.2.0-green.svg)](https://nodejs.org/)

**SpaceForces** is an interactive web application designed for space enthusiasts. It allows users to stay up to date with real-time space news and test their knowledge through dynamically generated quizzes.

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Technologies Used](#-technologies-used)
- [Getting Started](#-getting-started)
- [Video Demo](#-video--demo)

## 🚀 Project Overview

The main goal of SpaceForces is to blend **information** and **entertainment** around space exploration. Our platform provides:

- **Real-time Space News**: Stay updated with the latest discoveries and missions
- **Interactive Quizzes**: Test your space knowledge with dynamic questions
- **Competitive Rankings**: Compete with other space enthusiasts
- **Admin Management**: Comprehensive content management system
- **User Profiles**: Personal progress tracking and achievements

### 🎯 Value Proposition

SpaceForces bridges the gap between space education and entertainment, making space science accessible and engaging for enthusiasts of all levels.

## ✨ Features

### 🧩 Quizzes

- **Real-time Competitions**: Regularly hosted space-themed quizzes
- **Difficulty Levels**: Questions categorized by complexity
- **Topic Specialization**: Focus on specific areas like Astronomy, Space Missions, Rockets, Black Holes, Astrobiology
- **Admin Creation Tools**: Content management for quiz creation and review
- **Time-limited Challenges**: Answer within set timeframes

### 🏆 Ranking System

- **Performance-based Rankings**: Users ranked by quiz performance
- **Division Leaderboards**: Updated rankings per category
- **Point System**: Difficulty-based scoring mechanism
- **Achievement Tracking**: Progress monitoring and badges

### 📰 Space News Integration

- **Live Updates**: Latest space discoveries and mission updates
- **Curated Content**: Quality-filtered news from reliable sources
- **Category Filtering**: Organize news by topics and agencies

## 🛠 Technologies Used

### Frontend

- **Framework**: Next.js 14.2.17
- **Language**: TypeScript 5.8.2
- **Styling**: Tailwind CSS 3.3.3
- **UI Components**: Radix UI
- **State Management**: Zustand 4.5.2
- **Form Handling**: React Hook Form 7.53.0
- **HTTP Client**: Axios 1.8.4

### Backend

- **Framework**: Spring Boot 3.4.3
- **Language**: Java 23
- **Database**: Oracle Database
- **ORM**: JPA/Hibernate
- **Security**: Spring Security + JWT
- **Build Tool**: Maven 3.9.9

### Cloud & Services

- **Media Storage**: Cloudinary
- **News API**: Spaceflight News API
- **Monitoring**: Prometheus + Grafana
- **Containerization**: Docker
- **Orchestration**: Kubernetes

## Getting Started

### Prerequisites
- **Oracle ATP instance**
- **Node.js** >= 18.2.0
- **Java** >= 23
- **Maven** >= 3.9.9
- **Docker** & **Docker Compose**
- **Oracle Database** (or use provided Docker setup)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/spaceforces.git
   cd spaceforces
   ```

2. **Backend Setup**

   ```bash
   cd spaceforces-back
   
   # Configure environment variables
   cp .env.example .env
   # Edit .env with your configuration
   
   # Install dependencies and run
   mvn clean install
   mvn spring-boot:run
   ```

3. **Frontend Setup**

   ```bash
   cd spaceforces-front
   
   # Install dependencies
   npm install
   
   # Configure environment
   cp .env.local.example .env.local
   # Edit .env.local with your API URLs
   
   # Run development server
   npm run dev
   ```

### Environment Variables

#### Backend (.env)

```env
DB_URL=your_oracle_db_url
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

#### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_NAME=SpaceForces
```

## Test Environments

#### Unit Testing Environment with Mockito

- **Libraries Overview**
  - Mockito for mocking dependencies
  - JUnit 5 for test execution

- **Key Features**
  - Mock object creation and verification
  - Exception testing

- **Testing Approach**

  ```
  Component Under Test → Mocked Dependencies → Assertions
  ```

- **Common Patterns**
  - Service layer testing with repository mocks
  - Controller layer testing with service mocks

- **Benefits**
  - Isolated component testing
  - Fast execution
  - Controlled dependency behavior
  - Predictable test scenarios

#### Integration Testing Environment

##### MockMvc for API Testing

- **Libraries Overview**
  - Spring's MockMvc for HTTP request simulation
  - SpringBootTest for integration testing, as it loads the full application context to test how components work together.

- **Key Features**
  - Full Spring context loading
  - HTTP request/response simulation
  - Response validation

- **Testing Approach**

  ```
  HTTP Request → MockMvc → Spring Context → Database → Response
  ```

- **Common Patterns**
  - Request building and execution
  - Response status verification
  - JSON content validation
- **Benefits**
  - No need for running server
  - Fast test execution
  - Real Spring context
  - Complete request/response cycle

##### H2 Database for Testing

- **Key Features**
  - Isolated test database
  - Schema compatibility with production
  - Fast data operations
  - Transaction rollback support

- **Common Patterns**
  - Test data setup and cleanup
  - Rollback after test

#### Test Configuration Integration

##### Unit Test Setup

```java
@ExtendWith(MockitoExtension.class)
class ServiceTest {
    @Mock
    private Repository repository;
    
    @InjectMocks
    private Service service;
}
```

##### Integration Test Setup

```java
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class IntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private TestEntityManager entityManager;
}
```

#### Environment-Specific Features

##### Unit Testing

- Fast execution
- Isolated components

##### Integration Testing

- End-to-end flows
- Real database operations

## Video Demo

[Watch demo video](videoDemo.mp4)

