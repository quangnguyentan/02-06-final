import nodemailer from "nodemailer";

interface MailOptions {
    email: string;
    html: string;
}

const sendMail = async ({ email, html }: MailOptions) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_NAME as string,
            pass: process.env.EMAIL_APP_PASSWORD as string,
        },
    });

    const info = await transporter.sendMail({
        from: '"speakup" <no-reply@speakup.com>',
        to: email,
        subject: "Forgot password",
        html: html,
    });

    return info;
};

export default sendMail;
