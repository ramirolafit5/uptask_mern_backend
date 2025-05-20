import mongoose from "mongoose"
import { exit } from 'node:process'

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.DATABASE_URL as string)
    if (process.env.NODE_ENV !== 'test') { // Evitar logueo en pruebas
      console.log(`MongoDB Conectado en: ${connection.connection.host}:${connection.connection.port}`)
    }
  } catch (error) {
    console.log('Error al conectar a MongoDB')
    exit(1)
  }
}
