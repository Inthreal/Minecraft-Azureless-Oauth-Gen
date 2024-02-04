import express, { Express } from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import { logger } from ".";

export const app: Express = express();

import { Callback } from "./routes/api/v1/callback";

export class Server {
    start() {
        app.use(helmet());

        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        app.use(new Callback().getRouter());

        app.listen(8080, () => {
            logger.log("Successfully started server on port 8080!");
        })
    }
}