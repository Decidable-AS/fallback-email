import type { Resend } from "resend";
import type { ServerClient } from "postmark";
import { renderToStaticMarkup } from "react-dom/server";

type SendEmailInput = {
	to: string | string[];
	cc?: string | string[];
	bcc?: string | string[];
	replyTo?: string | string[];
	from: string;
	subject: string;
} & (
	| {
			html: string;
	  }
	| {
			text: string;
	  }
	| {
			react: React.ReactElement | React.ReactNode | null;
	  }
);

type CustomProvider = {
	type: "custom";
	sendEmail: <T = any>(email: SendEmailInput) => Promise<T>;
};

type ResendProvider = {
	type: "resend";
	resend: Resend;
};

type PostmarkProvider = {
  type: "postmark";
  postmark: ServerClient;
};

type Provider = CustomProvider | ResendProvider | PostmarkProvider;

export function createClient(providers: Provider[]) {
	return {
		async sendEmail(email: SendEmailInput) {
			let result;
			for (const provider of providers) {
				const providerType = provider.type;
				try {
					switch (providerType) {
						case "custom":
							{
								const res = await provider.sendEmail(email);
								if (res.error) {
									throw new Error(res.error);
								}
								result = res;
							}
							break;
						case "resend":
							{
								const res = await provider.resend.emails.send({
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
								});
								if (res.error) {
									throw res.error;
								}
								result = res;
							}
							break;
            case "postmark":
              {
                const To = Array.isArray(email.to) ? email.to.join(",") : email.to;
                const Cc = Array.isArray(email.cc) ? email.cc.join(",") : email.cc;
                const Bcc = Array.isArray(email.bcc) ? email.bcc.join(",") : email.bcc;
                const ReplyTo = Array.isArray(email.replyTo) ? email.replyTo.join(",") : email.replyTo;
                const res = await provider.postmark.sendEmail({
                  From: email.from,
                  To,
                  Cc,
                  Bcc,
                  ReplyTo,
                  Subject: email.subject,

                  ...("html" in email && email.html
                    ? { HtmlBody: email.html }
                    : "text" in email && email.text
                      ? { TextBody: email.text }
                      : "react" in email && email.react
                        ? { HtmlBody: renderToStaticMarkup(email.react) }
                        : { TextBody: "" }),
                });
                if (res.ErrorCode) {
                  throw new Error(res.Message);
                }
                result = res;
              }
              break;
						default:
							providerType satisfies never;
							throw new Error("Invalid provider type");
					}
				} catch (error) {
					console.error(error);
				}
			}
			if (!result) {
				throw new Error("No email provider available");
			}
			return result;
		},
	};
}
