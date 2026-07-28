import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/data/send-email", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const response = await resend.emails.send({
      from: "Website <noreply@yourdomain.com>",
      to: "support@yourdomain.com",
      subject: `New message from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    res.json(response);
  } catch (err) {
    res.status(500).json(err);
  }
});
