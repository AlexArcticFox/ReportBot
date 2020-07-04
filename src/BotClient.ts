import { Client, ClientOptions, User, Guild, GuildMember } from "discord.js";
import configTemplate from "~/Config";
import { IFunctionType } from "~/ConfigHandler";
import CommandHandler from "@command/CommandHandler";
import { Database } from "@utils/Database";

type configTemplate = typeof configTemplate;

export default class BotClient extends Client {
    readonly config: { [key in keyof configTemplate]: IFunctionType<configTemplate[key]> };
    readonly database?: Database;
    lastDmAuthor?: User;

    constructor(config: { [key in keyof configTemplate]: IFunctionType<configTemplate[key]> }, database?: Database, options?: ClientOptions) {
        super(options);
        this.config = config;
        this.database = database;
        this.once("ready", () => {
            new CommandHandler(this)
        });
    }

    isMod(member: GuildMember, _guild: Guild): boolean {
        let found = false;
        member.roles.cache.forEach((role) => {
            if (this.config.staff.includes(role.id)) {
                found = true;
            }
        })
        return found;
    }

    isAdmin(member: GuildMember): boolean {
        return member.hasPermission("ADMINISTRATOR");
    }

    isOwner(user: User): boolean {
        return this.config.owners.includes(user.id);
    }

    getPrefix(guild?: Guild): string {
        if (guild) {

        }
        return this.config.prefix;
    }
}
