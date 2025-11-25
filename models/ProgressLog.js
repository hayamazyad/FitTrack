// ProgressLog model - represents a logged workout session completed by a user
// Tracks workout completion, duration, calories burned, and user notes
const mongoose = require('mongoose');

const progressLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    workoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workout',
      default: null, // null for custom workouts not in the system
    },
    workoutName: {
      type: String,
      required: [true, 'Workout name is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    duration: {
      type: Number, // Duration in minutes
      required: [true, 'Duration is required'],
      min: 0,
    },
    caloriesBurned: {
      type: Number,
      required: [true, 'Calories burned is required'],
      min: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    completed: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
progressLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('ProgressLog', progressLogSchema);

