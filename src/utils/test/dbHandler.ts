import mongoose from 'mongoose'

export const connectDB = async () => {
  await mongoose.connect(process.env.DATABASE_URL as string)
}

export const clearDB = async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
}

export const closeDB = async () => {
  // Eliminar solo las colecciones sin usar dropDatabase
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
  await mongoose.connection.close()
}
