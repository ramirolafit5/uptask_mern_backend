import {Router} from 'express'
import { ProjectController } from '../controllers/ProjectController'
import { body, param } from 'express-validator'
import { handleInputErrors } from '../middleware/validation'
import { TaskController } from '../controllers/TaskController'
import { validateProjectExists } from '../middleware/project'
import { taskBelongToProject, taskExists } from '../middleware/task'

const router = Router()

router.post('/', 
    body('projectName')
        .notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripcion del proyecto es obligatoria'),
    handleInputErrors,
    ProjectController.createProject
)

router.get('/', ProjectController.getAllProjects)

//isMongoId es para manejar los id como los maneja esa BDD (ej. 67e68e633dbeaee07b7e3aa0)
router.get('/:id', 
    param('id').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    ProjectController.getProjectById)

router.put('/:id', 
    param('id').isMongoId().withMessage('ID no valido'),
    body('projectName')
        .notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripcion del proyecto es obligatoria'),
    handleInputErrors,
    ProjectController.updateProject)

router.delete('/:id', 
    param('id').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    ProjectController.deleteProject)

/* Routes for tasks */

//aca validamos para todos los router que contienen ese parametro asi evitamos redundancia de codigo
router.param('projectId', validateProjectExists)

router.post('/:projectId/tasks', 
    body('name')
        .notEmpty().withMessage('El nombre de la tarea es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripcion de la tarea es obligatoria'),
    handleInputErrors,
    TaskController.createProject)

router.get('/:projectId/tasks',
    TaskController.getProjectTasks) 

router.param('taskId', taskExists)
router.param('taskId', taskBelongToProject)

router.get('/:projectId/tasks/:taskId',
    param('taskId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    TaskController.getTaskById) 

router.put('/:projectId/tasks/:taskId',
    param('taskId').isMongoId().withMessage('ID no valido'),
    body('name')
        .notEmpty().withMessage('El nombre de la tarea es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripcion de la tarea es obligatoria'),
    handleInputErrors,
    TaskController.updateTask)

router.delete('/:projectId/tasks/:taskId',
    param('taskId').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    TaskController.deleteTask)

router.post('/:projectId/tasks/:taskId/status',
    param('taskId').isMongoId().withMessage('ID no valido'),
    body('status').notEmpty().withMessage('El estado es obligatorio'),
    handleInputErrors,
    TaskController.changeStatus)

export default router