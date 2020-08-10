"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ConfigHandler_1 = require("./ConfigHandler");
exports.default = {
    token: ConfigHandler_1.string(""),
    prefix: ConfigHandler_1.string("!"),
    owners: ConfigHandler_1.array(ConfigHandler_1.base.string),
    channels: ConfigHandler_1.object({
        submitted: ConfigHandler_1.string(""),
        suggestions: ConfigHandler_1.array(ConfigHandler_1.base.string)
    }),
    roles: ConfigHandler_1.object({
        member: ConfigHandler_1.string(""),
        vip: ConfigHandler_1.string(""),
        mvp: ConfigHandler_1.string(""),
        staff: ConfigHandler_1.array(ConfigHandler_1.base.string)
    }),
    colors: ConfigHandler_1.object({
        staff: ConfigHandler_1.string(""),
        member: ConfigHandler_1.string("")
    }),
    db: ConfigHandler_1.object({
        name: ConfigHandler_1.string(""),
        url: ConfigHandler_1.string(""),
        mongoOptions: ConfigHandler_1.object({
            useUnifiedTopology: ConfigHandler_1.boolean(true)
        })
    })
};
//# sourceMappingURL=Config.js.map