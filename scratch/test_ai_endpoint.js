const testChat = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: "Xin chào, đây là tin nhắn test từ hệ thống.",
        context: "Tài liệu trống"
      })
    });
    
    const data = await response.json();
    console.log("Chat Response:", data);
  } catch (err) {
    console.error("Chat Error:", err);
  }
};

const testGenerate = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: "Viết một câu chào mừng.",
        context: ""
      })
    });
    
    const data = await response.json();
    console.log("Generate Response:", data);
  } catch (err) {
    console.error("Generate Error:", err);
  }
};

const run = async () => {
  console.log("Testing AI endpoints...");
  await testChat();
  await testGenerate();
};

run();
