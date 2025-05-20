import { CorsOptions } from "cors";


export const corsConfig: CorsOptions = {
    origin: function (origin, callback) {
        const whiteList = [process.env.FRONTEND_URL];

        // Permitir llamadas sin 'origin' (como Supertest y Postman)
        if (!origin || process.argv[2] === '--api') {
        return callback(null, true);
        }

        if (whiteList.includes(origin)) {
        callback(null, true);
        } else {
        callback(new Error('Error de CORS'));
        }
    },
};
