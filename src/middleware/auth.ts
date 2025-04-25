import {Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'
import User, { IUser } from '../models/User'

//Este código le dice a TypeScript:“Ey, cada vez que uses Request, ahora también va a tener una propiedad user del tipo IUser (si existe).”
declare global {
    namespace Express {
        interface Request {
            user?: IUser
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {

    const bearer = req.headers.authorization
    if(!bearer){
        const error = new Error('No autorizado')
        res.status(401).json({error: error.message})
        return
    }

    const token = bearer.split(' ')[1]  //esto es para obtener el jwt sin el "bearer"

    try {
        //antes usabamos el sign para crear y ahora el verify para verificar
        //aca usamos la misma con la q firmamos para verificar (process.env.JWT_SECRET)
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        //console.log(decoded)
        //hacemos esta validacion para q no tire error y nos permita ejecutar
        if(typeof decoded === 'object' && decoded.id){
            const user = await User.findById(decoded.id).select('id name email')
            if(user){
                req.user = user
                next()
            } else {
                res.status(500).json({error: 'Token no valido'})
            }
        }
    } catch (error) {
        res.status(500).json({error: 'Token no valido'})
    }
}