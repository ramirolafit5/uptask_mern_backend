import {Request, Response} from 'express'
import User from '../models/User'
import { checkPassword, hashPassword } from '../utils/auth'
import Token from '../models/Token'
import { generateToken } from '../utils/token'
import { AuthEmail } from '../emails/AuthEmail'

export class AuthController {

    static createAccount = async (req: Request, res: Response) => {
        try {
            const {password, email} = req.body         //its not to be used all the time req.body...

            //Prevenir duplicados
            const userExist = await User.findOne({email})
            if(userExist){
                const error = new Error('El usuario ya esta registrado')
                res.status(409).json({error: error.message})
                return
            }

            const user = new User(req.body)

            //Hash Password (podriamos tener esto aca directamente en vez de crear el util)
            /* const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(password, salt) */
            user.password = await hashPassword(password)

            //Generar el token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            //Enviar email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await user.save()
            await token.save()

            res.send('Cuenta creada, revisa tu email para confirmarla')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const {token} = req.body

            //Verificar que exista el token
            const tokenExist = await Token.findOne({token})
            if(!tokenExist){
                const error = new Error('Token no valido')
                res.status(404).json({error: error.message})
                return
            }

            const user = await User.findById(tokenExist.user)
            user.confirmed = true

            await user.save()
            await tokenExist.deleteOne()

            res.send('Cuenta confirmada correctamente')

        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const {email, password} = req.body
            const user = await User.findOne({email})  //buscame al usuario por email
            
            //Si el usuario no existe
            if(!user){
                const error = new Error('Usuario no encontrado')
                res.status(404).json({error: error.message})
                return
            }
            
            //Si el usuario existe pero no fue confirmado
            if(!user.confirmed){
                //Decidimos mandar un token cuando intentan ingresar con una cuenta existente pero no confirmada
                
                //Generar el token
                const token = new Token()
                token.token = generateToken()
                token.user = user.id

                //Enviar email
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                })
                await token.save()
                res.send('Se volvió a enviar un mail para la confirmacion de cuenta')

                const error = new Error('La cuenta no ha sido confirmada')
                res.status(401).json({error: error.message})
                return
            }

            //Revisar password hasheado
            const isPasswordCorrect = await checkPassword(password, user.password)
            if(!isPasswordCorrect){
                const error = new Error('Contraseña incorrecta')
                res.status(401).json({error: error.message})
                return
            }

            res.send('Autenticado correctamente...')

        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

}