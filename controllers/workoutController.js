// Workout controller - handles CRUD operations for workouts
const Workout = require('../models/Workout');
const Exercise = require('../models/Exercise');
const DefaultWorkout = require('../models/DefaultWorkout');

// @desc    Get all workouts (user's own workouts if authenticated, empty if not)
// @route   GET /api/workouts
// @access  Public (but filters by user if authenticated)
const getWorkouts = async (req, res) => {
  try {
    // If user is authenticated, only return their workouts
    // If not authenticated, return empty array
    const query = req.user ? { createdBy: req.user.id } : { _id: { $exists: false } }; // Return nothing if not authenticated
    
    const [userWorkouts, defaultWorkouts] = await Promise.all([
      Workout.find(query)
        .populate('exercises', 'name category difficulty description targetMuscles equipment instructions')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .lean(),
      DefaultWorkout.find()
        .populate('exercises')
        .sort({ createdAt: -1 })
        .lean({ virtuals: true }),
    ]);

    const data = [
      ...defaultWorkouts.map((workout) => ({
        ...workout,
        isDefault: true,
        createdBy: null,
        exercises: (workout.exercises || []).map((exercise) => ({
          ...exercise,
          isDefault: true,
        })),
      })),
      ...userWorkouts.map((workout) => ({
        ...workout,
        isDefault: false,
      })),
    ];

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching workouts',
    });
  }
};

// @desc    Get single workout
// @route   GET /api/workouts/:id
// @access  Public
const getWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id)
      .populate('exercises')
      .populate('createdBy', 'name email');

    if (!workout) {
      const defaultWorkout = await DefaultWorkout.findById(req.params.id).populate('exercises');
      if (!defaultWorkout) {
        return res.status(404).json({
          success: false,
          message: 'Workout not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          ...defaultWorkout.toObject(),
          isDefault: true,
          createdBy: null,
          exercises: (defaultWorkout.exercises || []).map((exercise) => ({
            ...exercise.toObject(),
            isDefault: true,
          })),
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...workout.toObject(),
        isDefault: false,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching workout',
    });
  }
};

// @desc    Create new workout
// @route   POST /api/workouts
// @access  Private
// Can be called from LogWorkout page or workout creation form
const createWorkout = async (req, res) => {
  try {
    const { name, category, difficulty, description, duration, caloriesBurned, exercises, instructions } = req.body;

    // Validate required fields
    if (!name || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and duration',
      });
    }

    // Set defaults for category and difficulty if not provided (for logged workouts)
    const workoutCategory = category || 'strength';
    const workoutDifficulty = difficulty || 'intermediate';

    // Validate exercises exist if provided
    if (exercises && exercises.length > 0) {
      const exerciseDocs = await Exercise.find({ _id: { $in: exercises } });
      if (exerciseDocs.length !== exercises.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more exercises not found',
        });
      }
    }

    const workout = await Workout.create({
      name,
      category: workoutCategory,
      difficulty: workoutDifficulty,
      description: description || '',
      duration,
      caloriesBurned: caloriesBurned || 0,
      exercises: exercises || [],
      instructions: instructions || [],
      createdBy: req.user.id,
    });

    const populatedWorkout = await Workout.findById(workout._id)
      .populate('exercises', 'name category difficulty description targetMuscles equipment instructions')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Workout created successfully',
      data: {
        ...populatedWorkout.toObject(),
        isDefault: false,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating workout',
    });
  }
};

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private (owner only)
const updateWorkout = async (req, res) => {
  try {
    let workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found',
      });
    }

    // Check if user is the owner
    if (workout.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this workout',
      });
    }

    // Validate exercises if provided
    if (req.body.exercises && req.body.exercises.length > 0) {
      const exerciseDocs = await Exercise.find({ _id: { $in: req.body.exercises } });
      if (exerciseDocs.length !== req.body.exercises.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more exercises not found',
        });
      }
    }

    workout = await Workout.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('exercises')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Workout updated successfully',
      data: {
        ...workout.toObject(),
        isDefault: false,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating workout',
    });
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private (owner only)
const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found',
      });
    }

    // Check if user is the owner
    if (workout.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this workout',
      });
    }

    await workout.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Workout deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting workout',
    });
  }
};

module.exports = {
  getWorkouts,
  getWorkout,
  createWorkout,
  updateWorkout,
  deleteWorkout,
};

