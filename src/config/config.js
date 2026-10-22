import dotenv from 'dotenv';

dotenv.config();

if(!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in envirenment variables.');
}

if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET is not defined in envirenment variables.")
}

if(!process.env.GOOGLE_CLIENT_ID){
    throw new Error("Google client Id is not defined in envirenment variables.")
}

if(!process.env.GOOGLE_CLIENT_SECRET){
    throw new Error("Google client secret is not defined in envirenment variables.")
}

if(!process.env.GOOGLE_REFRESH_TOKEN){
    throw new Error("Google Refresh Token is not deifined in envirenment variables.")
}

if(!process.env.GOOGLE_USER){
    throw new Error("Google User is not defined in environment variables.");
}

const config={
    PORT: process.env.PORT,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET:process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID:process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET:process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN:process.env.GOOGLE_REFRESH_TOKEN,
    GOOGLE_USER:process.env.GOOGLE_USER
}

export default config;