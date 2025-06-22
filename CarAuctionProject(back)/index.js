require('dotenv').config(); //importing dotenv to use environment variables

const express = require('express'); //importing express
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connection = require('./utils/db'); //importing database connection 
const authRouter = require('./routers/authRouter');
const app = express(); //creating an instance of express


app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({extended: true}));
app.use(express.static('public')); // Serve static files from 'public' folder



app.listen(process.env.PORT, () => {
    console.log("Listening...");    
});
app.get("/", (req, res) => {
    res.json({message: "Hello from the server!"});      
})


app.use('/api/auth', authRouter);




