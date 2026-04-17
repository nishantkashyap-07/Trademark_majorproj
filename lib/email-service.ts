import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: parseInt(process.env.SMTP_PORT || '465') === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOtpEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Verification Code - TrademarkChain Protocol',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #ffffff; border-radius: 24px; border: 1px solid #f1f5f9;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">TrademarkChain</h1>
          <p style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.2em; margin: 4px 0 0 0;">Protocol Verification</p>
        </div>
        
        <div style="background-color: #f8fafc; border-radius: 20px; padding: 32px; text-align: center;">
          <p style="color: #475569; font-size: 14px; margin-bottom: 24px; font-weight: 500;">Please use the following code to verify your corporate identity and session access.</p>
          
          <div style="background-color: #ffffff; border: 2px solid #e2e8f0; border-radius: 16px; padding: 20px; display: inline-block;">
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 32px; font-weight: 800; letter-spacing: 0.2em; color: #4f46e5;">${otp}</span>
          </div>
          
          <p style="color: #94a3b8; font-size: 11px; margin-top: 24px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">This code will expire in 10 minutes</p>
        </div>
        
        <div style="margin-top: 32px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 24px;">
          <p style="color: #94a3b8; font-size: 11px; line-height: 1.6;">
            Unauthorized entry into this system is strictly prohibited. If you did not request this verification, please contact our compliance department immediately.
          </p>
          <p style="color: #4f46e5; font-size: 11px; font-weight: 700; margin-top: 16px; text-transform: uppercase;">Protected by AEGIS Protocol</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error('Send Email Error:', error);
    return { success: false, error: error.message };
  }
};
