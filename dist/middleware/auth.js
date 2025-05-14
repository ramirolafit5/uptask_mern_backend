"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const authenticate = async (req, res, next) => {
    const bearer = req.headers.authorization;
    if (!bearer) {
        const error = new Error('No autorizado');
        res.status(401).json({ error: error.message });
        return;
    }
    const token = bearer.split(' ')[1]; //esto es para obtener el jwt sin el "bearer"
    try {
        //antes usabamos el sign para crear y ahora el verify para verificar
        //aca usamos la misma con la q firmamos para verificar (process.env.JWT_SECRET)
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        //console.log(decoded)
        //hacemos esta validacion para q no tire error y nos permita ejecutar
        if (typeof decoded === 'object' && decoded.id) {
            const user = await User_1.default.findById(decoded.id).select('id name email');
            if (user) {
                req.user = user;
                next();
            }
            else {
                res.status(500).json({ error: 'Token no valido' });
            }
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Token no valido' });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.js.map