import Command from "@command/Command";
import { Moderation } from "~/Groups";
import CommandEvent from "@command/CommandEvent";
import { splitArguments } from "@utils/Utils";

export default class Role extends Command {
    constructor() {
        super({ name: "Role", triggers: ["role"], description: "Gives or takes a specified role from a specified user", group: Moderation });
    }

    async run(event: CommandEvent) {
        const client = event.client;
        const database = client.database;
        try {
            const guild = await client.getGuildFromDatabase(database!, event.guild.id);
            const [subcommand, id, rolename] = splitArguments(event.argument, 3);
            const member = await client.getMember(id, event.guild);

            if (!member) {
                event.send("Couldn't find the user you're looking for");
                return;
            }

            const message = event.message;
            const channel = event.channel;

            if (rolename.toLowerCase() !== "vip" && rolename.toLowerCase() !== "mvp") {
                channel.send("Role name can only be VIP or MVP")
                    .then((msg) => {
                        setTimeout(() => { msg.delete() }, 5000);
                    })
                message.delete();
                return;
            }

            let role;
            switch (rolename.toLowerCase()) {
                case "vip": {
                    role = event.guild.roles.cache.find(role => role.id === guild?.config.roles?.vip);
                    break;
                }
                case "mvp": {
                    role = event.guild.roles.cache.find(role => role.id === guild?.config.roles!.mvp);
                    break;
                }
            }

            if (!role) {
                event.send("Couldn't find the role you're looking for");
                return;
            }

            switch (subcommand.toLowerCase()) {
                case "add": {
                    member.roles.add(role);
                    event.send(`Added ${role?.name} to ${member.user.tag}`);
                    break;
                }
                case "remove": {
                    member.roles.remove(role);
                    event.send(`Removed ${role?.name} from ${member.user.tag}`);
                    break;
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    }
}