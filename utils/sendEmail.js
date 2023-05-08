const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name;
        this.url = url;
        this.from = `sai ram krishna <${process.env.EMAIL_FROM}>`;
    }

    createNewTransport() {
        if (process.env.NODE_ENV === 'production') {
            nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
        }
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async send(template, subject) {
        //1) render html
        const html = pug.renderFile(
            `${__dirname}/../views/emails/${template}.pug`,
            {
                firstName: this.firstName,
                url: this.url,
                subject
            }
        );

        //2)email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.htmlToText(html)
        };

        //3)create transpoter
        await this.createNewTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to natours!');
    }

    async sendPasswordReset() {
        await this.send(
            'passwordResetApi',
            'Password reset token. (valid for only 10 mins)'
        );
    }
};
//GMAIL
// const transporter = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//         user: process.env.GMAIL_USERNAME,
//         password: process.env.GMAIL_PASSWORD
//     }
//     // activate in gmail "less secure app" option .
// });

// const sendEmail = async options => {
//     //1) create transporter
//     //MAILTRAP
//     const transporter = nodemailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//             user: process.env.EMAIL_USERNAME,
//             pass: process.env.EMAIL_PASSWORD
//         }
//     });

//     //2) define options
//     const mailOptions = {
//         from: 'sai ram krishna <sairamkrishna1412@gmail.com>',
//         to: options.email,
//         subject: options.subject,
//         text: options.message
//         //html :
//     };
//     //3)send email
// await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;
