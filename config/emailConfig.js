const dotenv = require('dotenv')
dotenv.config()

const nodemailer = require('nodemailer')


module.exports = transporter = nodemailer.createTransport({
  service:'gmail',
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
    auth: {
        user: "Subhashpanday58@gmail.com",   // Admin email 
        pass:"Subhash@123",    // admin email pass
  },
});