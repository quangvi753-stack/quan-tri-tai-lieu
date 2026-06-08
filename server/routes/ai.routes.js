import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-latest';

const router = express.Router();

// Khởi tạo Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || '',
});

// Helper function để xử lý gửi file (Ảnh/PDF) và Prompt lên Claude
async function extractDataWithClaude(prompt, fileBase64, mimeType) {
  const isPdf = mimeType === 'application/pdf';
  
  const content = [];
  if (fileBase64 && mimeType) {
    content.push({
      type: isPdf ? 'document' : 'image',
      source: {
        type: 'base64',
        media_type: mimeType,
        data: fileBase64
      }
    });
  }
  content.push({
    type: 'text',
    text: prompt
  });

  const params = {
    model: CLAUDE_MODEL,
    max_tokens: 4000,
    messages: [
      { role: 'user', content }
    ]
  };

  let response;
  if (isPdf) {
    // PDF cần sử dụng beta client với header pdf-2024-09-25
    response = await anthropic.beta.messages.create({
      ...params,
      betas: ['pdf-2024-09-25']
    });
  } else {
    response = await anthropic.messages.create(params);
  }

  return response.content[0].text;
}

// POST /api/ai/generate
// Route nhận yêu cầu từ Frontend và gọi Claude API để viết/sửa tài liệu
router.post('/generate', async (req, res) => {
  try {
    const { prompt, context } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Thiếu yêu cầu (prompt)' });
    }

    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'Chưa cấu hình CLAUDE_API_KEY trên server.' });
    }

    const systemInstruction = `
Bạn là một trợ lý soạn thảo văn bản chuyên nghiệp.
Nhiệm vụ của bạn là viết hoặc chỉnh sửa tài liệu dựa trên nội dung gốc (nếu có) và yêu cầu của người dùng.
QUAN TRỌNG NHẤT: Bạn PHẢI trả về kết quả dưới định dạng mã HTML cơ bản (chỉ dùng các thẻ <p>, <h1>, <h2>, <ul>, <li>, <strong>, <em>, <br>).
KHÔNG ĐƯỢC bọc kết quả trong markdown code block như \`\`\`html. Chỉ trả về chuỗi HTML thuần túy.
    `;

    const fullPrompt = `
NỘI DUNG GỐC TỪ FILE CỦA NGƯỜI DÙNG:
${context || 'Không có nội dung gốc.'}

YÊU CẦU CỦA NGƯỜI DÙNG:
${prompt}
    `;

    // Gọi Claude API
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4000,
      system: systemInstruction,
      messages: [
        { role: 'user', content: fullPrompt }
      ]
    });

    let text = response.content[0].text;

    // Làm sạch kết quả nếu AI lỡ tay bọc markdown
    text = text.replace(/```html/g, '').replace(/```/g, '').trim();

    return res.status(200).json({ success: true, data: text });

  } catch (error) {
    console.error(`❌ [POST AI Generate] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi khi gọi Claude API: ' + error.message });
  }
});

// POST /api/ai/chat
// Route cho tính năng Chat Copilot (Đánh giá, Góp ý)
router.post('/chat', async (req, res) => {
  try {
    const { prompt, context, history } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Thiếu yêu cầu (prompt)' });
    }

    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'Chưa cấu hình CLAUDE_API_KEY trên server.' });
    }

    const systemInstruction = `
Bạn là một trợ lý thông minh (Copilot) cho một ứng dụng Quản trị Tài liệu doanh nghiệp.
Nhiệm vụ của bạn là tư vấn, đánh giá rủi ro, và đưa ra gợi ý sửa đổi cho tài liệu hiện tại mà người dùng đang thao tác.
Bạn trả lời bằng ngôn ngữ tự nhiên, ngắn gọn, xúc tích, và format bằng Markdown (không dùng HTML).
Nếu có lỗi chính tả hoặc thiếu sót, hãy chỉ ra rõ ràng.
    `;

    // Chuyển đổi lịch sử chat từ định dạng Gemini sang định dạng Claude
    const claudeHistory = [];
    if (history && Array.isArray(history)) {
      history.forEach(h => {
        const role = h.role === 'model' ? 'assistant' : 'user';
        let text = '';
        if (h.parts && Array.isArray(h.parts)) {
          text = h.parts.map(p => p.text || '').join('\n');
        } else if (typeof h.content === 'string') {
          text = h.content;
        }
        if (text) {
          claudeHistory.push({ role, content: text });
        }
      });
    }

    const fullPrompt = `
DỮ LIỆU TÀI LIỆU HIỆN TẠI:
${context || 'Không có dữ liệu.'}

YÊU CẦU:
${prompt}
    `;

    claudeHistory.push({ role: 'user', content: fullPrompt });

    // Gọi Claude API
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4000,
      system: systemInstruction,
      messages: claudeHistory
    });

    const text = response.content[0].text;

    return res.status(200).json({ success: true, data: text });

  } catch (error) {
    console.error(`❌ [POST AI Chat] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi khi gọi Claude API: ' + error.message });
  }
});

// POST /api/ai/extract-quote
// Trích xuất báo giá
router.post('/extract-quote', async (req, res) => {
  try {
    const { text, fileBase64, mimeType } = req.body;
    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ success: false, message: 'Chưa cấu hình CLAUDE_API_KEY' });

    const prompt = `
Bạn là một trợ lý ảo trích xuất thông tin chuyên nghiệp.
Hãy đọc tài liệu được cung cấp (văn bản thô, ảnh chụp báo giá, hoặc file PDF) và trích xuất các thông tin báo giá thành định dạng JSON hợp lệ.
YÊU CẦU JSON SCHEMA CHÍNH XÁC NHƯ SAU:
{
  "customerName": "Tên khách hàng hoặc công ty (nếu có)",
  "customerAddress": "Địa chỉ khách hàng (nếu có)",
  "items": [
    { "id": "tạo_một_id_ngẫu_nhiên_dạng_string", "name": "Tên hàng hóa", "unit": "Đơn vị tính", "quantity": số_lượng_kiểu_int, "price": đơn_giá_kiểu_int, "discount": 0, "image": "" }
  ]
}

Nếu không tìm thấy thông tin tương ứng trong tài liệu, hãy để chuỗi rỗng "" hoặc mảng rỗng [].
Chỉ trả về chuỗi JSON thuần túy, KHÔNG bọc trong markdown \`\`\`json hay \`\`\`.
`;

    let contentInput = prompt;
    if (!(fileBase64 && mimeType)) {
      if (!text) return res.status(400).json({ success: false, message: 'Thiếu nội dung văn bản hoặc file cần trích xuất' });
      contentInput = `${prompt}\n\nVĂN BẢN CẦN TRÍCH XUẤT:\n${text}`;
    }

    const resultTextRaw = await extractDataWithClaude(contentInput, fileBase64, mimeType);
    let resultText = resultTextRaw.trim();
    if (resultText.startsWith('```json')) resultText = resultText.substring(7);
    if (resultText.startsWith('```')) resultText = resultText.substring(3);
    if (resultText.endsWith('```')) resultText = resultText.slice(0, -3);

    const parsedData = JSON.parse(resultText.trim());
    res.json({ success: true, data: parsedData });
  } catch (error) {
    console.error("Lỗi khi trích xuất dữ liệu bằng AI:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ai/extract-contract
// Trích xuất hợp đồng
router.post('/extract-contract', async (req, res) => {
  try {
    const { text, fileBase64, mimeType } = req.body;
    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ success: false, message: 'Chưa cấu hình CLAUDE_API_KEY' });

    const prompt = `
Bạn là một trợ lý ảo trích xuất thông tin chuyên nghiệp.
Hãy đọc tài liệu hợp đồng hoặc văn bản liên quan được cung cấp (văn bản thô, ảnh chụp, hoặc file PDF) và trích xuất các thông tin của Bên B (Mua) và danh sách hàng hóa/sản phẩm.
YÊU CẦU JSON SCHEMA CHÍNH XÁC NHƯ SAU:
{
  "partyBName": "Tên công ty hoặc cá nhân Bên B (Mua)",
  "partyBAddress": "Địa chỉ Bên B",
  "partyBTax": "Mã số thuế Bên B",
  "partyBRep": "Người đại diện Bên B",
  "partyBRole": "Chức vụ của người đại diện Bên B (ví dụ: Giám đốc, Đại diện)",
  "partyBPhone": "Số điện thoại Bên B",
  "partyBBank": "Số tài khoản ngân hàng Bên B",
  "partyBBankName": "Tên ngân hàng Bên B (ví dụ: Vietcombank...)",
  "items": [
    { "id": "tạo_một_id_ngẫu_nhiên_dạng_string", "name": "Tên hàng hóa/dịch vụ", "unit": "Đơn vị tính", "quantity": số_lượng_kiểu_int, "price": đơn_giá_kiểu_int, "note": "" }
  ]
}

Nếu không tìm thấy thông tin tương ứng trong tài liệu, hãy để chuỗi rỗng "" hoặc mảng rỗng [].
Chỉ trả về chuỗi JSON thuần túy, KHÔNG bọc trong bất kỳ khối markdown nào (như \`\`\`json).
`;

    let contentInput = prompt;
    if (!(fileBase64 && mimeType)) {
      if (!text) return res.status(400).json({ success: false, message: 'Thiếu nội dung văn bản hoặc file cần trích xuất' });
      contentInput = `${prompt}\n\nVĂN BẢN CẦN TRÍCH XUẤT:\n${text}`;
    }

    const resultTextRaw = await extractDataWithClaude(contentInput, fileBase64, mimeType);
    let resultText = resultTextRaw.trim();
    if (resultText.startsWith('```json')) resultText = resultText.substring(7);
    if (resultText.startsWith('```')) resultText = resultText.substring(3);
    if (resultText.endsWith('```')) resultText = resultText.slice(0, -3);

    const parsedData = JSON.parse(resultText.trim());
    res.json({ success: true, data: parsedData });
  } catch (error) {
    console.error("Lỗi khi trích xuất hợp đồng bằng AI:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ai/extract-payment
// Trích xuất đề nghị thanh toán
router.post('/extract-payment', async (req, res) => {
  try {
    const { text, fileBase64, mimeType } = req.body;
    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ success: false, message: 'Chưa cấu hình CLAUDE_API_KEY' });

    const prompt = `
Bạn là một trợ lý ảo trích xuất thông tin chuyên nghiệp.
Hãy đọc tài liệu đề nghị thanh toán hoặc tạm ứng hợp đồng được cung cấp (văn bản thô, ảnh chụp, hoặc file PDF) và trích xuất các thông tin thành định dạng JSON hợp lệ.
YÊU CẦU JSON SCHEMA CHÍNH XÁC NHƯ SAU:
{
  "sendTo": "Tên đơn vị kính gửi (In hoa đậm, ví dụ: CÔNG TY TNHH ABC)",
  "partyBName": "Tên Bên Mua (ví dụ: Công ty TNHH ABC)",
  "contractNumber": "Số hợp đồng kinh tế (ví dụ: HĐ-01/2026/QVN)",
  "goodsDescription": "Nội dung hợp đồng (ví dụ: mua các loại Bảo hộ lao động, cung cấp dịch vụ...)",
  "totalContractValue": giá_trị_hợp_đồng_kiểu_int,
  "paymentPercent": "Tỷ lệ thanh toán/tạm ứng đợt này (chỉ ghi số như '30' hoặc '50')",
  "paidAmount": số_tiền_đã_tạm_ứng_hoặc_thanh_toán_trước_đây_kiểu_int,
  "paymentAmount": số_tiền_đề_nghị_thanh_toán_hoặc_tạm_ứng_đợt_này_kiểu_int,
  "bankAccountName": "Tên chủ tài khoản ngân hàng nhận tiền (in hoa không dấu)",
  "bankAccountNumber": "Số tài khoản ngân hàng nhận tiền",
  "bankName": "Tên ngân hàng nhận tiền"
}

Nếu không tìm thấy thông tin tương ứng trong tài liệu, hãy để chuỗi rỗng "" hoặc 0.
Chỉ trả về chuỗi JSON thuần túy, KHÔNG bọc trong bất kỳ khối markdown nào (như \`\`\`json).
`;

    let contentInput = prompt;
    if (!(fileBase64 && mimeType)) {
      if (!text) return res.status(400).json({ success: false, message: 'Thiếu nội dung văn bản hoặc file cần trích xuất' });
      contentInput = `${prompt}\n\nVĂN BẢN CẦN TRÍCH XUẤT:\n${text}`;
    }

    const resultTextRaw = await extractDataWithClaude(contentInput, fileBase64, mimeType);
    let resultText = resultTextRaw.trim();
    if (resultText.startsWith('```json')) resultText = resultText.substring(7);
    if (resultText.startsWith('```')) resultText = resultText.substring(3);
    if (resultText.endsWith('```')) resultText = resultText.slice(0, -3);

    const parsedData = JSON.parse(resultText.trim());
    res.json({ success: true, data: parsedData });
  } catch (error) {
    console.error("Lỗi khi trích xuất thanh toán bằng AI:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ai/extract-order-confirm
// Trích xuất xác nhận đặt hàng
router.post('/extract-order-confirm', async (req, res) => {
  try {
    const { text, fileBase64, mimeType } = req.body;
    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ success: false, message: 'Chưa cấu hình CLAUDE_API_KEY' });

    const prompt = `
Bạn là một trợ lý ảo trích xuất thông tin chuyên nghiệp.
Hãy đọc tài liệu xác nhận đặt hàng hoặc đơn hàng được cung cấp (văn bản thô, ảnh chụp, hoặc file PDF) và trích xuất các thông tin thành định dạng JSON hợp lệ.
YÊU CẦU JSON SCHEMA CHÍNH XÁC NHƯ SAU:
{
  "partyBName": "Tên công ty hoặc cá nhân Bên B (Mua)",
  "partyBAddress": "Địa chỉ Bên B",
  "partyBTax": "Mã số thuế Bên B",
  "partyBRep": "Người đại diện Bên B",
  "partyBRole": "Chức vụ của người đại diện Bên B (ví dụ: Giám đốc, Đại diện)",
  "partyBPhone": "Số điện thoại Bên B",
  "partyBBank": "Số tài khoản ngân hàng Bên B",
  "partyBBankName": "Tên ngân hàng Bên B (ví dụ: Vietcombank...)",
  "deliveryLocation": "Địa điểm giao hàng (ví dụ: Bà Rịa - Vũng Tàu...)",
  "deliveryTime": "Thời gian giao hàng dự kiến (ví dụ: Trong vòng 7-10 ngày...)",
  "advancePercent": "Tỷ lệ tạm ứng đặt cọc (chỉ ghi số như '50' hoặc '30')",
  "items": [
    { "id": "tạo_một_id_ngẫu_nhiên_dạng_string", "name": "Tên hàng hóa/dịch vụ", "unit": "Đơn vị tính", "quantity": số_lượng_kiểu_int, "price": đơn_giá_kiểu_int, "note": "" }
  ]
}

Nếu không tìm thấy thông tin tương ứng trong tài liệu, hãy để chuỗi rỗng "" hoặc 0 hoặc mảng rỗng [].
Chỉ trả về chuỗi JSON thuần túy, KHÔNG bọc trong bất kỳ khối markdown nào (như \`\`\`json).
`;

    let contentInput = prompt;
    if (!(fileBase64 && mimeType)) {
      if (!text) return res.status(400).json({ success: false, message: 'Thiếu nội dung văn bản hoặc file cần trích xuất' });
      contentInput = `${prompt}\n\nVĂN BẢN CẦN TRÍCH XUẤT:\n${text}`;
    }

    const resultTextRaw = await extractDataWithClaude(contentInput, fileBase64, mimeType);
    let resultText = resultTextRaw.trim();
    if (resultText.startsWith('```json')) resultText = resultText.substring(7);
    if (resultText.startsWith('```')) resultText = resultText.substring(3);
    if (resultText.endsWith('```')) resultText = resultText.slice(0, -3);

    const parsedData = JSON.parse(resultText.trim());
    res.json({ success: true, data: parsedData });
  } catch (error) {
    console.error("Lỗi khi trích xuất biên bản xác nhận đặt hàng bằng AI:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
