import { logger } from "..";

module.exports = (client) => {
    client.handleEvents = async (eventFiles: string[], path: string) => {
        for (const file of eventFiles) {
            const event = require(`../events/${file}`);
            if (event.once) {
                client.once(event.name, (...args: any) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args: any) => event.execute(...args, client));
            }
        }

        logger.log(`Successfully registered ${eventFiles.length} event${eventFiles.length > 1 ? "s" : ""}.`);
    }
}