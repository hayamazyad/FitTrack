// Exercise controller - handles CRUD operations for exercises
const Exercise = require('../models/Exercise');
const DefaultExercise = require('../models/DefaultExercise');

// @desc    Get all exercises (user's own exercises if authenticated, empty if not)
// @route   GET /api/exercises
// @access  Public (but filters by user if authenticated)
const getExercises = async (req, res) => {
  try {
    // If user is authenticated, only return their exercises
    // If not authenticated, return empty array
    const query = req.user ? { createdBy: req.user.id } : { _id: { $exists: false } }; // Return nothing if not authenticated

    const [userExercises, defaultExercises] = await Promise.all([
      Exercise.find(query).sort({ createdAt: -1 }).lean(),
      DefaultExercise.find().sort({ createdAt: -1 }).lean(),
    ]);

    const data = [
      ...defaultExercises.map((exercise) => ({
        ...exercise,
        isDefault: true,
      })),
      ...userExercises.map((exercise) => ({
        ...exercise,
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
      message: error.message || 'Error fetching exercises',
    });
  }
};

// @desc    Get single exercise
// @route   GET /api/exercises/:id
// @access  Public
const getExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      const defaultExercise = await DefaultExercise.findById(req.params.id);
      if (!defaultExercise) {
        return res.status(404).json({
          success: false,
          message: 'Exercise not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          ...defaultExercise.toObject(),
          isDefault: true,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...exercise.toObject(),
        isDefault: false,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching exercise',
    });
  }
};

// @desc    Create new exercise
// @route   POST /api/exercises
// @access  Private
const createExercise = async (req, res) => {
  try {
    const exercise = await Exercise.create({
      ...req.body,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Exercise created successfully',
      data: {
        ...exercise.toObject(),
        isDefault: false,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating exercise',
    });
  }
};

// @desc    Update exercise
// @route   PUT /api/exercises/:id
// @access  Private (owner only)
const updateExercise = async (req, res) => {
  try {
    let exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found',
      });
    }

    // Check if user is the owner (or if it's a system exercise, allow update)
    if (exercise.createdBy && exercise.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this exercise',
      });
    }

    exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Exercise updated successfully',
      data: {
        ...exercise.toObject(),
        isDefault: false,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating exercise',
    });
  }
};

// @desc    Delete exercise
// @route   DELETE /api/exercises/:id
// @access  Private (owner only)
const deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found',
      });
    }

    // Check if user is the owner
    if (exercise.createdBy && exercise.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this exercise',
      });
    }

    await exercise.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Exercise deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting exercise',
    });
  }
};

module.exports = {
  getExercises,
  getExercise,
  createExercise,
  updateExercise,
  deleteExercise,
};

