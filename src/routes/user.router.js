import express from "express";
import jwt from "jsonwebtoken";
import registerValidator from "../validators/register.validator";
import UserModel from "../models/user.model";
import bcrypt from "bcrypt";
import { MAX_LOGIN_ATTEMPT, LOGIN_ATTEMPT_TIMEOUT, TOKEN_LIFE, REFRESH_TOKEN_LIFE } from "../config";
import userupdateValidator from "../validators/userupdate.validator";
import TokenBlacklistModel from "../models/tokenBlacklist.model";
import BankCardModel from "../models/bankCard.model";
import { ObjectId } from "mongodb";

const router = express.Router();

/**
 * @api {post} /api/register Créer un nouveau utilisateur
 * @apiName RegisterUser
 * @apiGroup User
 * 
 * @apiBody {String} firstname Le nom
 * @apiBody {String} lastname Le prénom
 * @apiBody {String} email L'adresse email
 * @apiBody {String="m","f"} sexe Le sexe de l'utilisateur
 * @apiBody {String{6..}} password mot de passe (contient des chiffres et des lettres)
 * @apiBody {String} date_naissance la date de naissance (format YYYY-MM-DD)
 *  
 */
router.post("/register", registerValidator, async (req, res) => {
    let params = req.body;
    params.password = await new Promise((resolve, reject) => {
        bcrypt.hash(params.password, 10, function(err, hash){
            if(err)
                reject(err)
            resolve(hash);
        })
    })

    const { firstname, lastname, email, sexe, role, date_naissance, createdAt, updatedAt } = await UserModel.create(req.body);
    return res.status(200).json({
        error:false,
        message:"L'utilisateur a bien été créé avec succés",
        user:{
            firstname,
            lastname,
            email,
            sexe,
            role,
            date_naissance,
            createdAt,
            updatedAt
        }
    })
})

/**
 * @api {post} /api/login Authentifier un utiisateur
 * @apiName Login
 * @apiGroup User
 * 
 * @apiBody {String} email L'adresse email
 * @apiBody {String} password Mot de passe
 */
router.post("/login", async(req, res) => {
    const {email, password} = req.body;
    //check params email and password
    if(!email || !password){
        return res.status(412).json({ error:true, message:"Email/password manquants" });
    }

    //check login attempts
    if(req.session.loginTimeout && (new Date().getTime() < req.session.loginTimeout))
        return res.status(429).json({ error:true, message:`Trop de tentative sur l'email ${email} (5 max) - Veuillez patienter (1min)` });
    
    //fetch user by mail
    const user = await UserModel.findOne({ email })
    //verify if user exist and compare password
    if(!user || !(await bcrypt.compare(password, user.password))){
        //increase the number of attempts
        req.session.loginAttempt = req.session.loginAttempt ? req.session.loginAttempt + 1 : 1;
        if(req.session.loginAttempt >= MAX_LOGIN_ATTEMPT){
            req.session.loginTimeout = new Date().getTime() + LOGIN_ATTEMPT_TIMEOUT;
            req.session.loginAttempt = 0
        }

        //revoke authentification
        return  res.status(412).json({ error:true, message:"Email/password incorrect" });
    }

    const payload = {
        id:user._id
    }
    //generate token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: TOKEN_LIFE });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: REFRESH_TOKEN_LIFE });

    return res.status(200).json({
        error:false,
        message:"L'utilisateur a été authentifié avec succès",
        user:{
            firstname:user.firstname,
            lastname:user.lastname,
            email:user.email,
            sexe:user.sexe,
            date_naissance:user.date_naissance,
            createdAt : user.createdAt,
            updatedAt : user.updatedAt
        },
        access_token:token,
        refresh_token:refreshToken
    })
})

/**
 * @api {put} /api/user Mettre à jour les informations de l'utilisateur
 * @apiName UpdateUser
 * @apiGroup User
 * 
 * @apiBody {String} [firstname] Le nom
 * @apiBody {String} [lastname] Le prénom
 * @apiBody {String="m","f"} [sexe] Le sexe de l'utilisateur
 * @apiBody {String} [date_naissance] la date de naissance (format YYYY-MM-DD)
 * 
 * 
 */
router.put("/user", userupdateValidator, async (req, res) => {
    await UserModel.updateOne({_id:ObjectId(req.user.id)}, { $set:req.body })
    res.status(200).json({
        error:false,
        message:"Vos données ont été mises à jour"
    })
})

/**
 * @api {delete} /api/user/off Deconnecter l'utilisateur
 * @apiName Logout
 * @apiGroup User
 */
router.delete("/user/off", async(req, res) => {
    await TokenBlacklistModel.create({
        token:req.token
    })
    res.status(200).json({
        error:false,
        message:"L'utilisateur a été déconnecté avec succès"
    })
})

/**
 * @api {delete} /api/user Supprimmer l'utilisateur
 * @apiName DeleteUser
 * @apiGroup User
 */
router.delete("/user", async(req, res) => {
    //delete card
    await BankCardModel.deleteOne({ user_id:ObjectId(req.user.id) })
    //delete user
    await UserModel.deleteOne({ _id:ObjectId(req.user.id) });
    //add current token to blacklist
    await TokenBlacklistModel.create({
        token:req.token
    })

    res.status(200).json({
        error:false,
        message: "Votre compte et le compte de vos enfants ont été supprimés avec succès"
    })
})


/**
 * @api {post} /api/refreshToken Générer un nouveau Token
 * @apiName RefreshToken
 * @apiGroup User
 * 
 * @apiBody {String} refreshToken Le token d'actualisation
 */
router.post("/refreshToken", (req, res) => {
    if(!req.body.refreshToken)
        return res.status(400).json({ error:true, message:"Le refresh token est obligatoire." });
    try{
        const { id } = jwt.verify(req.body.refreshToken, process.env.JWT_SECRET);

        return res.status(200).json({
            token:jwt.sign({id}, process.env.JWT_SECRET, { expiresIn: TOKEN_LIFE }),
            refreshToken:jwt.sign({id}, process.env.JWT_SECRET, { expiresIn: REFRESH_TOKEN_LIFE })
        })
    }catch(err){
        return res.status(401).json({ error:true, message:"Token invalid" });
    }
    
})

export default router;