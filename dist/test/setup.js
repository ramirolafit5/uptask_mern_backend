"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let mongo;
beforeAll(async () => {
    mongo = await mongodb_memory_server_1.MongoMemoryServer.create();
    const mongoUri = mongo.getUri();
    await mongoose_1.default.connect(mongoUri);
});
beforeEach(async () => {
    const collections = await mongoose_1.default.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});
afterAll(async () => {
    await mongoose_1.default.connection.close();
    await mongo.stop();
});
//# sourceMappingURL=setup.js.map