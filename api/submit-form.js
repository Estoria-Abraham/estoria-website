const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, city, service, message } = req.body;

  // Sanitize inputs
  function sanitize(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const safeName = sanitize(name);
  const safeEmail = sanitize(email);
  const safePhone = sanitize(phone);
  const safeCity = sanitize(city);
  const safeService = sanitize(service);
  const safeMessage = sanitize(message);

  let emailSent = false;
  let smsSent = false;
  let errors = [];

  // SendGrid
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({
      to: process.env.SENDGRID_TO_EMAIL,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: `New Estimate Request from ${safeName}`,
      html: `
        <h2>New Estimate Request</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Phone:</strong> ${safePhone}</p>
        <p><strong>City:</strong> ${safeCity}</p>
        <p><strong>Service:</strong> ${safeService}</p>
        <p><strong>Message:</strong> ${safeMessage}</p>
      `
    });
    emailSent = true;
  } catch (err) {
    errors.push('Email failed: ' + err.message);
  }

  // Twilio
  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: `New estimate request from ${safeName} — ${safePhone} — ${safeService} — ${safeCity}`,
      from: process.env.TWILIO_FROM_NUMBER,
      to: process.env.TWILIO_TO_NUMBER
    });
    smsSent = true;
  } catch (err) {
    errors.push('SMS failed: ' + err.message);
  }

  if (emailSent || smsSent) {
    return res.status(200).json({ success: true, emailSent, smsSent });
  } else {
    return res.status(500).json({ success: false, errors });
  }
};
