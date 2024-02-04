import { ActivityType } from "discord.js";

const { logger } = require("..");

const activities = [
    {
        name: "https://discord.quantiy.com",
        type: ActivityType.Playing
    },
    {
        name: "⚡ Powered by Quantiy ⚡",
        type: ActivityType.Playing
    }
]

export const name = "ready";
export const once = true;
export async function execute(client: any): Promise<void> {
    
    setInterval(() => {
        const activity = activities[Math.floor(Math.random() * activities.length)];
        client.user.setActivity(activity);
    }, 5000);
    
    logger.log(`Successfully in as ${client.user.tag}! Serving ${client.guilds.cache.size} guild${client.guilds.cache.size > 1 ? "s" : ""}.`);
}