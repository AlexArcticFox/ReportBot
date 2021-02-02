import { Client, ClientOptions, User, Guild, GuildMember } from "discord.js";
import configTemplate from "~/Config";
import { IFunctionType } from "~/ConfigHandler";
import CommandHandler from "@command/CommandHandler";
import { Database } from "@database/Database";
import EventHandler from "@event/EventHandler";

type configTemplate = typeof configTemplate;

export default class BotClient extends Client {
    public readonly config: { [key in keyof configTemplate]: IFunctionType<configTemplate[key]> };
    public readonly database: Database;

    public constructor(config: { [key in keyof configTemplate]: IFunctionType<configTemplate[key]> }, database: Database, options?: ClientOptions) {
        super(options);
        this.config = config;
        this.database = database;
        new EventHandler(this);
        this.once("ready", async () => {
            new CommandHandler(this);
        });
    }

    public async isMod(member: GuildMember, guild: Guild): Promise<boolean> {
        if (this.isAdmin(member)) {
            return true;
        }

        const guildModel = await this.database?.guilds.findOne({ id: guild.id });
        if (!guildModel) {
            return false;
        }

        const moderators = guildModel.config.roles?.staff;
        if (!moderators) {
            return false;
        }

        if (moderators.length === 0) {
            return false;
        }

        let mod = false;
        moderators.forEach(id => {
            if (member.roles.cache.some(role => role.id === id)) {
                mod = true;
            }
        });

        return mod;
    }

    public isAdmin(member: GuildMember): boolean {
        return member.permissions.has("ADMINISTRATOR");

    }

    public isOwner(user: User): boolean {
        return this.config.owners.includes(user.id);
    }

    public async getPrefix(guild?: Guild): Promise<string> {
        if (guild) {
            const guildDb = await this.database!.guilds.findOne({ id: guild.id });
            if (!guildDb) {
                return this.config.prefix;
            }

            if (guildDb.config.prefix) {
                return guildDb.config.prefix;
            }
        }
        return this.config.prefix;
    }
}
