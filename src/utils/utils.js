import crypto from "crypto"

export function generateOtp() {
    return crypto.randomInt(100000, 1000000).toString();
}

export function getOtpHtml(otp) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>OTP Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; background-color: #f4f4f4; padding: 30px;">
            <div style="max-width: 500px; margin: auto; padding: 30px; background-color: white; border-radius: 10px;">
                <h2>OTP Verification</h2>
                <p>Use the following OTP to verify your account.</p>
                <h1 style="color: #2563eb; letter-spacing: 8px;">${otp}</h1>
                <p>This OTP is valid for 5 minutes.</p>
                <p>If you did not request this code, please ignore this email.</p>
            </div>
        </body>
        </html>
    `;
}