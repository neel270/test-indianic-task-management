/**
 * @swagger
 * components:
 *   schemas:
 *     CreateTaskRequest:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - dueDate
 *         - assignedTo
 *       properties:
 *         title:
 *           type: string
 *           example: "Complete project documentation"
 *         description:
 *           type: string
 *           example: "Write comprehensive documentation for the new API endpoints"
 *         dueDate:
 *           type: string
 *           format: date
 *           example: "2023-12-31"
 *         assignedTo:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         status:
 *           type: string
 *           enum: [Pending, "In Progress", Completed, Cancelled]
 *           example: "Pending"
 *         priority:
 *           type: string
 *           enum: [Low, Medium, High]
 *           example: "Medium"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["documentation", "urgent"]
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 *           example: []
 *     UpdateTaskRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Complete project documentation"
 *         description:
 *           type: string
 *           example: "Write comprehensive documentation for the new API endpoints"
 *         status:
 *           type: string
 *           enum: [Pending, "In Progress", Completed, Cancelled]
 *           example: "In Progress"
 *         dueDate:
 *           type: string
 *           format: date
 *           example: "2023-12-31"
 *         priority:
 *           type: string
 *           enum: [Low, Medium, High]
 *           example: "High"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["documentation", "urgent"]
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 *           example: []
 *     TaskFilters:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 10
 *         status:
 *           type: string
 *           enum: [Pending, "In Progress", Completed, Cancelled]
 *           example: "Pending"
 *         startDate:
 *           type: string
 *           format: date
 *           example: "2023-01-01"
 *         endDate:
 *           type: string
 *           format: date
 *           example: "2023-12-31"
 *         sortBy:
 *           type: string
 *           example: "createdAt"
 *         sortOrder:
 *           type: string
 *           enum: [asc, desc]
 *           example: "desc"
 *     TaskResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         title:
 *           type: string
 *           example: "Complete project documentation"
 *         description:
 *           type: string
 *           example: "Write comprehensive documentation for the new API endpoints"
 *         status:
 *           type: string
 *           enum: [Pending, "In Progress", Completed, Cancelled]
 *           example: "In Progress"
 *         priority:
 *           type: string
 *           enum: [Low, Medium, High]
 *           example: "Medium"
 *         dueDate:
 *           type: string
 *           format: date
 *           example: "2023-12-31"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-02T00:00:00.000Z"
 *         completedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: null
 *         userId:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         assignedTo:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["documentation", "urgent"]
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 *           example: ["file1.pdf", "image.jpg"]
 *     TaskListResponse:
 *       type: object
 *       properties:
 *         tasks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TaskResponse'
 *         pagination:
 *           $ref: '#/components/schemas/PaginationInfo'
 *     TaskStatsResponse:
 *       type: object
 *       properties:
 *         totalTasks:
 *           type: integer
 *           example: 25
 *         completedTasks:
 *           type: integer
 *           example: 10
 *         pendingTasks:
 *           type: integer
 *           example: 8
 *         inProgressTasks:
 *           type: integer
 *           example: 7
 *         overdueTasks:
 *           type: integer
 *           example: 2
 *         completionRate:
 *           type: number
 *           format: float
 *           example: 40.0
 *     PaginationInfo:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 10
 *         total:
 *           type: integer
 *           example: 25
 *         totalPages:
 *           type: integer
 *           example: 3
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Operation completed successfully"
 *         data:
 *           type: object
 *           nullable: true
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "An error occurred"
 *         error:
 *           type: string
 *           example: "Error details"
 *     TaskIdParam:
 *       type: string
 *       description: Task ID
 *       example: "507f1f77bcf86cd799439011"
 *     UserIdParam:
 *       type: string
 *       description: User ID who owns the file
 *       example: "507f1f77bcf86cd799439011"
 *     FilenameParam:
 *       type: string
 *       description: Name of the file
 *       example: "document.pdf"
 *     PaginationParams:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *           description: Page number for pagination
 *         limit:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           example: 10
 *           description: Number of items per page
 *         sortBy:
 *           type: string
 *           example: "createdAt"
 *           description: Field to sort by
 *         sortOrder:
 *           type: string
 *           enum: [asc, desc]
 *           example: "desc"
 *           description: Sort order
 *     TaskStatusFilter:
 *       type: string
 *       enum: [Pending, "In Progress", Completed, Cancelled]
 *       example: "Pending"
 *       description: Filter by task status
 *     DateFilter:
 *       type: string
 *       format: date
 *       example: "2023-01-01"
 *       description: Filter date
 *   parameters:
 *     UserIdParameter:
 *       in: path
 *       name: userId
 *       required: true
 *       schema:
 *         $ref: '#/components/schemas/UserIdParam'
 *     TaskIdParameter:
 *       in: path
 *       name: taskId
 *       required: true
 *       schema:
 *         $ref: '#/components/schemas/TaskIdParam'
 *     FilenameParameter:
 *       in: path
 *       name: filename
 *       required: true
 *       schema:
 *         $ref: '#/components/schemas/FilenameParam'
 *     PageParameter:
 *       in: query
 *       name: page
 *       schema:
 *         type: integer
 *         minimum: 1
 *         example: 1
 *       description: Page number for pagination
 *     LimitParameter:
 *       in: query
 *       name: limit
 *       schema:
 *         type: integer
 *         minimum: 1
 *         maximum: 100
 *         example: 10
 *       description: Number of items per page
 *     StatusFilterParameter:
 *       in: query
 *       name: status
 *       schema:
 *         $ref: '#/components/schemas/TaskStatusFilter'
 *     StartDateFilterParameter:
 *       in: query
 *       name: startDate
 *       schema:
 *         $ref: '#/components/schemas/DateFilter'
 *       description: Filter tasks from this date
 *     EndDateFilterParameter:
 *       in: query
 *       name: endDate
 *       schema:
 *         $ref: '#/components/schemas/DateFilter'
 *       description: Filter tasks until this date
 *     SortByParameter:
 *       in: query
 *       name: sortBy
 *       schema:
 *         type: string
 *         example: "createdAt"
 *       description: Field to sort by
 *     SortOrderParameter:
 *       in: query
 *       name: sortOrder
 *       schema:
 *         type: string
 *         enum: [asc, desc]
 *         example: "desc"
 *       description: Sort order
 *   responses:
 *     SuccessResponse:
 *       description: Operation completed successfully
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApiResponse'
 *     CreatedResponse:
 *       description: Resource created successfully
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               message:
 *                 type: string
 *                 example: "Resource created successfully"
 *               data:
 *                 $ref: '#/components/schemas/TaskResponse'
 *     TaskResponse:
 *       description: Task retrieved successfully
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               message:
 *                 type: string
 *                 example: "Task retrieved successfully"
 *               data:
 *                 $ref: '#/components/schemas/TaskResponse'
 *     TaskListResponse:
 *       description: Tasks retrieved successfully
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               message:
 *                 type: string
 *                 example: "Tasks retrieved successfully"
 *               data:
 *                 $ref: '#/components/schemas/TaskListResponse'
 *     TaskStatsResponse:
 *       description: Task statistics retrieved successfully
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               message:
 *                 type: string
 *                 example: "Task statistics retrieved successfully"
 *               data:
 *                 $ref: '#/components/schemas/TaskStatsResponse'
 *     UnauthorizedResponse:
 *       description: Unauthorized - user not authenticated
 *     NotFoundResponse:
 *       description: Resource not found
 *     BadRequestResponse:
 *       description: Bad request - validation error
 *     ForbiddenResponse:
 *       description: Forbidden - access denied
 *     FileResponse:
 *       description: File served successfully
 *       content:
 *         application/octet-stream:
 *           schema:
 *             type: string
 *             format: binary
 *     CSVResponse:
 *       description: CSV file generated successfully
 *       content:
 *         text/csv:
 *           schema:
 *             type: string
 *             format: binary
 */
