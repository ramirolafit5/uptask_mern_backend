import {Request, Response, NextFunction} from 'express'
import Task, { ITask } from '../models/Task';

declare global {
    namespace Express {
        interface Request {
            task: ITask
        }
    }
}

export async function taskExists (req: Request, res: Response, next: NextFunction) {
    try {
        const {taskId} = req.params
        const task = await Task.findById(taskId)

        if (!task) {
            res.status(404).json({ message: "Tarea no encontrada" });
            return;
        }
        //aca es donde asignamos nuestro proyecto al request
        req.task = task
        next()
    } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
    }
}

export async function taskBelongToProject(req: Request, res: Response, next: NextFunction) {
    if (req.task.project.toString() !== req.project.id.toString()) {
        res.status(400).json({ message: "Accion no valida" });
        return;
    }
    next()
}

export async function hasAuthorization(req: Request, res: Response, next: NextFunction) {
    if (req.user.id.toString() !== req.project.manager.toString()) {
        const error = new Error('Accion no valida')
        res.status(400).json({error: error.message})
        return;
    }
    next()
}