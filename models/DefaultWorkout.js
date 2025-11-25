// DefaultWorkout model - admin curated workouts linking to DefaultExercise docs
const mongoose = require('mongoose');

const defaultWorkoutSchema = new mongoose.Schema(
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
      type: Number,
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
        ref: 'DefaultExercise',
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
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DefaultWorkout', defaultWorkoutSchema);


