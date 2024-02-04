import axios, { AxiosResponse } from 'axios';
import config from '../../config.json';
import { getNetworth } from 'skyhelper-networth';
import { ProfileData, Profile, NetworthData, ErrorResponse } from '../types';

async function getProfileNetworth(uuid: string): Promise<NetworthData | ErrorResponse> {
    try {
        const response: AxiosResponse<ProfileData> = await axios.get(`https://api.hypixel.net/skyblock/profiles`, {
            params: {
                key: config.hypixel_api_key,
                uuid: uuid,
            },
            headers: {
                "Accept-Encoding": "gzip,deflate,compress",
            },
        });

        if (!response.data.success || !response.data.profiles) {
            return {
                unsoulboundNetworth: 0,
                networth: 0,
            }
        }

        let richestProfile: NetworthData | null = null;
        for (let i = 0; i < response.data.profiles.length; i++) {
            const profile: Profile = response.data.profiles[i];
            const profileNetworth: NetworthData = await getNetworth(profile.members[uuid], profile.banking?.balance);
            if (richestProfile === null || richestProfile.unsoulboundNetworth < profileNetworth.unsoulboundNetworth) {
                richestProfile = profileNetworth;
            }
        }

        return richestProfile!;
    } catch (error) {
        console.error(error);
        if (axios.isAxiosError(error)) {
            if (!error.response?.data.success && error.response?.data.cause === "Invalid API key") {
                return {
                    error: "INVALID API KEY",
                };
            }
        }

        return {
            unsoulboundNetworth: 0,
            networth: 0,
        }
    }
}

export default getProfileNetworth;
