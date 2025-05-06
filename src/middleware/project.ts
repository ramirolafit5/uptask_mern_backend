import {Request, Response, NextFunction} from 'express'
import Project, { IProject } from '../models/Project';

//explicacion minuto 5 video 470 (las interfaces con nombres duplicados hacen que puedas agregar cosas a lo que ya esta creado)
//hacemos esto para pasar por request nuestro proyecto para poder usarlo en el controlador
//entonces modificados la estructura interna de Request en express
declare global {
    namespace Express {
        interface Request {
            project: IProject
        }
    }
}

export async function validateProjectExists (req: Request, res: Response, next: NextFunction) {
    try {
        const {projectId} = req.params
        const project = await Project.findById(projectId)

        if(!project) {
            const error = new Error('Proyecto no encontrado')
            res.status(404).json({error: error.message})
            return
        }
        //aca es donde asignamos nuestro proyecto al request
        req.project = project
        next()
    } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
    }
}