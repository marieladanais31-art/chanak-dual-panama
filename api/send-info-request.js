export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const data = req.body || {};
  const requiredFields = ['guardianName', 'email', 'whatsapp', 'studentGrade', 'message'];
  const missing = requiredFields.filter((field) => !data[field]);

  if (missing.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const to = process.env.ENROLLMENT_TO_EMAIL || 'dualdiploma@chanakacademy.org';
  const from = process.env.ENROLLMENT_FROM_EMAIL || 'onboarding@resend.dev';
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Email service is not configured' });
  }

  const text = `New information request — Dual Diploma Panama EN\n\n- Parent / guardian name: ${data.guardianName || ''}\n- Email: ${data.email || ''}\n- WhatsApp: ${data.whatsapp || ''}\n- Student current grade: ${data.studentGrade || ''}\n- Message: ${data.message || ''}`;

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to,
      subject: 'New information request — Dual Diploma Panama EN',
      text
    })
  });

  if (!resendResponse.ok) {
    const err = await resendResponse.text();
    return res.status(502).json({ error: 'Email service failed', detail: err });
  }

  return res.status(200).json({ ok: true });
}
