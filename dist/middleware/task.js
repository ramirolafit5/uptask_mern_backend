"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskExists = taskExists;
exports.taskBelongToProject = taskBelongToProject;
exports.hasAuthorization = hasAuthorization;
const Task_1 = __importDefault(require("../models/Task"));
async function taskExists(req, res, next) {
    try {
        const { taskId } = req.params;
        const task = await Task_1.default.findById(taskId);
        if (!task) {
            res.status(404).json({ message: "Tarea no encontrada" });
            return;
        }
        //aca es donde asignamos nuestro proyecto al request
        req.task = task;
        next();
    }
    catch (error) {
        res.status(500).json({ error: 'Hubo un error' });
    }
}
async function taskBelongToProject(req, res, next) {
    if (req.task.project.toString() !== req.project.id.toString()) {
        res.status(400).json({ message: "Accion no valida" });
        return;
    }
    next();
}
async function hasAuthorization(req, res, next) {
    if (req.user.id.toString() !== req.project.manager.toString()) {
        const error = new Error('Accion no valida');
        res.status(400).json({ error: error.message });
        return;
    }
    next();
}
//# sourceMappingURL=task.js.map