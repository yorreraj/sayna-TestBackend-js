import BankCardModel, { BACK_CARD_FIELDS_PATTERN } from "../models/bankCard.model";

const bankcardValidator = async (req, res, next) => {
    const params = req.body;
    let error = false;
    Object.keys(BACK_CARD_FIELDS_PATTERN).forEach(field => {
        const pattern = BACK_CARD_FIELDS_PATTERN[field];
        if(!params[field])
            error = { code: 400, payload:{error:true, message:"Informations bancaire incorrectes"} }
        else if(!pattern.test(params[field]))
            error = { code: 409, payload:{error:true, message:"Une ou plusieurs données sont erronées"} }
    })

    if(error)
        return res.status(error.code).json(error.payload);
    
    const card = await BankCardModel.findOne({ card_number:params.card_number})
    if(card)
        return res.status(409).json({error:true, message:"La carte existe déjà"});
    
    next();
}

export default bankcardValidator;