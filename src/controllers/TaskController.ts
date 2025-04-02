import {Request, Response} from 'express'
import Task from '../models/Task'

export class TaskController {

    static createProject = async (req: Request, res: Response) => {
        try {
            const task = new Task(req.body)
            task.project = req.project.id
            req.project.tasks.push(task.id)
            await task.save()
            await req.project.save()
            //Podriamos hacer esto en vez de hacer el doble await --> await Promise.allSettled([task.save(), req.project.save()])
            res.send('Tarea creada correctamente')

        } catch (error) {
            console.log(error)
        }
    }

    static getProjectTasks = async (req: Request, res: Response) => {
        try {
            //el populate que hacemos aca es para que nos muestre la demas informacion del proyecto ademas del id
            const tasks = await Task.find({project: req.project.id}).populate('project')
            res.json(tasks)
        } catch (error) {
            console.log(error)
        }
    }

    static getTaskById = async (req: Request, res: Response) => {
        const {taskId} = req.params
        try {
            const task = await Task.findById(taskId)

            if (!task) {
                res.status(404).json({ message: "Tarea no encontrada" });
                return;
            }
            //esta validacion es para que no pueda traerte una tarea de otro proyecto
            //hacemos clg para cada uno de estos (task.project !== req.project.id) y vemos que no son iguales
            //entonces convertimos en string antes de la validacion
            //console.log(task.project.toString())
            //console.log(req.project.id)
            if (task.project.toString() !== req.project.id) {
                res.status(400).json({ message: "Accion no valida" });
                return;
            }

            res.json(task)
        } catch (error) {
            console.log(error)
        }
    }

    static updateTask = async (req: Request, res: Response) => {
        const {taskId} = req.params
        try {
            const task = await Task.findById(taskId)

            if (!task) {
                res.status(404).json({ message: "Tarea no encontrada" });
                return;
            }
            if (task.project.toString() !== req.project.id) {
                res.status(400).json({ message: "Accion no valida" });
                return;
            }

            //finalmente no uso findByIdAndUpdate prq no me toma las validaciones que hice
            //entonces de esta forma agregamos manualmente y guardamos
            task.name = req.body.name
            task.description = req.body.description
            await task.save()

            res.send('Task actualizada correctamente')

        } catch (error) {
            console.log(error)
        }
    }

    static deleteTask = async (req: Request, res: Response) => {
        try {
            const {taskId} = req.params

            /* aca podemos ver la diferencia entre findById y findByIdAndDelete.. En el que estamos usando
            actualmente nos permite hacer ciertas validaciones antes de la eliminacion, en cambio de la
            otra forma no nos hubiera dejado */
            
            const task = await Task.findById(taskId)

            if (!task) {
                res.status(404).json({ message: "Tarea no encontrada" });
                return;
            }
            //filtramos y nos quedamos con todas las task distintas a la que pasaron por parametro
            req.project.tasks = req.project.tasks.filter( task => task.toString() !== taskId)

            await task.deleteOne()
            await req.project.save()

            res.send('Task eliminada correctamente')

        } catch (error) {
            console.log(error)
        }
    }

    static changeStatus = async (req: Request, res: Response) => {
        try {
            //ya creamos el middleware entonces llamamos a task con req.task y queda el codigo limpio
            const { status } = req.body
            req.task.status = req.body.status
            await req.task.save()
            res.send('Tarea Actualizada')
            
        } catch (error) {
            console.log(error)
        }
    }
}