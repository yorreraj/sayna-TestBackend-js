import express from "express";
import BankCardModel from "../models/bankCard.model";
import SubscriptionModel from "../models/subscription.model";

const router = express.Router();

/**
 * @api {put} /subscription Enregistrer l'abonnement de l'utilisateur
 * @apiName SaveSubscription
 * @apiGroup Subscription
 * 
 * @apiBody {String} card_number Le numero de la carte
 * @apiBody {String} cvc Code de verification de la carte
 */
router.put("/subscription", async(req, res) => {
    const { card_number, cvc } = req.body;
    if(!card_number || !cvc)
        return res.status(400).json({error:true, message: "Une ou plusieurs données obligatoire sont manquantes"})

    //check card
    const card = await BankCardModel.findOne({ card_number })

    if(!card || card.user_id.toString() !== req.user.id)
        return res.status(402).json({error:true, message:"Echec du payement de l'offre"})
    
    const numberOfSubscriptions = await SubscriptionModel.count({ card_number });
    if(numberOfSubscriptions < 1){
        await SubscriptionModel.create({
            card_number,
            user_id: card.user_id,
            expiresIn: new Date().getTime() + (5*60*1000)
        })
        return res.status(200).json({
            error:false,
            message:"Votre période d'essai viens d'être activé - 5min"
        })
    }else{
        await SubscriptionModel.create({
            card_number,
            user_id: card.user_id,
            expiresIn: new Date().getTime() + (7*24*60*60*1000)
        })
        return res.status(200).json({
            error:false,
            message:"Votre abonnement a bien été mise à jour"
        })
    }
})

export default router;