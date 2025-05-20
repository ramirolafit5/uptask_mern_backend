"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../server"));
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = require("../config/db");
jest.setTimeout(30000); // Aumentamos el timeout a 30 segundos
beforeAll(async () => {
    await (0, db_1.connectDB)();
});
afterAll(async () => {
    await mongoose_1.default.connection.close();
});
describe('Rutas de API', () => {
    test('Debería responder a la ruta de autenticación', async () => {
        try {
            const res = await (0, supertest_1.default)(server_1.default).get('/api/auth');
            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toMatch(/json/);
        }
        catch (error) {
            console.error('Error en la prueba:', error);
            throw error;
        }
    });
});
//# sourceMappingURL=server.test.js.map