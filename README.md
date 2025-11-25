# FitTrack - Frontend

## Team Information

**Team Name:** 200s
**Team Members:**

* Nour Saad
* Haya Mazyad
* Lynn Oueidat
* Rama Alassi

---

## Project Overview

This repository contains the **frontend** and the **backend** of our Fitness Tracker web application.
It allows users to explore exercises, track their workouts, and monitor progress through a clean and responsive interface.
Every user can create, update, and delete their own exercises and workouts.
Only the admin can create default workouts and exercises that appear to all users.
You can log in to the admin account using the follong credentials:

ADMIN_EMAIL=[rama.alassi@200s.com](mailto:rama.alassi@200s.com)
ADMIN_PASSWORD=SAMA123sama123:

You can check the GIF for a project overview.

---

## Live Demo

**Link to the deployed application (Frontend):** [https://fittrack1-cnnv.onrender.com/](https://fittrack1-cnnv.onrender.com/)

---

## Data Entities

The application currently simulates a backend using mock data for the following entities:

* Users
* Exercises
* Workouts
* Progress Logs
* Default ecercises
* Defualt workouts

We used the online database pf MongoDB: mongodb+srv://fittrack:FITTRACK@cluster0.nhjzihv.mongodb.net/?appName=Cluster0

you can find the schema used and the data to create the tables and insert data.

---

## Local Setup Instructions

To run the frontend locally:

1. Navigate to the project directory:

   ```bash
   cd your-project-folder
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Copy the local server link that appears in your terminal and paste it into your preferred browser.

To run the backend locally:

1. Navigate to the project directory:

   ```bash
   cd your-project-folder
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Copy the swagger link that appears in your terminal and paste it into your preferred browser.

---

## Workload Division (Frontend)

To maintain consistency in theme and design, we collaborated on all shared files
(`index.css`, `index.html`, `App.jsx`, `components/`, etc.).
Each member was responsible for specific pages as follows:

### Rama Alassi

* Homepage
* Login
* Register

### Haya Mazyad

* WorkoutDashboard
* WorkoutDetails

### Lynn Oueidat

* ExerciseDetails
* ExerciseLibrary

### Nour Saad

* LogWorkout
* UserProgress
* NotFound

## Workload Division (Backend)

we collaborated on all shared files.
Each member was responsible for specific implementation as follows:

### Rama Alassi

* controllers:
  AuthController
  DefualtExerciseController
* model:
  User
  DefualtExercise
* routes:
  AuthRoute
  DefualtExerciseRoute

### Haya Mazyad

* controllers:
  workoutController
  DefualtWorkoutController
* model:
  Workout
  DefualtWorkout
* routes:
  workRoute
  DefualtWorkoutRoute

### Lynn Oueidat

* controllers:
  ExerciseController
* model:
  Exercise
* routes:
  ExerciseRoute

### Nour Saad

* controllers:
  progressLogController
* model:
  ProgressLog
* routes:
  ProgressLogRoute

---

## API Documentation

Below is the complete list of backend API endpoints, including methods, descriptions, authentication requirements, and expected request/response bodies.

---

# **1. Authentication Routes**

### **POST /api/auth/register**

**Description:** Create a new user account
**Auth:** Public
**Request Body:**

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "goals": "string"
}
```

### **POST /api/auth/login**

**Description:** Login user and return JWT token
**Auth:** Public
**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

### **GET /api/auth/me**

**Description:** Get current logged-in user
**Auth:** Bearer Token

### **PUT /api/auth/profile**

**Description:** Update user profile
**Auth:** Bearer Token
**Request Body:**

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "goals": "string"
}
```

---

# **2. Workout Routes**

### **GET /api/workouts**

**Description:** Get all workouts
**Auth:** Optional

### **GET /api/workouts/:id**

**Description:** Get workout by ID
**Auth:** Public

### **POST /api/workouts**

**Description:** Create a new workout
**Auth:** Bearer Token
**Request Body:**

```json
{
  "name": "string",
  "category": "strength | cardio | flexibility | sports",
  "difficulty": "beginner | intermediate | advanced",
  "description": "string",
  "duration": 0,
  "caloriesBurned": 0,
  "exercises": ["string"]
}
```

### **PUT /api/workouts/:id**

**Description:** Update workout by ID
**Auth:** Bearer Token

### **DELETE /api/workouts/:id**

**Description:** Delete workout
**Auth:** Bearer Token

---

# **3. Exercise Routes**

### **GET /api/exercises**

**Description:** Get all exercises
**Auth:** Optional

### **GET /api/exercises/:id**

**Description:** Get exercise by ID
**Auth:**  Public

### **POST /api/exercises**

**Description:** Create a new exercise
**Auth:** Bearer Token
**Request Body:**

```json
{
  "name": "string",
  "muscle_group": "string",
  "description": "string",
  "reps": number,
  "sets": number,
  "duration": number
}
```

### **PUT /api/exercises/:id**

**Description:** Update an exercise
**Auth:** Bearer Token

### **DELETE /api/exercises/:id**

**Description:** Delete an exercise
**Auth:** Bearer Token

---

# **4. Progress Log Routes**

### **GET /api/progress/stats**

**Description:** Get workout statistics
**Auth:** Bearer Token

### **GET /api/progress**

**Description:** Get all progress logs for user
**Auth:** Bearer Token

### **GET /api/progress/:id**

**Description:** Get a specific progress log
**Auth:** Bearer Token

### **POST /api/progress**

**Description:** Create a progress log
**Auth:** Bearer Token
**Request Body:**

```json
{
  "workoutId": "string",
  "duration": number,
  "caloriesBurned": number,
  "notes": "string"
}
```

### **PUT /api/progress/:id**

**Description:** Update a progress log
**Auth:** Bearer Token

### **DELETE /api/progress/:id**

**Description:** Delete a progress log
**Auth:** Bearer Token

---

# **5. Default Exercise Routes**

### **GET /api/default-exercises**

**Description:** Get all default exercises
**Auth:** Bearer Token

### **POST /api/default-exercises**

**Description:** Create a default exercise
**Auth:** Admin Only

### **PUT /api/default-exercises/:id**

**Description:** Update a default exercise
**Auth:** Admin Only

### **DELETE /api/default-exercises/:id**

**Description:** Delete a default exercise
**Auth:** Admin Only

---

# **6. Default Workout Routes**

### **GET /api/default-workouts**

**Description:** Get all default workouts
**Auth:** Bearer Token

### **POST /api/default-workouts**

**Description:** Create a default workout
**Auth:** Admin Only

### **PUT /api/default-workouts/:id**

**Description:** Update a default workout
**Auth:** Admin Only

### **DELETE /api/default-workouts/:id**

**Description:** Delete a default workout
**Auth:** Admin Only

---

# **7. Health Check Route**

### **GET /api/health**

**Description:** Verify server status
**Auth:** Public

**Response Example:**

```json
{
  "success": true,
  "message": "Server is running"
}
```
