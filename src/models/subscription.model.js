import { model, Schema } from "mongoose";

const SubscriptionSchema = new Schema(
    {
        card_number:String,
        expiresIn:Date,
        user_id: { type: 'ObjectId', ref: 'User' }
    },
    {
        timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
    }
)

export default model("Subscription", SubscriptionSchema);