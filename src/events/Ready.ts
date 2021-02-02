import Event from "@event/Event";
import BotClient from "~/BotClient";

export default class Ready extends Event {
    public constructor() {
        super({ name: "ready" });
    }

    public async callback(client: BotClient): Promise<void> {
        console.log(`Logged in as ${client.user?.tag}`);
        client.user!.setActivity("reports", { type: "WATCHING" });
    }
}
