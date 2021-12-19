import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import session from "express-session";
import expressJWT from "express-jwt";
import userRouter from "./routes/user.router";
import cardRouter from "./routes/card.router";
import songRouter from "./routes/song.router";
import subscriptionRouter from "./routes/subscription.router";
import TokenBlacklistModel from "./models/tokenBlacklist.model";
import path from "path";

if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const app = express();

app.use("/assets", express.static('build/apidoc/assets'));

//express session
app.use(session({
    secret: process.env.SESSION_SECRET,
    cookie: {}
}))

app.use(cors({
    allowedHeaders:['Content-Type', 'Authorization', 'XMLHttpRequest'],
    origin:'*',
    methods: ["GET", "PUT", "PATCH", "POST", "DELETE"]
}))

// parse requests of content-type - application/json
app.use(bodyParser.json())
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended:true }))

app.use("/api", expressJWT({ secret: process.env.JWT_SECRET, algorithms: ['HS256']}).unless({path:["/register", "/login"]}))
app.use("/api", async (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') 
        return res.status(401).json({ "error": true, "message": "Votre token n'est pas correct" });
    else if(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer'){
        const token = req.headers.authorization.split(' ')[1];
        const blacklistedToken = await TokenBlacklistModel.findOne({ token })
        if(blacklistedToken)
            return res.status(401).json({ "error": true, "message": "Votre token n'est pas correct" });
        req.token = token;
    }
    next()
});

//api routes definitions
app.use("/api", [userRouter, cardRouter, songRouter, subscriptionRouter])
//apidoc
app.get('/',function(req,res){
    return res.sendFile(path.join(__dirname+'/apidoc/index.html'));
});

mongoose.connect(process.env.MONGO_URL).then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`)
    })
})


