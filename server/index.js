const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173', // Allow frontend origin
    methods: ['POST', 'OPTIONS'],
}));
app.use(express.json());

// Email Transporter (using Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

// HTML Email Template
const createEmailTemplate = (userEmail) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: #f9f9f9; padding: 30px; text-align: center; }
    .header h1 { color: #3CB550; margin: 0; font-size: 28px; }
    .content { padding: 30px; }
    .content h2 { color: #1a1a1a; margin-top: 0; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #888; }
    .button { display: inline-block; padding: 12px 24px; background-color: #3CB550; color: white !important; text-decoration: none; border-radius: 50px; font-weight: bold; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Finhome</h1>
    </div>
    <div class="content">
      <h2>Chào mừng bạn đến với Trải nghiệm Finhome!</h2>
      <p>Xin chào,</p>
      <p>Cảm ơn bạn đã đăng ký tham gia trải nghiệm cùng Finhome. Chúng tôi rất vui mừng được chào đón bạn.</p>
      <p>Email này xác nhận chúng tôi đã nhận được yêu cầu từ <strong>${userEmail}</strong>.</p>
      <p>Hãy cùng chờ đón những cập nhật mới nhất nhé!</p>
      <a href="https://finhome.group" class="button">Truy cập Website</a>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Finhome. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Routes
app.post('/api/send-email', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    try {
        // 1. Send confirmation to the user
        await transporter.sendMail({
            from: `"Finhome Team" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'Chào mừng đến với Trải nghiệm Finhome',
            html: createEmailTemplate(email),
        });

        // 2. (Optional) Send internal notification to admin
        // await transporter.sendMail({ ... });

        console.log(`Email sent successfully to ${email}`);
        res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Failed to send email. Check server logs.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
