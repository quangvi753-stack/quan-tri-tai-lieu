import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Lấy API Key từ biến môi trường
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// POST /api/ai/generate
// Route nhận yêu cầu từ Frontend và gọi Gemini API
router.post('/generate', async (req, res) => {
  try {
    const { prompt, context } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Thiếu yêu cầu (prompt)' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: 'Chưa cấu hình GEMINI_API_KEY trên server.' });
    }

    // Khởi tạo model (sử dụng gemini-2.5-flash cho tốc độ nhanh)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Cấu trúc prompt để AI luôn trả về HTML hợp lệ cho Rich Text Editor
    const systemInstruction = `
Bạn là một trợ lý soạn thảo văn bản chuyên nghiệp.
Nhiệm vụ của bạn là viết hoặc chỉnh sửa tài liệu dựa trên nội dung gốc (nếu có) và yêu cầu của người dùng.
QUAN TRỌNG NHẤT: Bạn PHẢI trả về kết quả dưới định dạng mã HTML cơ bản (chỉ dùng các thẻ <p>, <h1>, <h2>, <ul>, <li>, <strong>, <em>, <br>).
KHÔNG ĐƯỢC bọc kết quả trong markdown code block như \`\`\`html. Chỉ trả về chuỗi HTML thuần túy.
    `;

    const fullPrompt = `
${systemInstruction}

NỘI DUNG GỐC TỪ FILE CỦA NGƯỜI DÙNG:
${context || 'Không có nội dung gốc.'}

YÊU CẦU CỦA NGƯỜI DÙNG:
${prompt}
    `;

    // Gọi API
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    let text = response.text();

    // Làm sạch kết quả nếu AI lỡ tay bọc markdown
    text = text.replace(/```html/g, '').replace(/```/g, '').trim();

    return res.status(200).json({ success: true, data: text });

  } catch (error) {
    console.error(`❌ [POST AI Generate] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi khi gọi AI API: ' + error.message });
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

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, message: 'Chưa cấu hình GEMINI_API_KEY trên server.' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemInstruction = `
Bạn là một trợ lý thông minh (Copilot) cho một ứng dụng Quản trị Tài liệu doanh nghiệp.
Nhiệm vụ của bạn là tư vấn, đánh giá rủi ro, và đưa ra gợi ý sửa đổi cho tài liệu hiện tại mà người dùng đang thao tác.
Bạn trả lời bằng ngôn ngữ tự nhiên, ngắn gọn, xúc tích, và format bằng Markdown (không dùng HTML).
Nếu có lỗi chính tả hoặc thiếu sót, hãy chỉ ra rõ ràng.
    `;

    const chat = model.startChat({
      history: history || [],
      systemInstruction: { parts: [{ text: systemInstruction }] }
    });

    const fullPrompt = `
DỮ LIỆU TÀI LIỆU HIỆN TẠI:
${context || 'Không có dữ liệu.'}

YÊU CẦU:
${prompt}
    `;

    const result = await chat.sendMessage(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ success: true, data: text });

  } catch (error) {
    console.error(`❌ [POST AI Chat] Error:`, error);
    return res.status(500).json({ success: false, message: 'Lỗi khi gọi AI API: ' + error.message });
  }
});

// POST /api/ai/extract-quote
router.post('/extract-quote', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Thiếu nội dung văn bản' });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ success: false, message: 'Chưa cấu hình GEMINI_API_KEY' });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
Bạn là một trợ lý ảo trích xuất thông tin chuyên nghiệp.
Hãy đọc văn bản sau và trích xuất các thông tin báo giá thành định dạng JSON hợp lệ.
YÊU CẦU JSON SCHEMA CHÍNH XÁC NHƯ SAU:
{
  "customerName": "Tên khách hàng hoặc công ty (nếu có)",
  "customerAddress": "Địa chỉ khách hàng (nếu có)",
  "items": [
    { "id": "tạo_một_id_ngẫu_nhiên_dạng_string", "name": "Tên hàng hóa", "unit": "Đơn vị tính", "quantity": số_lượng_kiểu_int, "price": đơn_giá_kiểu_int, "discount": 0, "image": "" }
  ]
}

Nếu không tìm thấy thông tin nào, hãy để chuỗi rỗng "" hoặc mảng rỗng [].
Chỉ trả về chuỗi JSON thuần túy, KHÔNG bọc trong markdown \`\`\`json.

VĂN BẢN CẦN TRÍCH XUẤT:
${text}
    `;

    const result = await model.generateContent(prompt);
    let resultText = result.response.text().trim();
    if (resultText.startsWith('\`\`\`json')) resultText = resultText.substring(7);
    if (resultText.startsWith('\`\`\`')) resultText = resultText.substring(3);
    if (resultText.endsWith('\`\`\`')) resultText = resultText.slice(0, -3);

    const parsedData = JSON.parse(resultText.trim());
    res.json({ success: true, data: parsedData });
  } catch (error) {
    console.error("Lỗi khi trích xuất dữ liệu:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
