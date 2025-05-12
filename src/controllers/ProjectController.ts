import {Request, Response} from 'express'
import Project from '../models/Project'

export class ProjectController {
    
    static createProject = async (req: Request, res: Response) => {
        
        const project = new Project(req.body)

        //Asigna un manager
        project.manager = req.user.id

        try {
            await project.save() //La otra opcion es hacerlo aca directamente con await Project.create(req.body) - De la forma en la que esta es mejor
            res.send('Proyecto creado correctamente')
        } catch (error) {
            console.log(error)
        }
    }
    
    static getAllProjects = async (req: Request, res: Response) => {
        try {
            const projects = await Project.find({
                /* aca filtramos la busqueda y pedimos que solo nos devuelva los proyectos
                asociados al usuario que los creo. */
                /* ademas ponemos para que te aparezca si perteneces a algun proyecto tmb */
                $or: [
                    {manager: {$in: req.user.id}},
                    {team: {$in: req.user.id}}
                ]
            })
            res.json(projects)
        } catch (error) {
            console.log(error)
        }
    }

    static getProjectById = async (req: Request, res: Response) => {
        const {id} = req.params

        try {
            //hacemos el populate si queremos la info de las tasks ademas del id, sino lo sacamos
            const project = await Project.findById(id).populate('tasks')

            //cuando cambiabamos el ultimo digito del id se imprimia un null por eso hice esto.
            if (!project) {
                res.status(404).json({ message: "Proyecto no encontrado" });
                return;
            }

            if(project.manager.toString() !== req.user.id.toString() && !project.team.includes(req.user.id)){
                res.status(404).json({ message: "Accion no valida" });
                return;
            }

            res.json(project)
        } catch (error) {
            console.log(error)
        }
    }

    static updateProject = async (req: Request, res: Response) => {
        try {
            req.project.clientName = req.body.clientName
            req.project.projectName = req.body.projectName
            req.project.description = req.body.description

            await req.project.save()
            res.send('Proyecto actualizado correctamente')
        } catch (error) {
            console.log(error)
        }
    }

    static deleteProject = async (req: Request, res: Response) => {
        try {
            await req.project.deleteOne()
            res.send('Proyecto eliminado correctamente')
        } catch (error) {
            console.log(error)
        }
    }
    
}