import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { TaskController } from '../controllers/task.controller';

export class TaskRoutes {
  public router: Router;
  private taskController: TaskController;

  constructor() {
    this.router = Router();
    this.taskController = new TaskController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    /**
     * @swagger
     * /api/tasks:
     *   post:
     *     summary: Create a new task
     *     tags: [Tasks]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - title
     *               - description
     *               - dueDate
     *             properties:
     *               title:
     *                 type: string
     *                 example: "Complete project documentation"
     *               description:
     *                 type: string
     *                 example: "Write comprehensive documentation for the project"
     *               dueDate:
     *                 type: string
     *                 format: date-time
     *                 example: "2024-12-31T23:59:59Z"
     *               status:
     *                 type: string
     *                 enum: [Pending, Completed]
     *                 default: Pending
     *               priority:
     *                 type: string
     *                 enum: [Low, Medium, High]
     *                 default: Medium
     *               tags:
     *                 type: array
     *                 items:
     *                   type: string
     *                 example: ["urgent", "documentation"]
     *     responses:
     *       201:
     *         description: Task created successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     */
    this.router.post('/', authMiddleware.authenticate, this.taskController.createTask);

    /**
     * @swagger
     * /api/tasks:
     *   get:
     *     summary: Get tasks with pagination and filters
     *     tags: [Tasks]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           minimum: 1
     *           default: 1
     *         description: Page number
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 100
     *           default: 10
     *         description: Number of items per page
     *       - in: query
     *         name: status
     *         schema:
     *           type: string
     *           enum: [Pending, Completed]
     *         description: Filter by task status
     *       - in: query
     *         name: startDate
     *         schema:
     *           type: string
     *           format: date
     *         description: Filter tasks from this date
     *       - in: query
     *         name: endDate
     *         schema:
     *           type: string
     *           format: date
     *         description: Filter tasks until this date
     *       - in: query
     *         name: sortBy
     *         schema:
     *           type: string
     *           enum: [createdAt, dueDate, title, status]
     *         description: Sort field
     *       - in: query
     *         name: sortOrder
     *         schema:
     *           type: string
     *           enum: [asc, desc]
     *           default: desc
     *         description: Sort order
     *     responses:
     *       200:
     *         description: Tasks retrieved successfully
     *       401:
     *         description: Unauthorized
     */
    this.router.get('/', authMiddleware.authenticate, this.taskController.getTasks);

    /**
     * @swagger
     * /api/tasks/{id}:
     *   get:
     *     summary: Get task by ID
     *     tags: [Tasks]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Task ID
     *     responses:
     *       200:
     *         description: Task retrieved successfully
     *       404:
     *         description: Task not found
     *       401:
     *         description: Unauthorized
     */
    this.router.get('/:id', authMiddleware.authenticate, this.taskController.getTaskById);

    /**
     * @swagger
     * /api/tasks/{id}:
     *   put:
     *     summary: Update task
     *     tags: [Tasks]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Task ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *                 example: "Updated task title"
     *               description:
     *                 type: string
     *                 example: "Updated task description"
     *               status:
     *                 type: string
     *                 enum: [Pending, Completed]
     *               dueDate:
     *                 type: string
     *                 format: date-time
     *               priority:
     *                 type: string
     *                 enum: [Low, Medium, High]
     *               tags:
     *                 type: array
     *                 items:
     *                   type: string
     *     responses:
     *       200:
     *         description: Task updated successfully
     *       404:
     *         description: Task not found
     *       401:
     *         description: Unauthorized
     */
    this.router.put('/:id', authMiddleware.authenticate, this.taskController.updateTask);

    /**
     * @swagger
     * /api/tasks/{id}:
     *   delete:
     *     summary: Delete task
     *     tags: [Tasks]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Task ID
     *     responses:
     *       200:
     *         description: Task deleted successfully
     *       404:
     *         description: Task not found
     *       401:
     *         description: Unauthorized
     */
    this.router.delete('/:id', authMiddleware.authenticate, this.taskController.deleteTask);

    /**
     * @swagger
     * /api/tasks/{id}/complete:
     *   patch:
     *     summary: Mark task as completed
     *     tags: [Tasks]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Task ID
     *     responses:
     *       200:
     *         description: Task marked as completed
     *       404:
     *         description: Task not found
     *       401:
     *         description: Unauthorized
     */
    this.router.patch('/:id/complete', authMiddleware.authenticate, this.taskController.markTaskComplete);

    /**
     * @swagger
     * /api/tasks/{id}/pending:
     *   patch:
     *     summary: Mark task as pending
     *     tags: [Tasks]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Task ID
     *     responses:
     *       200:
     *         description: Task marked as pending
     *       404:
     *         description: Task not found
     *       401:
     *         description: Unauthorized
     */
    this.router.patch('/:id/pending', authMiddleware.authenticate, this.taskController.markTaskPending);

    /**
     * @swagger
     * /api/tasks/stats:
     *   get:
     *     summary: Get task statistics
     *     tags: [Tasks]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Task statistics retrieved successfully
     *       401:
     *         description: Unauthorized
     */
    this.router.get('/stats', authMiddleware.authenticate, this.taskController.getTaskStats);
  }
}
