export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false });
  }

  const body = req.body || {};
  const phone = String(body.phone || '').replace(/\D/g, '');
  const source = String(body.source || 'unknown');

  if (phone.length < 9 || phone.length > 11) {
    return res.status(400).json({ success: false, error: 'invalid phone' });
  }

  const now = new Date().toISOString();
  const message =
    `🌱 *LEAD MỚI — Mini Cẩm Nang Ban Công Ecopark*\n\n` +
    `📱 SĐT: ${phone}\n` +
    `📄 Nguồn: ${source}\n` +
    `⏰ Thời gian: ${now}\n\n` +
    `👉 Nhắn Zalo làm quen, mời buổi workshop tiếp theo khi có lịch.`;

  try {
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });
  } catch (err) {
    console.error('Telegram send failed:', err);
  }

  return res.status(200).json({ success: true });
}
