import type { ServerClient } from "postmark";
import { renderToStaticMarkup } from "react-dom/server";
import type { PostmarkProvider, SendEmailInput } from "../types";

function createPayloadFromEmailInput(
	email: SendEmailInput
): Parameters<ServerClient["sendEmail"]>[0] {
	return {
		From: email.from,
		To: Array.isArray(email.to) ? email.to.join(",") : email.to,
		Cc: Array.isArray(email.cc) ? email.cc.join(",") : email.cc,
		Bcc: Array.isArray(email.bcc) ? email.bcc.join(",") : email.bcc,
		ReplyTo: Array.isArray(email.replyTo)
			? email.replyTo.join(",")
			: email.replyTo,
		Subject: email.subject,
		...("html" in email && email.html
			? { HtmlBody: email.html }
			: "text" in email && email.text
				? { TextBody: email.text }
				: "react" in email && email.react
					? { HtmlBody: renderToStaticMarkup(email.react) }
					: { TextBody: "" }),
	};
}

export function sendEmail(
	postmarkProvider: PostmarkProvider,
	email: SendEmailInput
) {
	return postmarkProvider.postmark.sendEmail(
		createPayloadFromEmailInput(email)
	) as any;
}
