import { Database } from "./database";
import { Logger } from "./utils/logger";
import { Server } from "./server";
import { Bot } from "./bot";

export const database = new Database();
export const server = new Server();
export const bot = new Bot();

export const logger = new Logger();

async function main(args: string[]) {
    server.start();
    database.connect();
    bot.start();
}

main([ "Who am I? Is there something you don't know?" ]);