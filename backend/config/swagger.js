// Swagger configuration for API documentation
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FitTrack API',
      version: '1.0.0',
      description: 'API documentation for the FitTrack fitness application',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
            },
            name: {
              type: 'string',
              description: 'User name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
            },
            goals: {
              type: 'string',
              description: 'User fitness goals',
            },
            joinDate: {
              type: 'string',
              format: 'date-time',
              description: 'User join date',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'Role used for authorization',
            },
          },
        },
        Exercise: {
          type: 'object',
          required: ['name', 'category', 'difficulty'],
          properties: {
            _id: {
              type: 'string',
              description: 'Exercise ID',
            },
            name: {
              type: 'string',
              description: 'Exercise name',
            },
            category: {
              type: 'string',
              enum: ['strength', 'cardio', 'flexibility', 'sports'],
              description: 'Exercise category',
            },
            difficulty: {
              type: 'string',
              enum: ['beginner', 'intermediate', 'advanced'],
              description: 'Exercise difficulty level',
            },
            description: {
              type: 'string',
              description: 'Exercise description',
            },
            targetMuscles: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Target muscle groups',
            },
            equipment: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Required equipment',
            },
            instructions: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Exercise instructions',
            },
            sets: {
              type: 'number',
              minimum: 1,
              description: 'Number of sets',
            },
            reps: {
              type: 'number',
              minimum: 1,
              description: 'Number of repetitions',
            },
            duration: {
              type: 'number',
              minimum: 0,
              description: 'Duration in minutes',
            },
            caloriesBurned: {
              type: 'number',
              minimum: 0,
              description: 'Calories burned',
            },
            createdBy: {
              type: 'string',
              description: 'User ID who created the exercise',
            },
            isDefault: {
              type: 'boolean',
              description: 'Indicates whether it is an admin-provided exercise',
            },
          },
        },
        DefaultExercise: {
          allOf: [
            { $ref: '#/components/schemas/Exercise' },
            {
              properties: {
                createdBy: {
                  type: 'string',
                  nullable: true,
                  description: 'Admin who created the template',
                },
                isDefault: {
                  type: 'boolean',
                  example: true,
                },
              },
            },
          ],
        },
        Workout: {
          type: 'object',
          required: ['name', 'category', 'difficulty', 'duration'],
          properties: {
            _id: {
              type: 'string',
              description: 'Workout ID',
            },
            name: {
              type: 'string',
              description: 'Workout name',
            },
            category: {
              type: 'string',
              enum: ['strength', 'cardio', 'flexibility', 'sports'],
              description: 'Workout category',
            },
            difficulty: {
              type: 'string',
              enum: ['beginner', 'intermediate', 'advanced'],
              description: 'Workout difficulty level',
            },
            description: {
              type: 'string',
              description: 'Workout description',
            },
            duration: {
              type: 'number',
              minimum: 0,
              description: 'Duration in minutes',
            },
            caloriesBurned: {
              type: 'number',
              minimum: 0,
              description: 'Calories burned',
            },
            exercises: {
              type: 'array',
              items: {
                type: 'string',
                description: 'Exercise ID',
              },
              description: 'Array of exercise IDs',
            },
            instructions: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Optional workout instructions or tips',
            },
            createdBy: {
              type: 'string',
              description: 'User ID who created the workout',
            },
            isDefault: {
              type: 'boolean',
              description: 'Indicates whether it is an admin-provided workout',
            },
          },
        },
        DefaultWorkout: {
          allOf: [
            { $ref: '#/components/schemas/Workout' },
            {
              properties: {
                exercises: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/DefaultExercise',
                  },
                },
                createdBy: {
                  type: 'string',
                  nullable: true,
                  description: 'Admin who created the template',
                },
                isDefault: {
                  type: 'boolean',
                  example: true,
                },
              },
            },
          ],
        },
        ProgressLog: {
          type: 'object',
          required: ['workout', 'date'],
          properties: {
            _id: {
              type: 'string',
              description: 'Progress log ID',
            },
            workout: {
              type: 'string',
              description: 'Workout ID',
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Date of the workout',
            },
            duration: {
              type: 'number',
              minimum: 0,
              description: 'Actual duration in minutes',
            },
            caloriesBurned: {
              type: 'number',
              minimum: 0,
              description: 'Actual calories burned',
            },
            notes: {
              type: 'string',
              description: 'Additional notes',
            },
            createdBy: {
              type: 'string',
              description: 'User ID',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              description: 'Success message',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js', './server.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

