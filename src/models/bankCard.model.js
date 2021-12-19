import { model, Schema } from "mongoose";

export const BACK_CARD_FIELDS_PATTERN = {
    //only visa card
    card_number: /^4[0-9]{12}(?:[0-9]{3})?$/,
    month:/\d{2}/,
    year:/\d{4}/
}

const BankCardSchema = new Schema(
    {
        card_number:{type:String, match: BACK_CARD_FIELDS_PATTERN.card_number},
        month:{type:String, match: BACK_CARD_FIELDS_PATTERN.month},
        year:{type:String, match: BACK_CARD_FIELDS_PATTERN.year},
        user_id: { type: 'ObjectId', ref: 'User' }
    },
    {
        timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
    }
)

export default model("BankCard", BankCardSchema);