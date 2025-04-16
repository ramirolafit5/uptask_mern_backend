import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUser extends Document {
    email: string,
    password: string,
    name: string,
    confirmed: boolean
}

export const UserSchema : Schema = new Schema({
    email: {
        type: String,
        require: true,
        lowercase: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        require: true,
        trim: true
    },
    name: {
        type: String,
        require: true,
        trim: true
    },
    confirmed: {
        type: Boolean,
        default: false, //se genera con un false hasta q el usuario confirme la acc
        trim: true
    }
}, {timestamps: true})

const User = mongoose.model<IUser>('User', UserSchema)
export default User