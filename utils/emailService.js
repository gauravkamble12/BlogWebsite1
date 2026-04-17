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

module.exports = {
  sendWelcomeEmail,
  sendCommentNotification,
};
