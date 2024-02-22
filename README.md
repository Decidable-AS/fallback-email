# fallback-email

VERY ALPHA

I have never made an NPM pacakge before, so please contribute!

## What is it?

A unified email client that can use multiple providers. If one provider fails, it will try the next one. If all providers fail, it will throw an error.

## Thing to notice

* Does not support attachments yet.
* Only includes a few providers by default yet. (Please PR if you want to add more)
* API may change a lot until v1.0.0

## Example usage

```javascript
import { createClient } from "fallback-email";
import { Resend } from "resend";
import { ServerClient } from "postmark";

export const emailClient = createClient([
	{
		type: "resend",
		resend: new Resend(),
	},
	{
		type: "postmark",
		postmark: new ServerClient("serverToken"),
	},
	{
		type: "custom",
		async sendEmail(email) {
			// your implementation
			return "Some value";
		},
	},
]);

const res = await emailClient.sendEmail({
	from: "test",
	to: "test",
	subject: "test",
	text: "test",
});

console.log("Used provider", res.index);
```
