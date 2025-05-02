import {Request, Response} from 'express'
import User from '../models/User'
import Project from '../models/Project'

export class TeamMemberController {
    
    static findMemberByEmail = async (req: Request, res: Response) => {
        const {email} = req.body

        //Find user
        const user = await User.findOne({email}).select('id email name')
        if(!user){
            const error = new Error('Usuario no encontrado')
            res.status(404).json({error: error.message})
            return
        }
        res.json(user)
    }

    static addMemberById = async (req: Request, res: Response) => {
        const {id} = req.body
        //Find user
        const user = await User.findById(id).select('id')
        if(!user){
            const error = new Error('Usuario no encontrado')
            res.status(404).json({error: error.message})
        }
        
        // Verificar si el usuario ya está en el equipo
        if (req.project.team.some( team => team.toString() === user.id.toString())) {
            const error = new Error('El usuario ya forma parte del equipo')
            res.status(409).json({ error: error.message })
            return
        }

        req.project.team.push(user.id)
        await req.project.save()

        res.send('Usuario agregado correctamente')
    }

    static removeMemberById = async (req: Request, res: Response) => {
        const {userId} = req.params

        //Verificar si el usuario existe
        //Negamos la condicion del some
        if (!req.project.team.some( teamMember => teamMember.toString() === userId.toString())) {
            const error = new Error('Este usuario no forma parte del equipo')
            res.status(409).json({ error: error.message })
            return
        }

        req.project.team = req.project.team.filter(teamMember => teamMember.toString() !== userId.toString())

        await req.project.save()
        res.send('Colaborador eliminado correctamente')   
    }

    static getProjectTeam = async (req: Request, res: Response) => {
        
        const project = await Project.findById(req.project.id).populate({
            path: 'team',
            select: 'id name email'
        })
        res.json(project.team)
    }
}