"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.default.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, unique: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false }
});
userSchema.pre("save", async function () {
    if (!this.isModified("password"))
        return;
    this.password = await bcryptjs_1.default.hash(this.password, 10);
});
userSchema.methods.comparePassword = function (password) {
    return bcryptjs_1.default.compare(password, this.password);
};
exports.default = mongoose_1.default.model("User", userSchema);
//# sourceMappingURL=User.js.map