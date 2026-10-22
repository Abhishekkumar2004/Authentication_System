import nodemailer from "nodemailer"
import config from "../config/config.js"

const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
        type:"OAuth2",
        user:config.GOOGLE_USER,
        clientId:config.GOOGLE_CLIENT_ID,
        clientSecret:config.GOOGLE_CLIENT_SECRET,
        refreshToken:config.GOOGLE_REFRESH_TOKEN
    }
})

// Verfify the connection configuration
transporter.verify((error,success)=>{
    if(error){
        console.log("Error connecting to email server:", error)
    }
    else{
        console.log("Email server is ready to send message.");
    }
})

const sendEmail=async (to,subject,text,html)=>{
    try{
        const info=await transporter.sendMail({
            from:`"AuthenticationSystem" <${config.GOOGLE_USER}>`,
            to,
            subject,
            text,
            html
        })

        console.log(`Message sent: %s`,info.messageId);
    }
    catch(error){
        console.log(`Error sending email:`,error);
    }
}

export default sendEmail;