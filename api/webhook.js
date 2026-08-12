export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false });
  }

  const auth = req.headers['authorization'];
  if (auth !== `Apikey ${process.env.SEPAY_WEBHOOK_APIKEY}`) {
    return res.status(401).json({ success: false });
  }

  const payload = req.body || {};

  if (payload.transferType === 'in' && String(payload.content || '').includes('DTDN199K')) {
    const amount = Number(payload.transferAmount || 0).toLocaleString('vi-VN');
    const message =
      `🛒 *ĐƠN HÀNG MỚI — Cẩm Nang Dược Thực Đồng Nguyên*\n\n` +
      `💰 Số tiền: ${amount}đ\n` +
      `🏦 Ngân hàng: ${payload.gateway || ''}\n` +
      `📝 Nội dung CK: ${payload.content || ''}\n` +
      `🔖 Mã giao dịch: ${payload.referenceCode || ''}\n` +
      `⏰ Thời gian: ${payload.transactionDate || ''}`;

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
  }

  return res.status(200).json({ success: true });
}
