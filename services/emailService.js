const { sendEmail } = require('../config/mail');

const welcomeEmail = async (user) => {
  const subject = 'Welcome to Food Cart Finder!';
  const html = `
    <h1>Welcome to Food Cart Finder!</h1>
    <p>Hi ${user.name},</p>
    <p>Thank you for joining Food Cart Finder. We're excited to have you on board!</p>
    <p>With Food Cart Finder, you can:</p>
    <ul>
      <li>Find food carts near you</li>
      <li>Create and manage cart pods</li>
      <li>Add and review food carts</li>
      <li>Share your favorite food cart experiences</li>
    </ul>
    <p>If you have any questions, feel free to reach out to our support team.</p>
    <p>Best regards,<br>The Food Cart Finder Team</p>
  `;

  return sendEmail({
    to: user.email,
    subject,
    html,
  });
};

const passwordResetEmail = async (user, resetToken) => {
  const subject = 'Password Reset Request';
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <h1>Password Reset Request</h1>
    <p>Hi ${user.name},</p>
    <p>We received a request to reset your password. Click the link below to create a new password:</p>
    <p><a href="${resetUrl}">Reset Password</a></p>
    <p>If you didn't request this, please ignore this email.</p>
    <p>This link will expire in 1 hour.</p>
    <p>Best regards,<br>The Food Cart Finder Team</p>
  `;

  return sendEmail({
    to: user.email,
    subject,
    html,
  });
};

const cartPodNotificationEmail = async (user, cartPod) => {
  const subject = 'New Food Cart Added to Your Cart Pod';
  const html = `
    <h1>New Food Cart Added</h1>
    <p>Hi ${user.name},</p>
    <p>A new food cart has been added to your cart pod "${cartPod.name}":</p>
    <p><strong>${cartPod.latestFoodCart.name}</strong></p>
    <p>Food served: ${cartPod.latestFoodCart.foodServed.join(', ')}</p>
    <p>You can view the details by clicking the link below:</p>
    <p><a href="${process.env.CLIENT_URL}/foodcart/${cartPod.latestFoodCart._id}">View Food Cart Details</a></p>
    <p>Best regards,<br>The Food Cart Finder Team</p>
  `;

  return sendEmail({
    to: user.email,
    subject,
    html,
  });
};

module.exports = {
  welcomeEmail,
  passwordResetEmail,
  cartPodNotificationEmail,
}; 