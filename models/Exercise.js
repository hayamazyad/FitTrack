// Exercise model - represents a single exercise in the exercise library
// Contains exercise details, instructions, target muscles, equipment, and metadata
const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Exercise name is required'],
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
    targetMuscles: {
      type: [String],
      default: [],
    },
    equipment: {
      type: [String],
      default: [],
    },
    instructions: {
      type: [String],
      default: [],
    },
    sets: {
      type: Number,
      min: 1,
    },
    reps: {
      type: Number,
      min: 1,
    },
    duration: {
      type: Number, // Duration in minutes
      min: 0,
    },
    caloriesBurned: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null for default/system exercises, ObjectId for user-created exercises
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Exercise', exerciseSchema);

