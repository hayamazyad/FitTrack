// Progress log routes
const express = require('express');
const router = express.Router();
const {
  getProgressLogs,
  getProgressLog,
  createProgressLog,
  updateProgressLog,
  deleteProgressLog,
  getStats,
} = require('../controllers/progressLogController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /api/progress/stats:
 *   get:
 *     summary: Get user progress statistics
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progress statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalWorkouts:
 *                       type: number
 *                     totalDuration:
 *                       type: number
 *                     totalCalories:
 *                       type: number
 */
router.get('/stats', auth, getStats);

/**
 * @swagger
 * /api/progress:
 *   get:
 *     summary: Get all progress logs for current user
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of progress logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProgressLog'
 */
router.get('/', auth, getProgressLogs);

/**
 * @swagger
 * /api/progress/{id}:
 *   get:
 *     summary: Get progress log by ID
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Progress log ID
 *     responses:
 *       200:
 *         description: Progress log details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ProgressLog'
 *       404:
 *         description: Progress log not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', auth, getProgressLog);

/**
 * @swagger
 * /api/progress:
 *   post:
 *     summary: Create a new progress log
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProgressLog'
 *     responses:
 *       201:
 *         description: Progress log created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ProgressLog'
 */
router.post('/', auth, createProgressLog);

/**
 * @swagger
 * /api/progress/{id}:
 *   put:
 *     summary: Update a progress log
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Progress log ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProgressLog'
 *     responses:
 *       200:
 *         description: Progress log updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ProgressLog'
 *       404:
 *         description: Progress log not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', auth, updateProgressLog);

/**
 * @swagger
 * /api/progress/{id}:
 *   delete:
 *     summary: Delete a progress log
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Progress log ID
 *     responses:
 *       200:
 *         description: Progress log deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Progress log not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', auth, deleteProgressLog);

module.exports = router;

