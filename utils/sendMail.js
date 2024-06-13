require('dotenv').config();

const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// OAuth2 客戶端設置
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// 設置訪問令牌
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

async function sendMail(to, subject, text, html) {
  try {
    // 獲取訪問令牌
    const accessToken = await oAuth2Client.getAccessToken();

    // 設置 nodemailer 傳輸選項
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken.token
      }
    });

    // 電子郵件選項
    const mailOptions = {
      from: process.env.EMAIL,
      to: to,
      subject: subject,
      text: text,
      html: html
    };

    // 發送電子郵件
    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.log('Error:', error);
    throw error;
  }
}

module.exports = sendMail;