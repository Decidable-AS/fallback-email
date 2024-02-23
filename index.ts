import type { Provider, SendEmailInput } from "./types";
import { sendEmail as sendEmailResend } from "./adapters/resend";
import { sendEmail as sendEmailPostmark } from "./adapters/postmark";

export function createClient(providers: Provider[]) {
	return {
		async sendEmail(email: SendEmailInput) {
			for (const provider of providers) {
				const providerType = provider.type;
				try {
					switch (providerType) {
						case "custom": {
							const res = await provider.sendEmail(email);
							if (res.error) {
								throw new Error(res.error);
							}
							return {
								type: providerType,
								index: providers.indexOf(provider),
								custom: res,
							};
						}

						case "resend": {
							const res = await sendEmailResend(provider, email);
							if (res.error) {
								throw res.error;
							}
							return {
								type: providerType,
								index: providers.indexOf(provider),
								resend: res as any,
							};
						}

						case "postmark": {
							const res = await sendEmailPostmark(provider, email);
							if (res.ErrorCode) {
								throw new Error(res.Message);
							}
							return {
								type: providerType,
								index: providers.indexOf(provider),
								postmark: res,
							};
						}

						default:
							providerType satisfies never;
							throw new Error("Invalid provider type");
					}
				} catch (error) {
					console.error(error);
				}
			}
			throw new Error("No email provider available");
		},
	};
}
