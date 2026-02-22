// require('dotenv').config();
// const express = require('express');
// const nodemailer = require('nodemailer');
// const crypto = require('crypto');
// const jwt = require('jsonwebtoken');

// const app = express();
// app.use(express.json());

// // Create a transporter for sending emails
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   secure: false, // true for 465, false for other ports
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // In-memory storage for tokens (use a database in production)
// const tokens = {};

// // Endpoint to send magic link
// app.post('/send-magic-link', (req, res) => {
//   const { email } = req.body;

//   // Generate a unique token
//   const token = crypto.randomBytes(20).toString('hex');

//   // Store token with expiration (e.g., 15 minutes)
//   tokens[token] = { email, expires: Date.now() + 15 * 60 * 1000 };

//   // Generate a JWT for secure verification
//   const jwtToken = jwt.sign({ email, token }, process.env.JWT_SECRET, {
//     expiresIn: '15m',
//   });

//   // Create the magic link
//   const magicLink = `http://localhost:${process.env.PORT}/verify?token=${jwtToken}`;

//   // Send email with magic link
//   transporter.sendMail(
//     {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: 'Your Magic Link',
//       text: `Click the link to login: ${magicLink}`,
//     },
//     (err, info) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).send('Error sending email');
//       }
//       res.send('Magic link sent');
//     }
//   );
// });

// // Endpoint to verify the magic link
// app.get('/verify', (req, res) => {
//   const { token } = req.query;

//   try {
//     // Verify the JWT
//     const { email, token: magicToken } = jwt.verify(token, process.env.JWT_SECRET);

//     // Check if the token exists and is not expired
//     const storedToken = tokens[magicToken];
//     if (!storedToken || storedToken.expires < Date.now()) {
//       return res.status(400).send('Invalid or expired token');
//     }

//     // Successful verification
//     delete tokens[magicToken]; // Remove token after use
//     res.send(`Hello ${email}, you are now logged in!`);
//   } catch (error) {
//     console.error(error);
//     res.status(400).send('Invalid token');
//   }
// });

// app.listen(process.env.PORT, () => {
//   console.log(`Server running on http://localhost:${process.env.PORT}`);
// });





require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// In-memory storage for tokens (use a database in production)
const tokens = {};

// Endpoint to send magic link
app.post('/send-magic-link', (req, res) => {
  console.log("req.body = ",req.body.email);
  const { email } = req.body;

  // Generate a unique token
  const token = crypto.randomBytes(20).toString('hex');

  // Store token with expiration (e.g., 15 minutes)
  tokens[token] = { email, expires: Date.now() + 15 * 60 * 1000 };

  // Create the magic link
  //const magicLink = `http://localhost:${process.env.PORT}/verify?token=${token}`;
  const magicLink = `https://recipe-generator-server.vercel.app/verify?token=${token}`;

  // Send email with magic link
  transporter.sendMail(
    {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Magic Link',
      text: `Click the link to login: ${magicLink}`,
    },
    (err, info) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error sending email');
      }
      res.send('Magic link sent');
    }
  );
});

// Endpoint to verify the magic link
app.get('/verify', (req, res) => {
  const { token } = req.query;

  // Check if the token exists and is not expired
  const storedToken = tokens[token];
  if (!storedToken || storedToken.expires < Date.now()) {
    return res.status(400).send('Invalid or expired token');
  }

  // Successful verification
  delete tokens[token]; // Remove token after use
  res.send(`Hello ${storedToken.email}, you are now logged in!`);
  // Optionally, redirect to your application's login page or dashboard
  // res.redirect(`http://yourapp.com/dashboard`);
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});

