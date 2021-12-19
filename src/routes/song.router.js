import { ObjectId } from "bson";
import express from "express";
import SubscriptionModel from "../models/subscription.model";
import SongModel from "../models/song.model";

const router = express.Router();

/**
 * @api {get} /songs/:id? Recuperer les musiques
 * @apiName GetSongs
 * @apiGroup Song
 * 
 * @apiParam {String} [id] L'identifiant de la musique
 */
router.get("/songs/:id*?", async(req, res) => {
    //check subsctiption
    let subscriptions = await SubscriptionModel.find({user_id: ObjectId(req.user.id)}).sort({_id:-1})
    if(subscriptions.length > 0){
        let lastSubscription = subscriptions[0],
            expiresIn = new Date(lastSubscription.expiresIn).getTime();

        if(expiresIn < new Date().getTime())
            return res.status(403).json({
                error:true,
                message:"Votre abonnement ne permet pas d'accéder à la ressource"
            });
        
        if(req.params.id){
            let song = await SongModel.findOne({id:req.params.id});
            if(song){
                song = {
                    id:song.id,
                    name:song.name,
                    url:song.url,
                    cover:song.cover,
                    time:song.time,
                    type:song.type
                }
            }
            return res.status(200).json({ error:false, songs:song })
        }else{
            let songs = (await SongModel.find()).map( ({id,name,url,cover,time,type}) => ({id,name,url,cover,time,type}))
            return res.status(200).json({ error:false, songs })
        }
    }else{
        return res.status(403).json({
            error:true,
            message:"Votre abonnement ne permet pas d'accéder à la ressource"
        });
    }
})

export default router;