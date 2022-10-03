import express from 'express';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import path from 'path';
import nunjucks from 'nunjucks';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

const app = express();

app.disable('x-powered-by');

dotenv.config();
const WEATHER_API_KEY = process.env.OPEN_WEATHER_API_KEY;
const dir = path.dirname(fileURLToPath(import.meta.url));

const normalUseApiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // Limits requests per hour !
    max: 30, // Global Limit of 30 requests per hour!
    standardHeaders: true,
    legacyHeaders: false,
    message: JSON.stringify({msg: 'Too many requests, please try again later.'}),
});

nunjucks.configure('templates',{
    autoescape: true,
    express: app
});

// Development Logging!
// app.use(function (req, res, next) {
//     console.log(`A request for ${req.path}, to my Weather app and the time is: `, new Date().toString());
//     next();
// });

// middleware for static resources
app.use(express.static('public',{index : "false"}));

// route for the root resource  
app.get('/', function (req, res) {
    res.sendFile(dir + '/public/weatherForm.html');
});

// route for producing the weather ui with weather data.
// apply the api limiter for calls to the weatherdata api !
app.post('/city', normalUseApiLimiter, express.json(), async function (req, res) {

    try {
        if(isNaN(parseFloat(req.body.latitude)) || isNaN(parseFloat(req.body.longitude)) 
        || req.body.latitude < -90 || req.body.latitude > 90 || req.body.longitude < -180 || req.body.longitude > 180){
            const error = {msg: 'Invalid Coordinates. Please try again!'};
            throw error;
        }
        
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${req.body.latitude.toString()}&lon=${req.body.longitude.toString()}&appid=${WEATHER_API_KEY}&units=imperial`);

        if (!response.ok) {
            console.log("error from openweathermap api!: Response", response);
            const data = { msg: `${response.status} ${response.statusText}: City was not found!` };
            throw data;
        }
        const data = await response.json();
        res.render('weatherUI.html', { dataX: data });
    }

    catch (error) {
        res.status(400).json(error);
    }
});

app.listen(process.env.PORT || 3000, function(){
    console.log(`Weather site server listening on IPV4: ${process.env.PORT || 3000}`);
});