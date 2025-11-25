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

**Links to the deployed application:** 

Frontend: [https://fittrack1-cnnv.onrender.com/](https://fittrack1-cnnv.onrender.com/)

Backend: [https://fittrack-1-hqcb.onrender.com/](https://fittrack-1-hqcb.onrender.com)

---

## Data Entities

The application currently simulates a backend using mock data for the following entities:

* Users
* Exercises
* Workouts
* Progress Logs
* Default exercises
* Default workouts

We used the online database pf MongoDB: mongodb+srv://fittrack:FITTRACK@cluster0.nhjzihv.mongodb.net/?appName=Cluster0

## Database Schema

Below is an overview of the main collections (tables) used in the MongoDB database.

---

### 1. User

Represents each registered user in the application.

| Field       | Type     | Description                          |
|------------|----------|--------------------------------------|
| `_id`      | ObjectId | Unique user identifier               |
| `name`     | String   | User’s full name                     |
| `email`    | String   | User email (unique)                  |
| `password` | String   | Hashed user password                 |
| `goals`    | String   | Optional personal fitness goals      |
| `createdAt`| Date     | Automatically added creation time    |
| `updatedAt`| Date     | Automatically added update time      |

---

### 2. Workout

Represents **user-created workouts** that group multiple exercises.

| Field           | Type       | Description                                                   |
|----------------|------------|---------------------------------------------------------------|
| `_id`          | ObjectId   | Unique workout identifier                                     |
| `name`         | String     | Workout name                                                  |
| `category`     | String     | One of: `strength`, `cardio`, `flexibility`, `sports`        |
| `difficulty`   | String     | One of: `beginner`, `intermediate`, `advanced`               |
| `description`  | String     | Short description of the workout                             |
| `duration`     | Number     | Total duration in minutes                                    |
| `caloriesBurned` | Number   | Estimated calories burned                                    |
| `exercises`    | [ObjectId] | Array of exercise IDs included in this workout               |
| `createdBy`    | ObjectId   | ID of the user who created the workout (`ref: User`)         |
| `createdAt`    | Date       | Automatically added creation time                            |
| `updatedAt`    | Date       | Automatically added update time                              |

---

### 3. Exercise

Represents **user-created exercises**.

| Field           | Type       | Description                                    |
|----------------|------------|------------------------------------------------|
| `_id`          | ObjectId   | Unique exercise identifier                     |
| `name`         | String     | Exercise name                                  |
| `muscle_group` | String     | Main muscle group targeted                    |
| `description`  | String     | Description / how to perform the exercise     |
| `sets`         | Number     | Recommended sets                               |
| `reps`         | Number     | Recommended reps                               |
| `duration`     | Number     | Duration in minutes (if applicable)           |
| `caloriesBurned` | Number   | Estimated calories burned                     |
| `createdBy`    | ObjectId   | ID of the user who created the exercise (`ref: User`) |
| `createdAt`    | Date       | Automatically added creation time             |
| `updatedAt`    | Date       | Automatically added update time               |

---

### 4. ProgressLog

Represents **logged workout sessions** for each user.

| Field           | Type       | Description                                     |
|----------------|------------|-------------------------------------------------|
| `_id`          | ObjectId   | Unique progress log identifier                  |
| `userId`       | ObjectId   | ID of the user (`ref: User`)                    |
| `workoutId`    | ObjectId   | ID of the workout performed (`ref: Workout`)    |
| `duration`     | Number     | Actual duration in minutes                      |
| `caloriesBurned` | Number   | Actual calories burned (estimated)              |
| `notes`        | String     | Optional notes about the session                |
| `createdAt`    | Date       | Automatically added creation time               |
| `updatedAt`    | Date       | Automatically added update time                 |

---

### 5. DefaultExercise

Represents **admin-created default exercises** that are visible to all users.

| Field           | Type       | Description                                                   |
|----------------|------------|---------------------------------------------------------------|
| `_id`          | ObjectId   | Unique default exercise identifier                            |
| `name`         | String     | Exercise name                                                 |
| `category`     | String     | One of: `strength`, `cardio`, `flexibility`, `sports`        |
| `difficulty`   | String     | One of: `beginner`, `intermediate`, `advanced`               |
| `description`  | String     | Description of the exercise                                  |
| `targetMuscles`| [String]   | List of target muscles                                       |
| `equipment`    | [String]   | List of required equipment (if any)                          |
| `instructions` | [String]   | Step-by-step instructions                                    |
| `sets`         | Number     | Recommended sets                                             |
| `reps`         | Number     | Recommended reps                                             |
| `duration`     | Number     | Duration in minutes (if applicable)                          |
| `caloriesBurned` | Number   | Estimated calories burned                                    |
| `createdBy`    | ObjectId   | ID of the admin who created it (`ref: User`)                 |
| `createdAt`    | Date       | Automatically added creation time                            |
| `updatedAt`    | Date       | Automatically added update time                              |

---

### 6. DefaultWorkout

Represents **admin-created default workouts** that are visible to all users.

| Field           | Type       | Description                                                   |
|----------------|------------|---------------------------------------------------------------|
| `_id`          | ObjectId   | Unique default workout identifier                             |
| `name`         | String     | Workout name                                                  |
| `category`     | String     | One of: `strength`, `cardio`, `flexibility`, `sports`        |
| `difficulty`   | String     | One of: `beginner`, `intermediate`, `advanced`               |
| `description`  | String     | Description of the workout                                   |
| `duration`     | Number     | Total duration in minutes                                    |
| `caloriesBurned` | Number   | Estimated calories burned                                    |
| `exercises`    | [ObjectId] | Array of default exercise IDs included in this workout       |
| `createdBy`    | ObjectId   | ID of the admin who created it (`ref: User`)                 |
| `createdAt`    | Date       | Automatically added creation time                            |
| `updatedAt`    | Date       | Automatically added update time                              |



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
  AuthController & DefaultExerciseController
* model:
  User & DefaultExercise
* routes:
  AuthRoute & DefaultExerciseRoute

### Haya Mazyad

* controllers:
  workoutController & DefaultWorkoutController
* model:
  Workout & DefaultWorkout
* routes:
  workRoute & DefaultWorkoutRoute

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
