const { DefaultAzureCredential } = require("@azure/identity");
const { Client } = require("@microsoft/microsoft-graph-client");
require("isomorphic-fetch");

module.exports = async function (context, req) {
  context.log("📩 Contact (Graph API) triggered");

  try {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) {
      context.res = {
        status: 400,
        body: { success: false, error: "Missing required fields." },
      };
      return;
    }

    context.log("✅ Received:", { name, email, message });

    // Authenticate using Managed Identity
    const credential = new DefaultAzureCredential();
    context.log("🔑 Fetching Graph token...");
    const token = await credential.getToken("https://graph.microsoft.com/.default");
    context.log("✅ Token acquired successfully");

    const graphClient = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => token.token,
      },
    });

    const sender = process.env.MAIL_USER || "mlopez@mariolan.net";
    const recipient = process.env.MAIL_TO || sender;

    context.log(`📤 Sending email from ${sender} to ${recipient}...`);

    const mail = {
      message: {
        subject: `💬 New message from ${name}`,
        body: {
          contentType: "Text",
          content: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        },
        toRecipients: [
          {
            emailAddress: { address: recipient },
          },
        ],
      },
      saveToSentItems: "false",
    };

    // Use /users/{sender}/sendMail (for app identity)
    await graphClient.api(`/users/${sender}/sendMail`).post(mail);

    context.log("✅ Email sent successfully!");
    context.res = { status: 200, body: { success: true } };
  } catch (err) {
    context.log.error("❌ Detailed Error:", err);
    context.res = {
      status: 500,
      body: { success: false, error: err.message, stack: err.stack },
    };
  }
};
