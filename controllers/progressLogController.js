// ProgressLog controller - handles CRUD operations for workout progress logs
// Progress data is now computed from Workouts collection (single source of truth)
const ProgressLog = require('../models/ProgressLog');
const Workout = require('../models/Workout');
const User = require('../models/User');

// @desc    Get all progress logs for current user
// @route   GET /api/progress
// @access  Private
// Returns actual ProgressLog entries for the user
const getProgressLogs = async (req, res) => {
  try {
    // Get all progress logs for the user, sorted by date (most recent first)
    const progressLogs = await ProgressLog.find({ userId: req.user.id })
      .populate('workoutId', 'name category difficulty exercises description')
      .populate('userId', 'name email')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: progressLogs.length,
      data: progressLogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching progress logs',
    });
  }
};

// @desc    Get single progress log
// @route   GET /api/progress/:id
// @access  Private (owner only)
const getProgressLog = async (req, res) => {
  try {
    const progressLog = await ProgressLog.findById(req.params.id)
      .populate('workoutId', 'name category difficulty exercises')
      .populate('userId', 'name email');

    if (!progressLog) {
      return res.status(404).json({
        success: false,
        message: 'Progress log not found',
      });
    }

    // Check if user is the owner
    if (progressLog.userId._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this progress log',
      });
    }

    res.status(200).json({
      success: true,
      data: progressLog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching progress log',
    });
  }
};

// @desc    Create new progress log
// @route   POST /api/progress
// @access  Private
const createProgressLog = async (req, res) => {
  try {
    const { workoutId, workoutName, date, duration, caloriesBurned, notes, completed } = req.body;

    // Validate required fields
    if (!workoutName || !date || duration === undefined || caloriesBurned === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide workoutName, date, duration, and caloriesBurned',
      });
    }

    const progressLog = await ProgressLog.create({
      userId: req.user.id,
      workoutId: workoutId || null,
      workoutName,
      date: new Date(date),
      duration,
      caloriesBurned,
      notes: notes || '',
      completed: completed !== undefined ? completed : true,
    });

    const populatedLog = await ProgressLog.findById(progressLog._id)
      .populate('workoutId', 'name category difficulty')
      .populate('userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Progress log created successfully',
      data: populatedLog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating progress log',
    });
  }
};

// @desc    Update progress log
// @route   PUT /api/progress/:id
// @access  Private (owner only)
const updateProgressLog = async (req, res) => {
  try {
    let progressLog = await ProgressLog.findById(req.params.id);

    if (!progressLog) {
      return res.status(404).json({
        success: false,
        message: 'Progress log not found',
      });
    }

    // Check if user is the owner
    if (progressLog.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this progress log',
      });
    }

    // Update date if provided
    if (req.body.date) {
      req.body.date = new Date(req.body.date);
    }

    progressLog = await ProgressLog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('workoutId', 'name category difficulty')
      .populate('userId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Progress log updated successfully',
      data: progressLog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating progress log',
    });
  }
};

// @desc    Delete progress log
// @route   DELETE /api/progress/:id
// @access  Private (owner only)
const deleteProgressLog = async (req, res) => {
  try {
    const progressLog = await ProgressLog.findById(req.params.id);

    if (!progressLog) {
      return res.status(404).json({
        success: false,
        message: 'Progress log not found',
      });
    }

    // Check if user is the owner
    if (progressLog.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this progress log',
      });
    }

    await progressLog.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Progress log deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting progress log',
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/progress/stats
// @access  Private
// Statistics are computed from ProgressLog entries (completed workouts only)
const getStats = async (req, res) => {
  try {
    // Aggregate statistics from completed progress logs for the user
    const completedLogs = await ProgressLog.find({ 
      userId: req.user.id,
      completed: true 
    });

    const totalWorkouts = completedLogs.length;
    const totalMinutes = completedLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
    const totalCalories = completedLogs.reduce((sum, log) => sum + (log.caloriesBurned || 0), 0);
    const averageCaloriesPerWorkout = totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalWorkouts,
        totalMinutes,
        totalCalories,
        averageCaloriesPerWorkout,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching statistics',
    });
  }
};

module.exports = {
  getProgressLogs,
  getProgressLog,
  createProgressLog,
  updateProgressLog,
  deleteProgressLog,
  getStats,
};

