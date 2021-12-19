import { model, Schema } from "mongoose";

const TokenBlacklistSchema = new Schema(
    {
        token:String
    },
    {
        timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
    }
)

export default model("TokenBlacklist", TokenBlacklistSchema);