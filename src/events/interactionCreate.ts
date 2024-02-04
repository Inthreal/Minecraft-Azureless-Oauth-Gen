import { logger } from "..";
import config from "../../config.json";

export const name = "interactionCreate";
export async function execute(interaction: any, client: any): Promise<void> {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
            logger.error(`Command ${interaction.commandName} not found!`);
            return;
        }
        
        command.execute(interaction, client)
        .catch((error: any) => {
            console.error(error);
            interaction.editReply({ content: "There was an error while executing this command!", ephemeral: true });
        })
    }

    if (interaction.isButton()) {
        if (interaction.customId.startsWith("copy-url-")) {
            const state = interaction.customId.split("copy-url-")[2];

            await interaction.reply({ 
                content: `https://login.live.com/oauth20_authorize.srf?client_id=${config.azure.client_id}&response_type=code&redirect_uri=${config.azure.redirect_uri}&scope=XboxLive.signin+offline_access&state=${state}`,
                ephemeral: true 
            })
        }
    }
}