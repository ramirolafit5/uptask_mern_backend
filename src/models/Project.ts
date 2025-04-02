import mongoose, { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { ITask } from "./Task";


export interface IProject extends Document {
    projectName: string,
    clientName: string,
    description: string,
    /* aca decimos que el proyecto tiene multiples tareas, como si fuera un join en una bdd relacional */
    tasks: PopulatedDoc<ITask & Document>[]
}

//tipo de dato de mongoose
const ProjectSchema: Schema = new Schema({
    projectName: {
        type: String,
        require: true,
        trim: true
    },
    clientName: {
        type: String,
        require: true,
        trim: true
    },
    description: {
        type: String,
        require: true,
        trim: true
    },
    tasks: [{
        type: Types.ObjectId,
        ref: 'Task'
    }]
}, {timestamps: true})

const Project = mongoose.model<IProject>('Project', ProjectSchema)
export default Project