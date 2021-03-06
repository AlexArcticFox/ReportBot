import Command from "@command/Command";
import { Administration } from "~/Groups";
import CommandEvent from "@command/CommandEvent";
import { Guild } from "@models/Guild";
import { MessageEmbed } from "discord.js";
import { splitArguments } from "@utils/Utils";
import { DatabaseCheckOption, DisplayData } from "~/utils/Types";
import { Database } from "@database/Database";

export default class Config extends Command {
    public constructor() {
        super({ name: "Config", triggers: ["config", "cfg", "setup"], description: "Configures various settings for the guild", group: Administration });
    }

    public async run(event: CommandEvent): Promise<void> {
        const client = event.client;
        const database = client.database;

        const guild = await database.getGuild(event.guild.id);
        const [subcommand, option, args] = splitArguments(event.argument, 3);

        if (!subcommand) {
            await displayAllSettings(event, guild!);
            return;
        }

        switch (subcommand.toLowerCase()) {
            case "prefix": {
                await prefixSettings(event, option, args, guild!);
                break;
            }

            case "staff": {
                await moderatorSettings(event, option, args, guild!);
                break;
            }

            case "channel": {
                await reportSettings(event, option, args, guild!);
                break;
            }

            case "dump": {
                await dumpSettings(event, option, args, guild!);
                break;
            }
        }
    }
}

async function prefixSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const client = event.client;
    const database = client.database;

    if (!option) {
        await displayData(event, guild, "prefix", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "set": {
            if (args.length > 5) {
                await event.send("The prefix can be up to 5 characters.");
                break;
            }

            await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.prefix": args } });
            await event.send(`The prefix has been set to \`${args}\``);
            break;
        }

        case "reset": {
            await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.prefix": "" } });
            await event.send(`The prefix has been set to \`${client.config.prefix}\``);
            break;
        }
    }
}

async function moderatorSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;
    await databaseCheck(database, guild, "staff");

    if (!option) {
        await displayData(event, guild, "staff", true);
        return;
    }

    const staff = args;
    if (!staff) {
        await event.send("You need to specify a role.");
        return;
    }

    const role = event.guild.roles.cache.find(role => role.id === staff || role.name === staff || `<@&${role.id}>` === staff);
    if (!role) {
        await event.send("Couldn't find the role you're looking for.");
        return;
    }

    switch (option.toLowerCase()) {
        case "add": {
            if (guild.config.roles?.staff?.includes(role.id)) {
                await event.send("The specified role is already a staff role.");
                break;
            }

            await database.guilds.updateOne({ id: guild.id }, { "$push": { "config.roles.staff": role.id } });
            await event.send(`Added \`${role.name}\` as a staff role.`);
            break;
        }
        case "remove": {
            if (!guild.config.roles?.staff?.includes(role.id)) {
                await event.send("The specified role isn't a staff role.");
                break;
            }

            await database.guilds.updateOne({ id: guild.id }, { "$pull": { "config.roles.staff": role.id } });
            await event.send(`\`${role.name}\` is no longer a staff role.`);
            break;
        }
    }
}

async function reportSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;
    await databaseCheck(database, guild, "channels");

    if (!option) {
        await displayData(event, guild, "report", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "set": {
            const channel = event.guild.channels.cache.find(channel => channel.name === args || channel.id === args || `<#${channel.id}>` === args);
            if (!channel) {
                event.send("Couldn't find the channel you're looking for");
                return;
            }

            database.guilds.updateOne({ id: guild.id }, { "$set": { "config.channels.submitted": channel.id } });
            event.send(`Set <#${channel.id}> as the channel for receiving reports.`);
            break;
        }

        case "remove": {
            database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.submitted": "" } });
            event.send("Removed the reports channel");
            break;
        }
    }
}

async function dumpSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;
    await databaseCheck(database, guild, "channels");

    if (!option) {
        await displayData(event, guild, "dump", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "set": {
            const channel = event.guild.channels.cache.find(channel => channel.name === args || channel.id === args || `<#${channel.id}>` === args);
            if (!channel) {
                event.send("Couldn't find the channel you're looking for");
                return;
            }

            database.guilds.updateOne({ id: guild.id }, { "$set": { "config.channels.dump": channel.id } });
            event.send(`Set <#${channel.id}> as the channel for dumping.`);
            break;
        }

        case "remove": {
            database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.dump": "" } });
            event.send("Removed the dump channel");
            break;
        }
    }
}


async function displayAllSettings(event: CommandEvent, guild: Guild) {
    const embed = new MessageEmbed()
        .setTitle("The current settings for this server:")
        .addField("Prefix", await displayData(event, guild, "prefix"), true)
        .addField("Moderators", await displayData(event, guild, "staff"), true)
        .addField("Reports", await displayData(event, guild, "report"), true)
        .addField("Dump", await displayData(event, guild, "dump"), true)
        .setColor("#61e096")
        .setFooter(`Requested by ${event.author.tag}`, event.author.displayAvatarURL());

    await event.send({ embed: embed });
}

async function databaseCheck(database: Database, guild: Guild, option: DatabaseCheckOption): Promise<void> {
    switch (option.toLowerCase()) {
        case "roles": {
            if (!guild.config.roles) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles": {} } });
            }
            break;
        }

        case "staff": {
            if (!guild.config.roles) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles": { "staff": [] } } });
            } else if (!guild.config.roles!.staff) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles.staff": [] } });
            }
            break;
        }

        case "channels": {
            if (!guild.config.channels) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.channels": {} } });
            }
            break;
        }
    }
}

async function displayData(event: CommandEvent, guild: Guild, type: DisplayData, specific?: boolean): Promise<string | undefined> {
    const client = event.client;
    const database = client.database;
    if (!specific) {
        switch (type.toLowerCase()) {
            case "prefix": {
                return guild?.config.prefix ?? client.config.prefix;
            }

            case "staff": {
                const mods = guild?.config.roles?.staff;
                if (!mods || mods.length === 0) {
                    return "There is no moderator roles.";
                }

                let list = "";
                for (const mod of mods) {
                    const role = event.guild.roles.cache.get(mod);
                    if (!role) {
                        await database?.guilds.updateOne({ id: guild.id }, { "$pull": { "config.roles.moderator": mod } });
                    } else {
                        list += `${role.name}\n`;
                    }
                }

                return list;
            }

            case "report": {
                const id = guild.config.channels?.submitted;
                if (!id) {
                    return "Not set";
                }

                const channel = event.guild.channels.cache.get(id);
                if (!channel) {
                    await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.submitted": "" } });
                    return "Not set";
                }

                return `<#${channel.id}>`;
            }

            case "dump": {
                const id = guild.config.channels?.submitted;
                if (!id) {
                    return "Not set";
                }

                const channel = event.guild.channels.cache.get(id);
                if (!channel) {
                    await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.dump": "" } });
                    return "Not set";
                }

                return `<#${channel.id}>`;
            }
        }
    } else {
        switch (type.toLowerCase()) {
            case "prefix": {
                await event.send(`The prefix is currently set to \`${guild?.config.prefix ?? client.config.prefix}\``);
                break;
            }

            case "staff": {
                const mods = guild?.config.roles?.staff;
                if (!mods || mods.length === 0) {
                    await event.send("There is no moderator roles.");
                    return;
                }

                const embed = new MessageEmbed()
                    .setTitle("The following roles are moderator roles:")
                    .setColor("#61e096")
                    .setFooter(`Requested by ${event.author.tag}`, event.author.displayAvatarURL());

                let list = "";
                for (const mod of mods) {
                    const role = event.guild.roles.cache.get(mod);
                    if (!role) {
                        await database?.guilds.updateOne({ id: guild.id }, { "$pull": { "config.roles.moderator": mod } });
                    } else {
                        list += `${role.name}\n`;
                    }
                }

                embed.setDescription(list);
                await event.send({ embed: embed });
                break;
            }

            case "report": {
                const id = guild.config.channels?.submitted;
                if (!id) {
                    return "There is no channel for submitting reports.";
                }

                const channel = event.guild.channels.cache.get(id);
                if (!channel) {
                    await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.submitted": "" } });
                    return "The channel for submitting reports can't be found.";
                }

                return `The current channel for submitting reports is <#${channel.id}>`;
            }

            case "dump": {
                const id = guild.config.channels?.submitted;
                if (!id) {
                    return "There is no channel for dumping.";
                }

                const channel = event.guild.channels.cache.get(id);
                if (!channel) {
                    await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.dump": "" } });
                    return "The channel for dumping can't be found.";
                }

                return `The current channel for dumping is <#${channel.id}>`;
            }
        }
    }
    return;
}
