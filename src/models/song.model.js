import { model, Schema } from "mongoose";

const SongSchema = new Schema(
    {
        id:String,
        name:String,
        url:String,
        cover:String,
        time:Number,
        type:String
    },
    {
        timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
    }
)

export default model("Song", SongSchema);