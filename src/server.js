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

//security middlware
app.use("/api", 
    expressJWT({ 
        secret: process.env.JWT_SECRET, 
        algorithms: ['HS256'],
        isRevoked: async(req, payload, done) => {
            const token = req.headers.authorization.split(' ')[1];
            const blacklistedToken = await TokenBlacklistModel.findOne({ token })
            req.token = token;

            return done(null, !!blacklistedToken);
        }
    }).unless({path:["/api/register", "/api/login"]})
)
app.use("/api", function(err, req, res, next) {
    if(err.name === 'UnauthorizedError') {
      return res.status(401).send({ "error": true, "message": "Votre token n'est pas correct" });
    }
    next();
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


