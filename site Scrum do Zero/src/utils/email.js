const nodemailer = require('nodemailer');

let transporter = null;
let testAccount = null;
let useTestAccount = false;

async function initializeTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    useTestAccount = false;
    console.log('📧 Usando SMTP real para envio de email');
  } else {
    testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    useTestAccount = true;
    console.log('📧 Usando conta Ethereal (teste) para envio de email');
  }

  return transporter;
}

async function enviarCodigoRecuperacao(email, codigo) {
  try {
    const transport = await initializeTransporter();
    const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || (testAccount && testAccount.user);

    if (!fromAddress) {
      throw new Error('Remetente de email não configurado. Defina EMAIL_FROM ou SMTP_USER.');
    }

    const info = await transport.sendMail({
      from: fromAddress,
      to: email,
      subject: 'Recuperação de Senha - Scrum do Zero',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Recuperação de Senha</h2>
          <p>Recebemos uma solicitação para resetar sua senha.</p>
          <p>Use o código abaixo para prosseguir:</p>
          
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #000; letter-spacing: 2px; font-size: 24px; margin: 0;">${codigo}</h3>
          </div>
          
          <p style="color: #666;">Este código expira em 15 minutos.</p>
          <p style="color: #666;">Se você não solicitou esta ação, ignore este email.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin-top: 30px;">
          <p style="color: #999; font-size: 12px;">Scrum do Zero - Plataforma de Certificação</p>
        </div>
      `,
    });

    console.log('✅ Email enviado:', info.messageId);
    if (useTestAccount) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('🔎 Preview de email:', previewUrl);
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    throw new Error('Erro ao enviar email de recuperação');
  }
}

module.exports = {
  enviarCodigoRecuperacao,
};