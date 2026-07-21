import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = parseInt(process.env.SMTP_PORT || "587", 10);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASSWORD;
const from = process.env.SMTP_FROM || "noreply@sattvicliving.com";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Uniform log formatter for email fallback mock tracking.
 */
function logMockEmail(
  email: string,
  type: "PASSWORD RESET" | "EMAIL ACTIVATION",
  link: string,
  token: string,
  reason: string
) {
  console.log("\n========================================================");
  console.log(`📨 [SATTVIC LIVING] ${type} EMAIL MOCK LOG`);
  console.log(`To:      ${email}`);
  console.log(`Link:    ${link}`);
  console.log(`Token:   ${token}`);
  console.log(`Reason:  ${reason}`);
  console.log("========================================================\n");
}

/**
 * Transmits a password reset link to the user's inbox.
 * Gracefully falls back to terminal console logs if configuration is absent or fails.
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${appUrl}/reset-password?token=${token}`;

  // Check if SMTP settings are missing or contain placeholder values
  const isMocked =
    !host ||
    !user ||
    !pass ||
    user === "your_smtp_username_here" ||
    pass === "your_smtp_password_here";

  if (isMocked) {
    logMockEmail(email, "PASSWORD RESET", resetLink, token, "SMTP configuration parameters are missing or set to defaults.");
    return {
      success: true,
      mocked: true,
      warning: "SMTP settings are unconfigured. The recovery link has been logged to your server terminal console.",
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 5000, // 5 seconds connection threshold
      socketTimeout: 5000,
    });

    await transporter.sendMail({
      from: `"Sattvic Living" <${from}>`,
      to: email,
      subject: "Reset your Sattvic Living password",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #FCFCFA;">
          <h2 style="color: #355E3B; font-family: serif; font-size: 24px; border-bottom: 1px solid #8DAA91; padding-bottom: 10px;">SATTVIC LIVING</h2>
          <p style="font-size: 16px; color: #2D3E35; line-height: 1.6;">Namaste,</p>
          <p style="font-size: 16px; color: #2D3E35; line-height: 1.6;">We received a request to reset the password for your account. Click the button below to establish a new password. This link is valid for 1 hour.</p>
          <div style="margin: 25px 0; text-align: center;">
            <a href="${resetLink}" style="background-color: #355E3B; color: #FCFCFA; text-decoration: none; padding: 12px 24px; border-radius: 50px; font-weight: bold; font-size: 14px; letter-spacing: 1px; display: inline-block; text-transform: uppercase;">Reset Password</a>
          </div>
          <p style="font-size: 12px; color: #2D3E35; opacity: 0.8; line-height: 1.6;">If you didn't request a password reset, you can safely ignore this email. The link will automatically expire.</p>
          <hr style="border: 0; border-top: 1px solid #8DAA91; margin: 20px 0; opacity: 0.2;" />
          <p style="font-size: 12px; color: #8DAA91; text-align: center;">With mindfulness, <br/> The Sattvic Living Team</p>
        </div>
      `,
    });

    return { success: true, mocked: false };
  } catch (error) {
    console.error("❌ SMTP connection failure while sending password reset email:", error);
    logMockEmail(email, "PASSWORD RESET", resetLink, token, `SMTP connection failed: ${(error as Error).message}. Flipped to terminal logging.`);
    return {
      success: true,
      mocked: true,
      warning: "SMTP connection failed. The recovery link has been logged to your server terminal console.",
    };
  }
}

/**
 * Transmits an account activation/verification link to the user's inbox.
 * Gracefully falls back to terminal console logs if configuration is absent or fails.
 */
export async function sendVerificationEmail(email: string, token: string) {
  const verifyLink = `${appUrl}/verify-email?token=${token}`;

  // Check if SMTP settings are missing or contain placeholder values
  const isMocked =
    !host ||
    !user ||
    !pass ||
    user === "your_smtp_username_here" ||
    pass === "your_smtp_password_here";

  if (isMocked) {
    logMockEmail(email, "EMAIL ACTIVATION", verifyLink, token, "SMTP configuration parameters are missing or set to defaults.");
    return {
      success: true,
      mocked: true,
      warning: "SMTP settings are unconfigured. The activation link has been logged to your server terminal console.",
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 5000,
      socketTimeout: 5000,
    });

    await transporter.sendMail({
      from: `"Sattvic Living" <${from}>`,
      to: email,
      subject: "Activate your Sattvic Living account",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #FCFCFA;">
          <h2 style="color: #355E3B; font-family: serif; font-size: 24px; border-bottom: 1px solid #8DAA91; padding-bottom: 10px;">SATTVIC LIVING</h2>
          <p style="font-size: 16px; color: #2D3E35; line-height: 1.6;">Namaste,</p>
          <p style="font-size: 16px; color: #2D3E35; line-height: 1.6;">Welcome to our sanctuary of spiritual growth and organic living. Before you begin your journey, please activate your account by verifying your email address using the button below:</p>
          <div style="margin: 25px 0; text-align: center;">
            <a href="${verifyLink}" style="background-color: #355E3B; color: #FCFCFA; text-decoration: none; padding: 12px 24px; border-radius: 50px; font-weight: bold; font-size: 14px; letter-spacing: 1px; display: inline-block; text-transform: uppercase;">Verify Email Address</a>
          </div>
          <p style="font-size: 12px; color: #2D3E35; opacity: 0.8; line-height: 1.6;">This activation link is valid for 24 hours. If you did not register for a Sattvic Living account, you can disregard this email.</p>
          <hr style="border: 0; border-top: 1px solid #8DAA91; margin: 20px 0; opacity: 0.2;" />
          <p style="font-size: 12px; color: #8DAA91; text-align: center;">In peace and health, <br/> The Sattvic Living Team</p>
        </div>
      `,
    });

    return { success: true, mocked: false };
  } catch (error) {
    console.error("❌ SMTP connection failure while sending verification email:", error);
    logMockEmail(email, "EMAIL ACTIVATION", verifyLink, token, `SMTP connection failed: ${(error as Error).message}. Flipped to terminal logging.`);
    return {
      success: true,
      mocked: true,
      warning: "SMTP connection failed. The activation link has been logged to your server terminal console.",
    };
  }
}

/**
 * Transmits an order status update email to the user's inbox.
 * Gracefully falls back to terminal console logs if configuration is absent or fails.
 */
export async function sendOrderStatusEmail(
  email: string,
  orderNumber: string,
  status: string,
  itemsListHtml: string,
  totalAmount: number
) {
  // Check if SMTP settings are missing or contain placeholder values
  const isMocked =
    !host ||
    !user ||
    !pass ||
    user === "your_smtp_username_here" ||
    pass === "your_smtp_password_here";

  let subject = `Sattvic Living Order Update: ${orderNumber}`;
  let headline = "";
  let bodyText = "";

  switch (status) {
    case "PENDING":
      subject = `Order Placed - ${orderNumber} | Sattvic Living`;
      headline = "Thank you for your order!";
      bodyText = "We have received your request for our prana-rich Ayurvedic menu. Here are the particulars of your order. We will verify availability and confirm your delivery details shortly.";
      break;
    case "CONFIRMED":
      subject = `Order Confirmed - ${orderNumber} | Sattvic Living`;
      headline = "Your order is confirmed!";
      bodyText = "Our kitchen has verified your order, and we are preparing to source the freshest organic ingredients.";
      break;
    case "PREPARING":
      subject = `Order Preparing - ${orderNumber} | Sattvic Living`;
      headline = "We are preparing your meal!";
      bodyText = "Our chefs are currently preparing your Ayurvedic dishes with conscious intent and balancing spices.";
      break;
    case "OUT_FOR_DELIVERY":
      subject = `Out for Delivery - ${orderNumber} | Sattvic Living`;
      headline = "Your meal is on its way!";
      bodyText = "Your high-prana organic food has been packed into insulated containers and is now out for delivery.";
      break;
    case "DELIVERED":
      subject = `Order Delivered - ${orderNumber} | Sattvic Living`;
      headline = "Your meal has been delivered!";
      bodyText = "Namaste, your order has been successfully delivered. We hope these pure dishes support your health and spiritual vitality.";
      break;
    case "CANCELLED":
      subject = `Order Cancelled - ${orderNumber} | Sattvic Living`;
      headline = "Your order has been cancelled";
      bodyText = "We are writing to confirm that your order has been cancelled. If you did not initiate this change or need assistance, please reply to this email.";
      break;
  }

  const trackingLink = `${appUrl}/dashboard/orders`;

  if (isMocked) {
    console.log("\n========================================================");
    console.log(`📨 [SATTVIC LIVING] ORDER STATUS EMAIL MOCK LOG`);
    console.log(`To:           ${email}`);
    console.log(`Order No:     ${orderNumber}`);
    console.log(`New Status:   ${status}`);
    console.log(`Total:        $${totalAmount.toFixed(2)}`);
    console.log(`Reason:       SMTP configuration parameters are missing or set to defaults.`);
    console.log("========================================================\n");
    return {
      success: true,
      mocked: true,
      warning: "SMTP settings are unconfigured. The order update has been logged to your server terminal console.",
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 5000,
      socketTimeout: 5000,
    });

    await transporter.sendMail({
      from: `"Sattvic Living Kitchen" <${from}>`,
      to: email,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #FCFCFA;">
          <h2 style="color: #355E3B; font-family: serif; font-size: 24px; border-bottom: 1px solid #8DAA91; padding-bottom: 10px; margin-top: 0;">SATTVIC LIVING</h2>
          <p style="font-size: 16px; color: #2D3E35; font-weight: bold; margin-top: 20px;">${headline}</p>
          <p style="font-size: 14px; color: #2D3E35; line-height: 1.6; opacity: 0.9;">${bodyText}</p>
          
          <div style="margin: 20px 0; padding: 15px; border: 1px solid #8DAA91; border-radius: 8px; background-color: #F8F4EC;">
            <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: bold; color: #355E3B;">ORDER SUMMARY: ${orderNumber}</p>
            <div style="font-size: 12px; color: #2D3E35; line-height: 1.6;">
              ${itemsListHtml}
            </div>
            <p style="margin: 10px 0 0 0; font-size: 13px; font-weight: bold; text-align: right; color: #355E3B;">Total Amount: $${totalAmount.toFixed(2)}</p>
          </div>

          <div style="margin: 25px 0; text-align: center;">
            <a href="${trackingLink}" style="background-color: #355E3B; color: #FCFCFA; text-decoration: none; padding: 12px 24px; border-radius: 50px; font-weight: bold; font-size: 13px; letter-spacing: 1px; display: inline-block; text-transform: uppercase;">Track Order History</a>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #8DAA91; margin: 20px 0; opacity: 0.2;" />
          <p style="font-size: 12px; color: #8DAA91; text-align: center; margin-bottom: 0;">With mindfulness, <br/> The Sattvic Living Kitchen Team</p>
        </div>
      `,
    });

    return { success: true, mocked: false };
  } catch (error) {
    console.error("❌ SMTP connection failure while sending order status email:", error);
    return {
      success: true,
      mocked: true,
      warning: `SMTP connection failed: ${(error as Error).message}. logged to server terminal.`,
    };
  }
}
