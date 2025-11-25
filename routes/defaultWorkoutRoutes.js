// Routes for admin-managed default workouts
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireRole } = auth;
const {
  getDefaultWorkouts,
  createDefaultWorkout,
  updateDefaultWorkout,
  deleteDefaultWorkout,
} = require('../controllers/defaultWorkoutController');

/**
 * @swagger
 * tags:
 *   name: DefaultWorkouts
 *   description: Admin curated workout templates
 */

/**
 * @swagger
 * /api/default-workouts:
 *   get:
 *     summary: Get all default workouts
 *     tags: [DefaultWorkouts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of default workouts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DefaultWorkout'
 */
router.get('/', auth, getDefaultWorkouts);

/**
 * @swagger
 * /api/default-workouts:
 *   post:
 *     summary: Create a default workout (admin)
 *     tags: [DefaultWorkouts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DefaultWorkout'
 *     responses:
 *       201:
 *         description: Default workout created
 */
router.post('/', auth, requireRole(['admin']), createDefaultWorkout);

/**
 * @swagger
 * /api/default-workouts/{id}:
 *   put:
 *     summary: Update a default workout (admin)
 *     tags: [DefaultWorkouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Default workout updated
 */
router.put('/:id', auth, requireRole(['admin']), updateDefaultWorkout);

/**
 * @swagger
 * /api/default-workouts/{id}:
 *   delete:
 *     summary: Delete a default workout (admin)
 *     tags: [DefaultWorkouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Default workout deleted
 */
router.delete('/:id', auth, requireRole(['admin']), deleteDefaultWorkout);

module.exports = router;


