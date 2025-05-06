import {Request, Response} from 'express'
import Note, { INote } from '../models/Note'
import { Types } from 'mongoose'

type NoteParams = {
    noteId: Types.ObjectId
}

export class NoteController {
    static createNote = async (req: Request<{},{},INote>, res: Response) => {
        try {
            const { content } = req.body
            const note = new Note(req.body)
            note.content = content
            note.createdBy = req.user.id
            note.task = req.task.id

            req.task.notes.push(note.id)

            await note.save()
            await req.task.save()

            res.send('Nota creada correctamente')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static getTaskNotes = async (req: Request, res: Response) => {
        try {
            const notes = await Note.find({task: req.task.id})
            res.json(notes)
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static deleteNote = async (req: Request<NoteParams>, res: Response) => {
        try {
            const {noteId} = req.params
            const note = await Note.findById(noteId)

            if (!note) {
                res.status(404).json({ message: "Nota no encontrada" });
                return;
            }

            if(note.createdBy.toString() !== req.user.id.toString()){
                res.status(404).json({ message: "Solo quien la creó puede borrar la nota" });
                return;
            }

            req.task.notes = req.task.notes.filter(note => note.toString() !== noteId.toString())

            await note.deleteOne()
            await req.task.save()
            res.send('Nota eliminada correctamente')

        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }
}