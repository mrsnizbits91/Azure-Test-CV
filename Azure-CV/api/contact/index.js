const { ClientSecretCredential } = require("@azure/identity");
const { Client } = require("@microsoft/microsoft-graph-client");
require("isomorphic-fetch");

module.exports = async function (context, req) {
  context.log("📩 Contact form triggered");

  try {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) {
      context.res = {
        status: 400,
        body: { success: false, error: "Missing required fields." }
      };
      return;
    }

    const credential = new ClientSecretCredential(
      process.env.AZ_TENANT_ID,
      process.env.AZ_CLIENT_ID,
      process.env.AZ_CLIENT_SECRET
    );

    const graphClient = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const token = await credential.getToken("https://graph.microsoft.com/.default");
          return token.token;
        },
      },
    });

    const mail = {
      message: {
        subject: `💬 New message from ${name}`,
        body: {
          contentType: "Text",
          content: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
        },
        toRecipients: [
          { emailAddress: { address: process.env.MAIL_TO || process.env.MAIL_USER } }
        ],
      },
      saveToSentItems: "false",
    };

    await graphClient.api(`/users/${process.env.MAIL_USER}/sendMail`).post(mail);

    context.log("✅ Email sent successfully!");
    context.res = { status: 200, body: { success: true } };
  } catch (err) {
    context.log.error("❌ Error:", err);
    context.res = { status: 500, body: { success: false, error: err.message } };
  }
};
