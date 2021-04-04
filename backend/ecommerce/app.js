const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
const logger = require('morgan');
const cors= require('cors');
const swaggerJSDoc= require('swagger-jsdoc');
const swaggerUI= require('swagger-ui-express');
const app = express();
app.use(bodyParser.json());

//import routes
const productRoute = require('./routes/product');
const usersRouter = require('./routes/users');
const authRouter=require('./routes/auth');
const orderRouter=require('./routes/orders');

app.use(cors({
    origin:'*',
    methods:['GET','POST','PATCH','DELETE','PUT'],
    allowedHeaders:'Content-type,Authorization,Origin,X-Reqeusted-with,Accept'

}));

const swaggerOptions={
    swaggerDefinition:{
        info:{
            title: "Shp API",
            description:"Backend Api",
            contact:{
              name: 'Lwazi is FullStack'
            },
            servers: "http://localhost:3000"

        }
    },
    apis:["app.js",".route/*.js"]
};

const swaggerDocs=swaggerJSDoc(swaggerOptions);

app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

//use Routes
app.use('/api/users', usersRouter)
app.use('/api/products', productRoute);
app.use('/api/orders', orderRouter);
app.use('/api/auth', authRouter);





app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



module.exports = app;
