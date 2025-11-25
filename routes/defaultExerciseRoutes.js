//RAMA
// Routes for admin-managed default exercises
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireRole } = auth;
const {
  getDefaultExercises,
  createDefaultExercise,
  updateDefaultExercise,
  deleteDefaultExercise,
} = require('../controllers/defaultExerciseController');

/**
 * @swagger
 * tags:
 *   name: DefaultExercises
 *   description: Admin curated exercise templates
 */

/**
 * @swagger
 * /api/default-exercises:
 *   get:
 *     summary: Get all default exercises
 *     tags: [DefaultExercises]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of default exercises
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
 *                     $ref: '#/components/schemas/DefaultExercise'
 */
router.get('/', auth, getDefaultExercises);

/**
 * @swagger
 * /api/default-exercises:
 *   post:
 *     summary: Create a default exercise (admin)
 *     tags: [DefaultExercises]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DefaultExercise'
 *     responses:
 *       201:
 *         description: Default exercise created
 */
router.post('/', auth, requireRole(['admin']), createDefaultExercise);

/**
 * @swagger
 * /api/default-exercises/{id}:
 *   put:
 *     summary: Update a default exercise (admin)
 *     tags: [DefaultExercises]
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
 *         description: Default exercise updated
 */
router.put('/:id', auth, requireRole(['admin']), updateDefaultExercise);

/**
 * @swagger
 * /api/default-exercises/{id}:
 *   delete:
 *     summary: Delete a default exercise (admin)
 *     tags: [DefaultExercises]
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
 *         description: Default exercise deleted
 */
router.delete('/:id', auth, requireRole(['admin']), deleteDefaultExercise);

module.exports = router;


