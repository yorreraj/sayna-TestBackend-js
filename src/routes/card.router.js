import express from "express";
import bankCardValidaror from "../validators/bankcard.validator";
import BankCardModel from "../models/bankCard.model";

const router = express.Router();

/**
 * @api {put} /user/cart Enregistrer les informations bancaire de l'utilisateur
 * @apiName AddCard
 * @apiGroup Card
 * 
 * @apiBody {String} card_number Numéro de la carte (On accepte que la carte VISA)
 * @apiBody {Number{1..12}} year Année d'expiration de la carte
 * @apiBody {Number{1..31}} month Mois d'expiration de la carte
 */
router.put("/user/cart", bankCardValidaror, async(req, res) => {
    let params = req.body
    params["user_id"] = req.user.id;

    await BankCardModel.create(params);
    
    return res.status(200).json({
        error:false,
        message:"Vos données ont été mises à jour"
    })
})

export default router;