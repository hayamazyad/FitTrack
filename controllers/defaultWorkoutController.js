// Default workout controller - admin CRUD for shared workouts
const DefaultWorkout = require('../models/DefaultWorkout');
const DefaultExercise = require('../models/DefaultExercise');

// Helper to validate exercises exist
const validateDefaultExercises = async (exerciseIds = []) => {
  if (!exerciseIds.length) {
    return;
  }
  const existing = await DefaultExercise.find({ _id: { $in: exerciseIds } });
  if (existing.length !== exerciseIds.length) {
    throw new Error('One or more default exercises were not found');
  }
};

// @desc    Get all default workouts
// @route   GET /api/default-workouts
// @access  Private (any authenticated user can read)
const getDefaultWorkouts = async (_req, res) => {
  try {
    const workouts = await DefaultWorkout.find()
      .populate('exercises')
      .sort({ createdAt: -1 })
      .lean({ virtuals: true });

    res.status(200).json({
      success: true,
      count: workouts.length,
      data: workouts.map((workout) => ({
        ...workout,
        isDefault: true,
        exercises: (workout.exercises || []).map((exercise) => ({
          ...exercise,
          isDefault: true,
        })),
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching default workouts',
    });
  }
};

// @desc    Create a default workout
// @route   POST /api/default-workouts
// @access  Private/Admin
const createDefaultWorkout = async (req, res) => {
  try {
    await validateDefaultExercises(req.body.exercises);

    const workout = await DefaultWorkout.create({
      ...req.body,
      createdBy: req.user.id,
    });

    const populated = await DefaultWorkout.findById(workout._id).populate('exercises');

    res.status(201).json({
      success: true,
      message: 'Default workout created successfully',
      data: {
        ...populated.toObject(),
        isDefault: true,
        exercises: populated.exercises.map((exercise) => ({
          ...exercise.toObject(),
          isDefault: true,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating default workout',
    });
  }
};

// @desc    Update a default workout
// @route   PUT /api/default-workouts/:id
// @access  Private/Admin
const updateDefaultWorkout = async (req, res) => {
  try {
    if (req.body.exercises) {
      await validateDefaultExercises(req.body.exercises);
    }

    const workout = await DefaultWorkout.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('exercises');

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Default workout not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Default workout updated successfully',
      data: {
        ...workout.toObject(),
        isDefault: true,
        exercises: workout.exercises.map((exercise) => ({
          ...exercise.toObject(),
          isDefault: true,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating default workout',
    });
  }
};

// @desc    Delete a default workout
// @route   DELETE /api/default-workouts/:id
// @access  Private/Admin
const deleteDefaultWorkout = async (req, res) => {
  try {
    const workout = await DefaultWorkout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Default workout not found',
      });
    }

    await workout.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Default workout deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting default workout',
    });
  }
};

module.exports = {
  getDefaultWorkouts,
  createDefaultWorkout,
  updateDefaultWorkout,
  deleteDefaultWorkout,
};


