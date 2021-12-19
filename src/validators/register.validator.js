import UserModel from "../models/user.model";
import { USER_FIELDS_PATTERN } from "../models/user.model";

const registerValidator = async (req, res, next) => {
    const params = req.body;

    let error = false;
    Object.keys(USER_FIELDS_PATTERN).forEach(field => {
        const pattern = USER_FIELDS_PATTERN[field];
        if(!params[field])
            error = { code: 400, payload:{error:true, message:"Une ou plusieurs données obligatoires sont manquantes"} }
        else if(!pattern.test(params[field]))
            error = { code: 409, payload:{error:true, message:"Une ou plusieurs données sont erronées"} }
    })

    if(error)
        return res.status(error.code).json(error.payload);
    
    const user = await UserModel.findOne({ email:params.email})
    if(user)
        return res.status(409).json({error:true, message:"Un compte utilisant cette adresse mail est déjà enregistré"});
    
    next();
}

export default registerValidator;