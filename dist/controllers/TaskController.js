"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const Task_1 = __importDefault(require("../models/Task"));
class TaskController {
    static createTask = async (req, res) => {
        try {
            const task = new Task_1.default(req.body);
            task.project = req.project.id;
            req.project.tasks.push(task.id);
            await task.save();
            await req.project.save();
            //Podriamos hacer esto en vez de hacer el doble await --> await Promise.allSettled([task.save(), req.project.save()])
            res.send('Tarea creada correctamente');
        }
        catch (error) {
            console.log(error);
        }
    };
    static getProjectTasks = async (req, res) => {
        try {
            //el populate que hacemos aca es para que nos muestre la demas informacion del proyecto ademas del id
            const tasks = await Task_1.default.find({ project: req.project.id }).populate('project');
            res.json(tasks);
        }
        catch (error) {
            console.log(error);
        }
    };
    static getTaskById = async (req, res) => {
        try {
            const task = await Task_1.default.findById(req.task.id)
                .populate({ path: 'completedBy.user', select: 'id name email' }) //si aca no ponia todo me tiraba error, luego chequear eso
                //Esto se agrego luego de que se crearan las notas
                .populate({ path: 'notes', populate: { path: 'createdBy', select: 'id name email' } });
            res.json(task);
        }
        catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    };
    static updateTask = async (req, res) => {
        try {
            req.task.name = req.body.name;
            req.task.description = req.body.description;
            await req.task.save();
            res.send('Task actualizada correctamente');
        }
        catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    };
    static deleteTask = async (req, res) => {
        try {
            //filtramos y nos quedamos con todas las task distintas a la que pasaron por parametro
            req.project.tasks = req.project.tasks.filter(task => task.toString() !== req.task.id.toString());
            await req.task.deleteOne();
            await req.project.save();
            res.send('Task eliminada correctamente');
        }
        catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    };
    static changeStatus = async (req, res) => {
        try {
            //ya creamos el middleware entonces llamamos a task con req.task y queda el codigo limpio
            const { status } = req.body;
            req.task.status = status;
            const data = {
                user: req.user.id,
                status
            };
            req.task.completedBy.push(data);
            await req.task.save();
            res.send('Tarea Actualizada');
        }
        catch (error) {
            console.log(error);
        }
    };
}
exports.TaskController = TaskController;
//# sourceMappingURL=TaskController.js.map