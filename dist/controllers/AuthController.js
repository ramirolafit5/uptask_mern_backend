"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../utils/auth");
const Token_1 = __importDefault(require("../models/Token"));
const token_1 = require("../utils/token");
const AuthEmail_1 = require("../emails/AuthEmail");
const jwt_1 = require("../utils/jwt");
class AuthController {
    static createAccount = async (req, res) => {
        try {
            const { password, email } = req.body; //its not to be used all the time req.body...
            //Prevenir duplicados
            const userExist = await User_1.default.findOne({ email });
            if (userExist) {
                const error = new Error('El usuario ya esta registrado');
                res.status(409).json({ error: error.message });
                return;
            }
            const user = new User_1.default(req.body);
            //Hash Password (podriamos tener esto aca directamente en vez de crear el util)
            /* const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(password, salt) */
            user.password = await (0, auth_1.hashPassword)(password);
            //Generar el token
            const token = new Token_1.default();
            token.token = (0, token_1.generateToken)();
            token.user = user.id;
            //Enviar email
            AuthEmail_1.AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            });
            await user.save();
            await token.save();
            res.send('Cuenta creada, revisa tu email para confirmarla');
        }
        catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    };
    static confirmAccount = async (req, res) => {
        try {
            const { token } = req.body;
            //Verificar que exista el token
            const tokenExist = await Token_1.default.findOne({ token });
            if (!tokenExist) {
                const error = new Error('Token no valido');
                res.status(404).json({ error: error.message });
                return;
            }
            const user = await User_1.default.findById(tokenExist.user);
            user.confirmed = true;
            await user.save();
            await tokenExist.deleteOne();
            res.send('Perfil actualizado correctamente');
        }
        catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    };
    static login = async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User_1.default.findOne({ email }); //buscame al usuario por email
            //Si el usuario no existe
            if (!user) {
                const error = new Error('Usuario no encontrado');
                res.status(404).json({ error: error.message });
                return;
            }
            //Si el usuario existe pero no fue confirmado
            if (!user.confirmed) {
                //Decidimos mandar un token cuando intentan ingresar con una cuenta existente pero no confirmada
                //Generar el token
                const token = new Token_1.default();
                token.token = (0, token_1.generateToken)();
                token.user = user.id;
                await token.save();
                //Enviar email
                AuthEmail_1.AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                });
                const error = new Error('La cuenta no ha sido confirmada, hemos enviado un email de confirmacion');
                res.status(401).json({ error: error.message });
                return;
            }
            //Revisar password hasheado
            const isPasswordCorrect = await (0, auth_1.checkPassword)(password, user.password);
            if (!isPasswordCorrect) {
                const error = new Error('Contraseña incorrecta');
                res.status(401).json({ error: error.message });
                return;
            }
            //Aca generamos el JWT para la autenticacion (puse que expire en 1dia)
            const token = (0, jwt_1.generateJWT)({ id: user.id });
            res.send(token);
        }
        catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    };
    //reutilizamos el de createAccount con algunas modificaciones
    static requestConfirmationCode = async (req, res) => {
        try {
            const { email } = req.body; //its not to be used all the time req.body...
            //Usuario existe
            const user = await User_1.default.findOne({ email });
            if (!user) {
                const error = new Error('El usuario no esta registrado');
                res.status(404).json({ error: error.message });
                return;
            }
            if (user.confirmed) {
                const error = new Error('El usuario ya esta confirmado');
                res.status(403).json({ error: error.message });
                return;
            }
            //Generar el token
            const token = new Token_1.default();
            token.token = (0, token_1.generateToken)();
            token.user = user.id;
            //Enviar email
            AuthEmail_1.AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            });
            await user.save();
            await token.save();
            res.send('Se envió un nuevo token a tu email');
        }
        catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    };
    static forgotPassword = async (req, res) => {
        try {
            const { email } = req.body; //its not to be used all the time req.body...
            //Usuario existe
            const user = await User_1.default.findOne({ email });
            if (!user) {
                const error = new Error('El usuario no esta registrado');
                res.status(404).json({ error: error.message });
                return;
            }
            //Generar el token
            const token = new Token_1.default();
            token.token = (0, token_1.generateToken)();
            token.user = user.id;
            await token.save(); //solo dejamos esta linea, es la unica que nos interesa en este caso
            //Enviar email
            AuthEmail_1.AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            });
            res.send('Revisa tu email y sigue los pasos');
        }
        catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    };
    static validateToken = async (req, res) => {
        try {
            const { token } = req.body;
            //Verificar que exista el token
            const tokenExist = await Token_1.default.findOne({ token });
            if (!tokenExist) {
                const error = new Error('Token no valido');
                res.status(404).json({ error: error.message });
                return;
            }
            res.send('Token valido, define tu nueva clave');
        }
        catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    };
    static updatePasswordWithToken = async (req, res) => {
        try {
            //el token lo vamos a leer desde el parametro
            const { token } = req.params;
            //Verificar que exista el token
            const tokenExist = await Token_1.default.findOne({ token });
            if (!tokenExist) {
                const error = new Error('Token no valido');
                res.status(404).json({ error: error.message });
                return;
            }
            //Buscamos el usuario asociado al modelo del token para hashear la nueva clave
            const { password } = req.body;
            const user = await User_1.default.findById(tokenExist.user);
            user.password = await (0, auth_1.hashPassword)(password);
            await user.save();
            await tokenExist.deleteOne();
            res.send('La clave se modificó correctamente');
        }
        catch (error) {
            res.status(500).json({ error: 'Hubo un error' });
        }
    };
    /* solo muestra la informacion del usuario para que la url principal no muestre el sitio y quede
    cargando como si estuviera buscando proyectos del usuario, no hay autenticacion entonces no deberia
    poder verlo. */
    static user = async (req, res) => {
        try {
            res.json(req.user);
            return;
        }
        catch (error) {
            console.log(error);
        }
    };
    static updateProfile = async (req, res) => {
        const { name, email } = req.body;
        const userExist = await User_1.default.findOne({ email });
        if (userExist && userExist.id.toString() !== req.user.id.toString()) {
            const error = new Error('Ese email ya esta registrado');
            res.status(409).json({ error: error.message });
            return;
        }
        req.user.name = name;
        req.user.email = email;
        try {
            await req.user.save();
            res.send('Perfil actualizado correctamente');
        }
        catch (error) {
            res.status(500).send('Hubo un error');
        }
    };
    static updateCurrentUserPassword = async (req, res) => {
        const { current_password, password } = req.body;
        const user = await User_1.default.findById(req.user.id); //usuario logeado
        const isPasswordCorrect = await (0, auth_1.checkPassword)(current_password, user.password);
        if (!isPasswordCorrect) {
            const error = new Error('Password actual incorrecto');
            res.status(401).json({ error: error.message });
            return;
        }
        // Nueva verificación: comparar la nueva contraseña con la actual
        const isNewPasswordSameAsCurrent = await (0, auth_1.checkPassword)(password, user.password);
        if (isNewPasswordSameAsCurrent) {
            const error = new Error('La nueva contraseña no puede ser igual a la contraseña actual');
            res.status(400).json({ error: error.message }); // Usamos 400 Bad Request para indicar un error del cliente
            return;
        }
        try {
            user.password = await (0, auth_1.hashPassword)(password);
            await user.save();
            res.send('El password se modifico correctamente');
        }
        catch (error) {
            res.status(500).send('Hubo un error');
        }
    };
    static checkPassword = async (req, res) => {
        const { password } = req.body;
        const user = await User_1.default.findById(req.user.id); //usuario logeado
        const isPasswordCorrect = await (0, auth_1.checkPassword)(password, user.password);
        if (!isPasswordCorrect) {
            const error = new Error('Password incorrecto');
            res.status(401).json({ error: error.message });
            return;
        }
        res.send('Password correcto');
    };
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map