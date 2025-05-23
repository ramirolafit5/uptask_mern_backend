import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './config/db'
import AuthRoutes from './routes/AuthRoutes'
import ProjectRoutes from './routes/ProjectRoutes'
import { corsConfig } from './config/cors'
import cors from 'cors'
import morgan from 'morgan'

dotenv.config()

if (process.argv[2] !== '--test') {
  connectDB()
}

const app = express()

//Agregamos la configuracion de CORS
app.use(cors(corsConfig))

//Logging
app.use(morgan('dev'))

//Esto es para que pueda leer valores de tipo json (por ejemplo cuando mandamos datos en el body de postman)
//Leer datos de formulario
app.use(express.json())

// Ruta simple para pruebas
app.get('/api', (req, res) => {
  res.json({ msg: 'Desde API' })
})

//Routes
app.use('/api/auth', AuthRoutes)
app.use('/api/projects', ProjectRoutes)


export default app