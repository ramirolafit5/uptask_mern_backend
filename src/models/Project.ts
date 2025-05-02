import mongoose, { Document, PopulatedDoc, Schema, Types } from "mongoose";
import { ITask } from "./Task";
import { IUser } from "./User";


export interface IProject extends Document {
    projectName: string,
    clientName: string,
    description: string,
    /* aca decimos que el proyecto tiene multiples tareas, como si fuera un join en una bdd relacional */
    tasks: PopulatedDoc<ITask & Document>[]
    /* y aca sin [] ya que solo hay un dueño del proyecto */
    manager: PopulatedDoc<IUser & Document>
    team: PopulatedDoc<IUser & Document>[]
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
    }],
    manager: {
        type: Types.ObjectId,
        ref: 'User'
    },
    team: [{
        type: Types.ObjectId,
        ref: 'User'
    }]
}, {timestamps: true})

const Project = mongoose.model<IProject>('Project', ProjectSchema)
export default Project