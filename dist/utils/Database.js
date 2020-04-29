"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
class Database {
    constructor(config) {
        this.config = config;
    }
    async connect() {
        const client = await mongodb_1.connect(this.config.url, this.config.MongoOptions)
            .catch(err => {
            throw err;
        });
        this.db = client.db(this.config.name);
        console.log("Connected to database");
    }
    get guilds() {
        return this.db.collection('guilds');
    }
}
exports.Database = Database;
//# sourceMappingURL=Database.js.map