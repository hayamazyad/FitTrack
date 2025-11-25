// Default exercise controller - CRUD endpoints for admin managed templates
const DefaultExercise = require('../models/DefaultExercise');
const DefaultWorkout = require('../models/DefaultWorkout');

// @desc    Get all default exercises
// @route   GET /api/default-exercises
// @access  Private (any authenticated user can read)
const getDefaultExercises = async (_req, res) => {
  try {
    const exercises = await DefaultExercise.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({
      success: true,
      count: exercises.length,
      data: exercises.map((exercise) => ({
        ...exercise,
        isDefault: true,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching default exercises',
    });
  }
};

// @desc    Create default exercise
// @route   POST /api/default-exercises
// @access  Private/Admin
const createDefaultExercise = async (req, res) => {
  try {
    const exercise = await DefaultExercise.create({
      ...req.body,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Default exercise created successfully',
      data: {
        ...exercise.toObject(),
        isDefault: true,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating default exercise',
    });
  }
};

// @desc    Update default exercise
// @route   PUT /api/default-exercises/:id
// @access  Private/Admin
const updateDefaultExercise = async (req, res) => {
  try {
    const exercise = await DefaultExercise.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Default exercise not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Default exercise updated successfully',
      data: {
        ...exercise.toObject(),
        isDefault: true,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating default exercise',
    });
  }
};

// @desc    Delete default exercise
// @route   DELETE /api/default-exercises/:id
// @access  Private/Admin
const deleteDefaultExercise = async (req, res) => {
  try {
    const exercise = await DefaultExercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Default exercise not found',
      });
    }

    const isInUse = await DefaultWorkout.exists({ exercises: exercise._id });
    if (isInUse) {
      return res.status(400).json({
        success: false,
        message: 'Exercise is still used inside a default workout. Update those workouts first.',
      });
    }

    await exercise.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Default exercise deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting default exercise',
    });
  }
};

module.exports = {
  getDefaultExercises,
  createDefaultExercise,
  updateDefaultExercise,
  deleteDefaultExercise,
};


