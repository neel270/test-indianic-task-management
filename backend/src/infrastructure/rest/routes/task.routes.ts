import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { TaskController } from '../controllers/task.controller';
import {
  validateTaskCreation,
  validateTaskUpdate,
  validateGetTasks,
  validateGetTaskById,
  validateDeleteTask,
  validateMarkTaskComplete,
  validateMarkTaskPending,
  validateExportTasksToCSV,
} from '../../middlewares/express-validation.middleware';
import { taskFileUpload } from '../../config/multer.config';

export const createTaskRoutes = (): Router => {
  const router = Router();
  const taskController = new TaskController();

  router.post(
    '/',
    (req, res, next) => void authMiddleware.authenticate(req, res, next).catch(next),
    taskFileUpload.array('attachments', 10), // Allow up to 10 files
    validateTaskCreation,
    taskController.createTask
  );
  router.get(
    '/',
    (req, res, next) => void authMiddleware.authenticate(req, res, next).catch(next),
    validateGetTasks,
    taskController.getTasks
  );
  router.get(
    '/:id',
    (req, res, next) => void authMiddleware.authenticate(req, res, next).catch(next),
    validateGetTaskById,
    taskController.getTaskById
  );
  router.post(
    '/:id',
    (req, res, next) => void authMiddleware.authenticate(req, res, next).catch(next),
    taskFileUpload.array('attachments', 10), // Allow up to 10 files
    validateTaskUpdate,
    taskController.updateTask
  );
  router.delete(
    '/:id',
    (req, res, next) => void authMiddleware.authenticate(req, res, next).catch(next),
    validateDeleteTask,
    taskController.deleteTask
  );
  router.patch(
    '/:id/completed',
    (req, res, next) => void authMiddleware.authenticate(req, res, next).catch(next),
    validateMarkTaskComplete,
    taskController.markTaskComplete
  );
  router.patch(
    '/:id/pending',
    (req, res, next) => void authMiddleware.authenticate(req, res, next).catch(next),
    validateMarkTaskPending,
    taskController.markTaskPending
  );
  router.get(
    '/stats',
    (req, res, next) => void authMiddleware.authenticate(req, res, next).catch(next),
    taskController.getTaskStats
  );
  router.get(
    '/export/csv',
    (req, res, next) => void authMiddleware.authenticate(req, res, next).catch(next),
    validateExportTasksToCSV,
    taskController.exportTasksToCSV
  );

  // Serve attachment files
  router.get(
    '/attachments/:userId/:taskId/:filename',
    (req, res, next) => void authMiddleware.authenticate(req, res, next).catch(next),
    taskController.serveAttachment
  );

  return router;
};
