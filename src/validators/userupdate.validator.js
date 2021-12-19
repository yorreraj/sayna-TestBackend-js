import { USER_FIELDS_PATTERN } from "../models/user.model"

const userupdateValidator = (req, res, next) => {
    const params = req.body;
    let error = false;

    Object.keys(params).forEach(field => {
        if(USER_FIELDS_PATTERN[field] && !USER_FIELDS_PATTERN[field].test(params[field]))
            error = {
                code: 409,
                payload:{
                    error:true,
                    message:"Une ou plusieurs données sont erronées"
                }
            }
    })

    if(error)
        return res.status(error.code).json(error.payload);
    
    next();
}

export default userupdateValidator;