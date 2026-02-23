const nodemailer = require("nodemailer");

const sendEmail = async ({to , subject , html, attachments = []}) => {
    try{
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure : false,
            auth : {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: `"SkillLink Support" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            attachments
        });
    } catch (error) {
        console.error("Email sending failed : " , error );
        throw error;
    }
};

module.exports = sendEmail;