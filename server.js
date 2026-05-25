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
console.log("EMAIL_HOST =", process.env.EMAIL_HOST);
console.log("EMAIL_USER =", process.env.EMAIL_USER);
console.log("EMAIL_PASS =", process.env.EMAIL_PASS);

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
  //res.send(`Hello ${storedToken.email}, you are now logged in!`);
  // res.redirect(`tastyrecipes://login?token=${token}`);
  const deepLink = `tastyrecipes://login?token=${token}`;

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <title>Opening TastyRecipes</title>
        <script>
          function openApp() {
            // Try iframe method
            var iframe = document.createElement("iframe");
            iframe.style.display = "none";
            iframe.src = "${deepLink}";
            document.body.appendChild(iframe);
            // Fallback
            setTimeout(function() {
              window.location = "${deepLink}";
            }, 1000);
          }
          window.onload = openApp;
        </script>
      </head>
      <body
        style="
          font-family:sans-serif;
          text-align:center;
          padding-top:50px;">
        <h2>Opening TastyRecipes...</h2>
        <p>
          If app does not open automatically,
          click below:
        </p>
        <a
          href="${deepLink}"
          style="
            font-size:20px;
            color:blue;
          "
        >
          Open App
        </a>
      </body>
    </html>
  `);
  
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});

