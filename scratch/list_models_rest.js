import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`)
.then(res => res.json())
.then(data => {
  if (data.models) {
    data.models.forEach(m => console.log(m.name, m.supportedGenerationMethods));
  } else {
    console.log("Response:", data);
  }
})
.catch(err => console.error(err));
