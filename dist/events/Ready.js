"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Event_1 = __importDefault(require("../event/Event"));
class Ready extends Event_1.default {
    constructor() {
        super({ name: "ready" });
    }
    async callback(client) {
        var _a;
        console.log(`Logged in as ${(_a = client.user) === null || _a === void 0 ? void 0 : _a.tag}`);
        client.user.setActivity("reports", { type: "WATCHING" });
    }
}
exports.default = Ready;
//# sourceMappingURL=Ready.js.map