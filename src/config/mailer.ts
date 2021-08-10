import * as nodemailer from 'nodemailer'
import config from './config';

export const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'guitarraviva18@gmail.com',
        pass: config.ADMINAPI
    }
});

transporter.verify().then(console.log).catch(console.log);