import type { Resend } from "resend";
import type { ResendProvider, SendEmailInput } from "../types";

function createPayloadFromEmailInput(
	email: SendEmailInput
): Parameters<Resend["emails"]["send"]>[0] {
	return {
		to: email.to,
		cc: email.cc,
		bcc: email.bcc,
		reply_to: email.replyTo,
		from: email.from,
		subject: email.subject,
		...("html" in email && email.html
			? { html: email.html }
			: "text" in email && email.text
				? { text: email.text }
				: "react" in email && email.react
					? { react: email.react }
					: { text: "" }),
	};
}

export async function sendEmail(
	resendProvider: ResendProvider,
	email: SendEmailInput
): ReturnType<Resend["emails"]["send"]> {
	return resendProvider.resend.emails.send(createPayloadFromEmailInput(email));
}
