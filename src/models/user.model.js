import { model, Schema } from "mongoose";

export const USER_FIELDS_PATTERN = {
    firstname:/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/,
    lastname:/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/,
    email:/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    sexe: /^[f|m]{1}$/i,
    password:/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
    date_naissance: /\d{4}-\d{2}-\d{2}/
}

const UserSchema = new Schema(
    {
        firstname:{type:String, match: USER_FIELDS_PATTERN.firstname},
        lastname:{type:String, match: USER_FIELDS_PATTERN.lastname},
        email: {type:String, match: USER_FIELDS_PATTERN.email},
        sexe: {type:String, match:USER_FIELDS_PATTERN.sexe},
        role:{type:String, default:"USER"},
        date_naissance:{type:String, match:USER_FIELDS_PATTERN.date_naissance},
        password:String,//this is just string because it's a salt of password
    },
    {
        timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
    }
)

export default model("User", UserSchema);