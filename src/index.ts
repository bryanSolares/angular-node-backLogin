//import "reflect-metadata";
import * as express from "express";
import * as cors from "cors";
import * as helmet from "helmet";
import { createConnection } from "typeorm";
import routes from './routes';
const PORT = process.env.PORT || 3000;

createConnection().then(async () => {

    const app = express();

    // Middlewares
    app.use(cors());
    app.use(helmet());
    app.use(express.json());

    //Routes
    app.use("/", routes);

    app.listen(PORT, () => console.log('Server Running on port: ', PORT));


}).catch(error => console.log(error));
