import {connect, Db, MongoClientOptions, Collection} from "mongodb";
import {Guild} from "@models/Guild";

interface DatabaseConfig {
    url: string;
    name: string;
    mongoOptions?: MongoClientOptions;
}

export class Database {
    public db!: Db;

    public constructor(protected config: DatabaseConfig) {
    }

    public async connect(): Promise<void> {
        const client = await connect(this.config.url, this.config.mongoOptions)
            .catch(err => {
                throw err;
            });
        this.db = client.db(this.config.name);
        console.log("Connected to database");
    }

    public get guilds(): Collection<Guild> {
        return this.db.collection("guilds");
    }
}
