import type { Resend } from "resend";
import type { ServerClient } from "postmark";

export type SendEmailInput = {
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

export type CustomProvider = {
	type: "custom";
	sendEmail: (email: SendEmailInput) => Promise<any>;
};

export type ResendProvider = {
	type: "resend";
	resend: Resend;
};

export type PostmarkProvider = {
	type: "postmark";
	postmark: ServerClient;
};

export type Provider = CustomProvider | ResendProvider | PostmarkProvider;
