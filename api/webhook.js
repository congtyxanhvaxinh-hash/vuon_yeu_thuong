export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false });
  }

  const auth = req.headers['authorization'];
  if (auth !== `Apikey ${process.env.SEPAY_WEBHOOK_APIKEY}`) {
    return res.status(401).json({ success: false });
  }

  const payload = req.body || {};
  const content = String(payload.content || '');
  const amount = Number(payload.transferAmount || 0).toLocaleString('vi-VN');

  async function sendTelegram(message) {
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

  if (payload.transferType === 'in' && content.includes('DTDN199K')) {
    const message =
      `🛒 *ĐƠN HÀNG MỚI — Cẩm Nang Dược Thực Đồng Nguyên*\n\n` +
      `💰 Số tiền: ${amount}đ\n` +
      `🏦 Ngân hàng: ${payload.gateway || ''}\n` +
      `📝 Nội dung CK: ${content}\n` +
      `🔖 Mã giao dịch: ${payload.referenceCode || ''}\n` +
      `⏰ Thời gian: ${payload.transactionDate || ''}`;

    await sendTelegram(message);
  } else if (payload.transferType === 'in' && content.includes('NTVECOWS')) {
    const phoneMatch = content.match(/0\d{8,10}/);
    const phone = phoneMatch ? phoneMatch[0] : '(không đọc được SĐT — xem nội dung CK bên dưới)';
    const message =
      `🎟️ *VÉ MỚI — Workshop Trồng Cây Ecopark*\n\n` +
      `💰 Số tiền: ${amount}đ\n` +
      `📱 SĐT khách: ${phone}\n` +
      `🏦 Ngân hàng: ${payload.gateway || ''}\n` +
      `📝 Nội dung CK: ${content}\n` +
      `🔖 Mã giao dịch: ${payload.referenceCode || ''}\n` +
      `⏰ Thời gian: ${payload.transactionDate || ''}\n\n` +
      `👉 Nhắn Zalo xác nhận giữ chỗ cho khách nhé.`;

    await sendTelegram(message);
  }

  return res.status(200).json({ success: true });
}
