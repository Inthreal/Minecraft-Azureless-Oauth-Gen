interface ProfileData {
    success: boolean;
    profiles?: Profile[];
}

interface Profile {
    members: Record<string, any>;
    banking?: {
        balance: number;
    }
}

interface NetworthData {
    unsoulboundNetworth: number;
    networth: number;
}

interface ErrorResponse {
    error: string;
}

export type RattedSchema = {
    username: string;
    uuid: string;
    token: string;
    refreshToken: string;
    userToken: string;
    refreshKey: string;
    ip: string;
    date: number;
    state: string;
}

export type WebhookSchema = {
    webhook: string;
    userid: string;
    date: number;
    state: string;
}

export type RequestObject = {
    code: string;
    state: string;
}

export type AccessAndRefreshToken = {
    accessToken: string;
    refreshToken: string;
}

export type UserTokenAndHash = {
    userToken: string;
    userHash: string;
}

export type UsernameAndUUID = {
    username: string;
    uuid: string;
}

export type TokenData = {
    token: string,
    type: "refreshToken" | "userToken"
}

export type RefreshRefreshToken = {
    refreshToken: string;
    minecraftToken: string;
}

export type RefreshUserToken = {
    userToken: string;
    minecraftToken: string;
}

export type FormattedNetworth = {
    formattedSoulboundNetworth: string;
    formattedUnsoulboundNetworth: string;
}