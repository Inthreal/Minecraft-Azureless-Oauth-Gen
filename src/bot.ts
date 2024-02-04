const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection } = require(`discord.js`);
import config from "../config.json";
import path from "path";
import fs from "fs";

export class Bot {
    private client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent
        ]
    })
    private commandFiles: string[];
    private eventFiles: string[];
    private functions: string[];

    constructor() {
        this.commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
        this.eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(file => file.endsWith('.js'));
        this.functions = fs.readdirSync(path.join(__dirname, 'functions')).filter(file => file.endsWith('.js'));
    }

    async start() {
        this.client.commands = new Collection();
    
        for (const file of this.functions) {
            require(`./functions/${file}`)(this.client);
        }
    
        this.client.handleCommands(this.commandFiles, './commands');
        this.client.handleEvents(this.eventFiles, './events');
    
        this.client.login(config.discord_bot.bot_token);
    }
}
