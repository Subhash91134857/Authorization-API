const dotenv = require('dotenv');
dotenv.config()
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/connection');
const userRoutes=require('./routes/UserRoutes')


const DATABASE_URL = process.env.DATABASE_URL;
const app = express();
const port = process.env.PORT;

// CORS policy
app.use(cors())


// DATABSE
connectDB(DATABASE_URL);

// JSON
app.use(express.json());

// Load routes
app.use('/api/user',userRoutes)

app.listen(port, () => {
    console.log(`Server listening at https://localhost:${port}`)
})
