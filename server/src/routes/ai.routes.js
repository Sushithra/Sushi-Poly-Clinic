import express from 'express';

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    // In production, you would initialize the Gemini or OpenAI SDK here.
    // For now, we scaffold the endpoint and return a structured mock response.
    const mockResponse = `This is an AI generated response to: "${message}". I can help you understand symptoms, but please consult a real doctor for diagnosis.`;
    
    // Slight delay to simulate network/AI processing time
    setTimeout(() => {
        res.json({ 
            reply: mockResponse, 
            disclaimer: "This AI is for informational purposes only and does not replace professional medical advice." 
        });
    }, 1000);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
