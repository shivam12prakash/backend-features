import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.HOST_SMTP,
  port: process.env.PORT_SMTP,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.USER_SMTP,
    pass: process.env.PASSWORD_SMTP,
  },
});

export const sendEmail = async (toMail, subject, body) => {
  const info = await transporter.sendMail({
    from: process.env.FROM_USER_SMTP, // sender address
    to: toMail, // list of receivers
    subject: subject, // Subject line
    html: body, // html body
  });
};
