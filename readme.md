# Node.js Authentication API

A secure authentication backend built with **Node.js, Express and MongoDB**. It supports email OTP verification, JWT access tokens, refresh token rotation, and multi-device session management.

## Features

- User registration with hashed passwords (bcrypt)
- Email verification using a 6-digit OTP sent through Gmail (OAuth2)
- OTP stored as a SHA-256 hash and auto-deleted after 5 minutes (MongoDB TTL index)
- Login with short-lived access token (15 minutes)
- Refresh token stored in an `httpOnly`, `secure`, `sameSite=strict` cookie (7 days)
- Refresh token rotation: a new refresh token is issued on every refresh
- Refresh tokens stored as SHA-256 hashes in the database
- Session tracking (IP address and user agent per session)
- Logout from the current device or from all devices

## Tech Stack

| Purpose | Package |
| --- | --- |
| Server | Express |
| Database | MongoDB with Mongoose |
| Password hashing | bcrypt |
| Tokens | jsonwebtoken |
| Email | Nodemailer (Gmail OAuth2) |
| Cookies | cookie-parser |
| Secure OTP generation | Node.js `crypto` |

## Project Structure

```
src/
├── config/
│   └── config.js            # Environment variables
├── controllers/
│   └── auth.controller.js   # register, logIn, getMe, refreshToken, logout, logoutAll, verifyEmail
├── models/
│   ├── user.model.js
│   ├── session.model.js
│   └── otp.model.js
├── services/
│   └── email.service.js     # Nodemailer + Gmail OAuth2
└── utils/
    └── utils.js             # generateOtp, getOtpHtml
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- A MongoDB database (local or MongoDB Atlas)
- A Google Cloud project with OAuth2 credentials and a Gmail refresh token

### Installation

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret

GOOGLE_USER=your_email@gmail.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
```

> Never commit your `.env` file. Add it to `.gitignore`.

### Run the Server

```bash
npm run dev     # development
npm start       # production
```

## API Endpoints

Base path is assumed to be `/api/auth`. Adjust it to match your routes.

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| POST | `/register` | Create an account and send an OTP by email | No |
| POST | `/verify-email` | Verify email with the OTP | No |
| POST | `/login` | Log in and receive tokens | No |
| GET | `/get-me` | Get the current user | Bearer access token |
| GET | `/refresh-token` | Get a new access token and rotate the refresh token | Refresh cookie |
| GET | `/logout` | Log out from the current device | Refresh cookie |
| GET | `/logout-all` | Log out from all devices | Refresh cookie |

### Request and Response Examples

**Register**

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john",
  "email": "john@example.com",
  "password": "StrongPassword123"
}
```

**Verify email**

```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Login**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "StrongPassword123"
}
```

Response:

```json
{
  "message": "User Logged in successfully.",
  "user": { "username": "john", "email": "john@example.com" },
  "accessToken": "<jwt>"
}
```

The refresh token is set automatically as an `httpOnly` cookie named `refreshToken`.

**Authenticated request**

```http
GET /api/auth/get-me
Authorization: Bearer <accessToken>
```

## Authentication Flow

1. The user registers, and an OTP is emailed.
2. The user verifies the OTP, and the account is marked verified.
3. The user logs in. The server creates a session, returns an access token in the response body, and sets the refresh token as a cookie.
4. When the access token expires, the client calls the refresh endpoint. The server checks the refresh token hash against the session, issues a new access token, and rotates the refresh token.
5. On logout, the session is marked as revoked. Logout-all revokes every active session for the user.

## Security Notes

- Passwords are hashed with bcrypt (10 salt rounds).
- OTPs are generated with `crypto.randomInt` and stored only as SHA-256 hashes.
- Refresh tokens are stored only as SHA-256 hashes, so a database leak does not expose usable tokens.
- Cookies use `httpOnly`, `secure` and `sameSite=strict`. Because `secure` is enabled, cookies are only sent over HTTPS (browsers make an exception for `localhost`).
- Recommended additions for production: rate limiting (for example `express-rate-limit`) on login and OTP verification, a "resend OTP" endpoint, and `helmet` for security headers.

## Roadmap

- [ ] Resend OTP endpoint
- [ ] Rate limiting on login and verify-email
- [ ] Forgot and reset password
- [ ] List and revoke individual sessions

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

