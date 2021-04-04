const mySqli=require('mysqli');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

let conn= new mySqli({
   host:'localhost',
   post:3306,
   user:'root',
   passwd:'',
   db:'mega_shop'

});

let db=conn.emit(false,'');
const secret = "1SBz93MsqTs7KgwARcB0I0ihpILIjk3w";
module.exports={
    database:db,
    secret : secret,
    validJWTNeeded: (req,res,next)=>{
      if(req.headers['uathorization']){
        try{
          let authorization = req.headers['uathorization'].split(' ');
          if(authorization[0]!=='Bearer')
          {
            return res.status(401).send();
          }else{
            req.jwt= jwt.verify(authorization[1], secret);
            return next();
          }

        }catch(e){
          return res.status(403).send("Authentication Fails");
        }
      }else{
        return res.status(401).send("No authorization header found");
      }
    },
    hasAuthFileds: (req, res, next)=>{
      let errors = [];

       if (req.body) {
           if (!req.body.email) {
               errors.push('Missing email field');
           }
           if (!req.body.password) {
               errors.push('Missing password field');
           }

           if (errors.length) {
               return res.status(400).send({errors: errors.join(',')});
           } else {
               return next();
           }
       } else {
           return res.status(400).send({errors: 'Missing email and password fields'});
       }
    },
    isPasswordAndUserMatch: async(req,res,next)=>{
         const myPlaintextPassword=req.body.password;
         const myEmail= req.body.email;

         const user= await db.table('users').filter({$or:[{email: myEmail},{username:myEmail}]}).get();

         if(user){
           const match= await bcrypt.compare(myPlaintextPassword, user.password);
             if(match){
                req.username=user.username;
                req.email=user.email;
                console.log("Im in this isPasswordAndUserMatch function")
                next();
             }else{
               res.status(401).send("username or password incorrect");
             }
         }else{
              res.status(401).send("username or password incorrect");
         }


    }

};
