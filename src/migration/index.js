import ShortUniqueId from "short-unique-id";
import SongModel from "../models/song.model";
import mongoose from "mongoose";

if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const SONGS = [
    {
        name:"Olivia Rodrigo - Drivers License",
        url:"https://youtu.be/ZmDBbnmKpqQ",
        cover:"https://i3.ytimg.com/vi/ZmDBbnmKpqQ/maxresdefault.jpg",
        time:260,
        type:"POP"
    },
    {
        name:"Silk Sonic - Leave the Door Open",
        url:"https://youtu.be/adLGHcj_fmA",
        cover:"https://i3.ytimg.com/vi/adLGHcj_fmA/maxresdefault.jpg",
        time:260,
        type:"POP"
    },
    {
        name:"The Weeknd & Ariana Grande - Save Your Tears",
        url:"https://youtu.be/LIIDh-qI9oI",
        cover:"https://i3.ytimg.com/vi/LIIDh-qI9oI/maxresdefault.jpg",
        time:260,
        type:"POP"
    },
    {
        name:"Dua Lipa feat. DaBaby - Levitating",
        url:"https://youtu.be/TUVcZfQe-Kw",
        cover:"https://i3.ytimg.com/vi/TUVcZfQe-Kw/maxresdefault.jpg",
        time:260,
        type:"POP"
    },
    {
        name:"Kali Uchis - Telepatía",
        url:"https://youtu.be/bn_p95HbHoQ",
        cover:"https://i3.ytimg.com/vi/bn_p95HbHoQ/maxresdefault.jpg",
        time:260,
        type:"POP"
    }
]

const run = () => {
    mongoose.connect(process.env.MONGO_URL).then(async () => {
        const uid = new ShortUniqueId({ length: 10 });
        let data = []
        SONGS.forEach(async song => {
            song.id = uid()
            data.push(song)        
        })  
        await SongModel.deleteMany();    
        await SongModel.insertMany(data);
        process.exit()
    })
}

run();