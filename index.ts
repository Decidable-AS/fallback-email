import type { Provider, SendEmailInput } from "./types";
import { sendEmail as sendEmailResend } from "./adapters/resend";
import { sendEmail as sendEmailPostmark } from "./adapters/postmark";

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
								result = {
									type: providerType,
									index: providers.indexOf(provider),
									custom: res,
								};
							}
							break;

						case "resend":
							{
								const res = await sendEmailResend(provider, email);
								if (res.error) {
									throw res.error;
								}
								result = {
									type: providerType,
									index: providers.indexOf(provider),
									resend: res as any,
								};
							}
							break;

						case "postmark":
							{
								const res = await sendEmailPostmark(provider, email);
								if (res.ErrorCode) {
									throw new Error(res.Message);
								}
								result = {
									type: providerType,
									index: providers.indexOf(provider),
									postmark: res,
								};
							}
							break;

						default:
							providerType satisfies never;
							throw new Error("Invalid provider type");
					}
					if (result) {
						break;
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
