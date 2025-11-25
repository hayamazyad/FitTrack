// Workout model - represents a workout plan containing multiple exercises
// Users can create custom workouts or use predefined workout templates
const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workout name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['strength', 'cardio', 'flexibility', 'sports'],
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: ['beginner', 'intermediate', 'advanced'],
    },
    description: {
      type: String,
      default: '',
    },
    duration: {
      type: Number, // Total duration in minutes
      required: [true, 'Duration is required'],
      min: 0,
    },
    caloriesBurned: {
      type: Number,
      default: 0,
      min: 0,
    },
    exercises: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise',
        required: true,
      },
    ],
    instructions: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // All workouts must be associated with a user
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Workout', workoutSchema);

