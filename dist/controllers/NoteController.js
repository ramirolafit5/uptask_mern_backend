"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteController = void 0;
const Note_1 = __importDefault(require("../models/Note"));
class NoteController {
    static createNote = async (req, res) => {
        try {
            const { content } = req.body;
            const note = new Note_1.default(req.body);
            note.content = content;
            note.createdBy = req.user.id;
            note.task = req.task.id;
            req.task.notes.push(note.id);
            await note.save();
            await req.task.save();
            res.send('Nota creada correctamente');
        }
        catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    };
    static getTaskNotes = async (req, res) => {
        try {
            const notes = await Note_1.default.find({ task: req.task.id });
            res.json(notes);
        }
        catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    };
    static deleteNote = async (req, res) => {
        try {
            const { noteId } = req.params;
            const note = await Note_1.default.findById(noteId);
            if (!note) {
                res.status(404).json({ message: "Nota no encontrada" });
                return;
            }
            if (note.createdBy.toString() !== req.user.id.toString()) {
                res.status(404).json({ message: "Solo quien la creó puede borrar la nota" });
                return;
            }
            req.task.notes = req.task.notes.filter(note => note.toString() !== noteId.toString());
            await note.deleteOne();
            await req.task.save();
            res.send('Nota eliminada correctamente');
        }
        catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    };
}
exports.NoteController = NoteController;
//# sourceMappingURL=NoteController.js.map