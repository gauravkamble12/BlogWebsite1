const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendWelcomeEmail = async (email, name) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to GK Blog!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4338ca;">Welcome to GK Blog, ${name}!</h2>
          <p>Thank you for registering. Start creating amazing blogs and connect with others.</p>
          <a href="http://localhost:8000" style="background: #4338ca; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 10px;">Get Started</a>
        </div>
      `,
    });
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

const sendCommentNotification = async (email, blogTitle, authorName) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "New Comment on Your Blog",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4338ca;">New Comment!</h2>
          <p><strong>${authorName}</strong> commented on your blog: <em>${blogTitle}</em></p>
          <a href="http://localhost:8000" style="background: #4338ca; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 10px;">View Comment</a>
        </div>
      `,
    });
    console.log(`Comment notification sent to ${email}`);
  } catch (error) {
    console.error("Error sending comment notification:", error);
  }
};

const sendOTPEmail = async (email, name, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset PIN - Vitreous",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
          <h2 style="color: #4338ca;">Password Reset Request</h2>
          <p>Hi ${name},</p>
          <p>You requested to reset your password. Use the 6-digit PIN below to proceed. This PIN will expire in 10 minutes.</p>
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendCommentNotification,
  sendOTPEmail,
};
