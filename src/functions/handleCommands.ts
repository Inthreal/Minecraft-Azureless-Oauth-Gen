import { Routes } from "discord-api-types/v9"; 
import { REST } from "@discordjs/rest";
import config from "../../config.json";
import fs from "fs";
import { logger } from "..";

const rest = new REST({ version: "9" }).setToken(config.discord_bot.bot_token);

module.exports = async (client: any) => {
    client.handleCommands = async (commandFolders: string, path: string) => {
        client.commandArray = [];

        const commandFiles = fs.readdirSync("./src/commands").filter(file => file.endsWith(".js"));

        for (const file of commandFiles) {
            const command = require(`../commands/${file}`);
            client.commands.set(command.data.name, command);
            client.commandArray.push(command.data.toJSON());
        }

        try {
            await rest.put(
                Routes.applicationCommands(config.discord_bot.client_id), {
                    body: client.commandArray
                }
            )

            logger.log(`Successfully registered ${client.commandArray.length} application command${client.commandArray.length > 1 ? "s" : ""}.`);
        } catch (error) {
            console.error(error);
        }
    }
}
