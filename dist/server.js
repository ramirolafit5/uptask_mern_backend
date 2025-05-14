"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const AuthRoutes_1 = __importDefault(require("./routes/AuthRoutes"));
const ProjectRoutes_1 = __importDefault(require("./routes/ProjectRoutes"));
const cors_1 = require("./config/cors");
const cors_2 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
dotenv_1.default.config();
(0, db_1.connectDB)();
const app = (0, express_1.default)();
//Agregamos la configuracion de CORS
app.use((0, cors_2.default)(cors_1.corsConfig));
//Logging
app.use((0, morgan_1.default)('dev'));
//Esto es para que pueda leer valores de tipo json (por ejemplo cuando mandamos datos en el body de postman)
//Leer datos de formulario
app.use(express_1.default.json());
//Routes
app.use('/api/auth', AuthRoutes_1.default);
app.use('/api/projects', ProjectRoutes_1.default);
exports.default = app;
//# sourceMappingURL=server.js.map