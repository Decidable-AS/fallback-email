# fallback-email

VERY ALPHA

## Example usage

```javascript
import { createClient } from "fallback-email"
import { Resend } from "resend"
import { ServerClient } from "postmark"

export const emailClient = createClient([
	{
		type: "resend",
		resend: new Resend()
	},
	{
		type: "postmark",
		postmark: new ServerClient("serverToken")
	}
	{
		type: "custom",
		async sendEmail(email) {
			// your implementation
			return "Some value"
		},
	}
])

const res = await emailClient.sendEmail({
	from: "test",
	to: "test",
	subject: "test",
	text: "test",
});

console.log("Used provider", res.index)
```
