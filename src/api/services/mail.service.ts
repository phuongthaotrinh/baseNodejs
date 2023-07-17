import SMTPTransport from 'nodemailer/lib/smtp-transport';
import transporter from '../../configs/nodemailer.config';

export const sendVerificationEmail = async ({
	to,
	subject,
	template
}: {
	to: string;
	subject: string;
	template: string;
}) =>
	await transporter.sendMail(
		{
			from: {
				address: process.env.AUTH_EMAIL!,
				name: 'Cửa hàng thời trang suesue'
			},
			to: to,
			subject: subject,
			html: template
		},
		(err: Error | null, info: SMTPTransport.SentMessageInfo): void => {
			if (err) console.log('Failed to send mail.\nError: ', err.message);
			else console.log(info.response);
		}
	);
