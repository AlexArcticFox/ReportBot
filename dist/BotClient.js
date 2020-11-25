"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const CommandHandler_1 = __importDefault(require("./command/CommandHandler"));
const EventHandler_1 = require("./event/EventHandler");
const Guild_1 = require("./models/Guild");
class BotClient extends discord_js_1.Client {
    constructor(config, database, options) {
        super(options);
        this.config = config;
        this.database = database;
        this.once("ready", async () => {
            new CommandHandler_1.default(this);
            await EventHandler_1.EventHandler(this);
        });
    }
    async getGuildFromDatabase(database, id) {
        let guild = await database.guilds.findOne({ id: id });
        if (!guild) {
            const newGuild = new Guild_1.Guild({ id: id });
            await database.guilds.insertOne(newGuild);
            guild = await database.guilds.findOne({ id: id });
        }
        return guild;
    }
    async getMember(argument, guild) {
        if (!argument) {
            return;
        }
        const regex = argument.match(/^((?<username>.+?)#(?<discrim>\d{4})|<?@?!?(?<id>\d{16,18})>?)$/);
        if (regex && regex.groups) {
            if (regex.groups.username) {
                return (await guild.members.fetch({ query: regex.groups.username, limit: 1 })).first();
            }
            else if (regex.groups.id) {
                return guild.members.fetch(regex.groups.id);
            }
        }
        return (await guild.members.fetch({ query: argument, limit: 1 })).first();
    }
    async isMod(member, guild) {
        var _a, _b;
        if (this.isAdmin(member)) {
            return true;
        }
        const guildModel = await ((_a = this.database) === null || _a === void 0 ? void 0 : _a.guilds.findOne({ id: guild.id }));
        if (!guildModel) {
            return false;
        }
        const moderators = (_b = guildModel.config.roles) === null || _b === void 0 ? void 0 : _b.staff;
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
    isAdmin(member) {
        return member.permissions.has("ADMINISTRATOR");
    }
    isOwner(user) {
        return this.config.owners.includes(user.id);
    }
    async getPrefix(guild) {
        if (guild) {
            const guildDb = await this.database.guilds.findOne({ id: guild.id });
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
exports.default = BotClient;
//# sourceMappingURL=BotClient.js.map