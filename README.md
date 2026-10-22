# Authentication System 🔐

A secure authentication REST API built with **Node.js, Express.js, and MongoDB**. This project implements user registration, email OTP verification, password hashing, JWT-based authentication, refresh-token management, and session-based logout functionality.

## 🚀 Features

- **User Registration** — Register users with a username, email, and password.
- **Password Security** — Hash passwords using bcrypt.
- **Email Verification** — Generate secure six-digit OTPs and send them using Nodemailer and Gmail OAuth2.
- **JWT Authentication** — Use short-lived access tokens for authenticated requests.
- **Refresh Tokens** — Refresh access tokens using HTTP-only cookies.
- **Session Management** — Store hashed refresh tokens and track user sessions in MongoDB.
- **Logout** — Revoke individual sessions or log out from all devices.
- **Protected User Profile** — Retrieve the currently authenticated user's information.
- **MongoDB Integration** — Store users, OTP records, and session data using Mongoose.
- **Environment Configuration** — Keep application configuration and credentials in environment variables.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| MongoDB | Database |
| Mongoose | MongoDB object modeling |
| bcrypt | Password hashing |
| JSON Web Token (JWT) | Token-based authentication |
| Nodemailer | Email delivery |
| Gmail OAuth2 | Email authentication |
| dotenv | Environment variable management |
| cookie-parser | Parse cookies |
| Morgan | HTTP request logging |

## 📁 Project Structure

```text
Authentication_System/
├── src/
│   ├── config/
│   │   ├── config.js
│   │   └── db.js
│   ├── controllers/
│   │   └── auth.controller.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── otp.model.js
│   │   └── session.model.js
│   ├── routes/
│   │   └── auth.routes.js
│   ├── services/
│   │   └── email.service.js
│   ├── utils/
│   │   └── utils.js
│   └── app.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
├── Architecture.png
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Abhishekkumar2004/Authentication_System.git
cd Authentication_System
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=5000

MONGODB_URI=mongodb://127.0.0.1:27017/authentication

JWT_SECRET=your_jwt_secret

GOOGLE_USER=your-email@gmail.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
```

Replace the example values with your actual configuration.

**Important:** Match the JWT variable names to those required by your current `config.js`. If you configure separate access-token and refresh-token secrets, use `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` consistently throughout the application.

Never commit your actual `.env` file or expose credentials in your source code.

### 4. Start MongoDB

Make sure your local MongoDB server is running, or configure `MONGODB_URI` to use a MongoDB deployment.

### 5. Start the server

Run your application:

```bash
node server.js
```

If your `package.json` defines a development script, you can also use:

```bash
npm run dev
```

The server will listen on the configured port, and the API base URL will typically be:

```text
http://localhost:5000
```

## 📡 API Endpoints

All authentication endpoints use the `/api/auth` prefix.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in a user |
| GET | `/api/auth/get-me` | Get the authenticated user's profile |
| GET or POST* | `/api/auth/refresh-token` | Refresh the access token |
| GET or POST* | `/api/auth/logout` | Log out of the current session |
| GET or POST* | `/api/auth/logout-all` | Log out from all sessions |
| GET or POST* | `/api/auth/verify-email` | Verify an email using an OTP |

\*Use the HTTP methods actually configured in `auth.routes.js`. POST is recommended for state-changing operations such as refreshing tokens, logging out, and submitting OTPs.

### Registration

**Endpoint:** `POST /api/auth/register`

Example request:

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "YourStrongPassword123!"
}
```

Creates a user account and sends an email verification OTP.

### Email Verification

**Endpoint:** `POST /api/auth/verify-email`

Example request:

```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

Submit the actual OTP received by email. The example code above is only illustrative.

### Login

**Endpoint:** `POST /api/auth/login`

Example request:

```json
{
  "email": "john@example.com",
  "password": "YourStrongPassword123!"
}
```

After successful authentication, the API returns an access token and sets a refresh-token cookie, according to the implemented controller.

### Get Current User

**Endpoint:** `GET /api/auth/get-me`

Include the access token in the request header:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Returns information about the authenticated user.

### Refresh Access Token

**Endpoint:** `/api/auth/refresh-token`

Uses the refresh-token cookie to request a new access token. The cookie must be sent with the request.

### Logout

**Endpoint:** `/api/auth/logout`

Revokes the current session and clears the refresh-token cookie.

### Logout From All Devices

**Endpoint:** `/api/auth/logout-all`

Revokes active sessions associated with the authenticated user, subject to the server's session-validation logic.

## 🔒 Security Considerations

- Hash passwords before saving them to the database.
- Store hashes of OTPs and refresh tokens rather than their plaintext values.
- Enforce OTP expiration and limit verification attempts.
- Keep access tokens short-lived.
- Validate refresh tokens against active server-side sessions.
- Use HTTP-only, Secure cookies with an appropriate SameSite policy.
- Keep secrets in environment variables.
- Add rate limiting and input validation before deploying publicly.
- Use HTTPS in production.
- Never expose passwords, tokens, or sensitive credentials in API responses or logs.

## 🧪 Testing

You can test the API using Postman, Insomnia, or another HTTP client.

Recommended test cases:

- Successful and duplicate user registration.
- Correct and incorrect OTP verification.
- Expired OTP rejection.
- Successful and failed login.
- Access to protected routes with valid and invalid tokens.
- Refresh-token expiration and revocation.
- Logout from one session and from all sessions.

## 🗺️ Architecture

See [`Architecture.png`](./Architecture.png) for the project's architecture diagram, if included in the repository.

## 👨‍💻 Author

**Abhishek Kumar**

GitHub: [@Abhishekkumar2004](https://github.com/Abhishekkumar2004)

