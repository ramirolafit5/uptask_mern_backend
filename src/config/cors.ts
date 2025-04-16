import { CorsOptions } from "cors";


export const corsConfig: CorsOptions = {
    origin: function(origin, callback) {
        const whiteList = [process.env.FRONTEND_URL]

        //agregamos la parte de auth aca
        if(process.argv[2] === '--api'){
            whiteList.push(undefined)
        }


        //si la lista blanca incluye lo que queremos permitimos y sino dame error de CORS
        if(whiteList.includes(origin)){
            callback(null, true)
        } else {
            callback(new Error('Error de CORS'))
        }
    }
}