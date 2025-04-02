import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './config/db'
import ProjectRoutes from './routes/ProjectRoutes'
import { corsConfig } from './config/cors'
import cors from 'cors'

dotenv.config()

connectDB()

const app = express()

//Agregamos la configuracion de CORS
app.use(cors(corsConfig))

//Esto es para que pueda leer valores de tipo json (por ejemplo cuando mandamos datos en el body de postman)
app.use(express.json())

//Routes
app.use('/api/projects', ProjectRoutes)

export default app