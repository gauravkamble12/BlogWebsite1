const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendSubscriptionEmail = async (email) => {
  try {
    const mailOptions = {
      from: `"GK Blog" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to our Newsletter!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #6366f1;">Welcome to GK Blog Newsletter!</h2>
          <p>Thank you for subscribing to our weekly newsletter. You will receive the latest stories and updates directly in your inbox.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 0.8rem; color: #64748b;">If you didn't subscribe, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Newsletter subscription email sent to:", email);
  } catch (err) {
    console.error("Error sending newsletter email:", err);
  }
};

const sendNewPostAlert = async (authorName, emails, blog) => {
  if (!emails || emails.length === 0) return;

  try {
    const mailOptions = {
      from: `"GK Blog" <${process.env.EMAIL_USER}>`,
      bcc: emails.join(','),
      subject: `New Story from ${authorName}: ${blog.title}`,
      html: `
        <div style="font-family: 'Inter', sans-serif; padding: 40px; background: #f8fafc; color: #1e293b;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <div style="padding: 40px; border-top: 4px solid #6366f1;">
              <span style="color: #6366f1; font-weight: 800; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.1em;">New Publication</span>
              <h1 style="font-size: 2rem; font-weight: 800; margin: 15px 0; line-height: 1.2;">${blog.title}</h1>
              <p style="color: #64748b; font-size: 1.1rem; line-height: 1.6;">${authorName} just shared a new perspective that might interest you.</p>
              <div style="margin: 30px 0; display: flex; align-items: center; gap: 10px;">
                <span style="background: #f1f5f9; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 700;">${blog.category}</span>
                <span style="color: #94a3b8; font-size: 0.8rem;">• ${blog.readingTime} min read</span>
              </div>
              <a href="${process.env.BASE_URL || 'http://localhost:3004'}/blogs/${blog._id}" style="display: inline-block; background: #6366f1; color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: 700; margin-top: 20px;">Read Full Story</a>
            </div>
            <div style="padding: 20px; background: #f1f5f9; text-align: center;">
              <p style="font-size: 0.8rem; color: #94a3b8; margin: 0;">You're receiving this because you follow ${authorName} on GK Blog.</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Automation: Sent ${emails.length} new post alerts for ${authorName}`);
  } catch (err) {
    console.error("Error sending new post alert:", err);
  }
};

module.exports = { sendSubscriptionEmail, sendNewPostAlert };
