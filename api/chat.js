// api/chat.js - Vercel Serverless Function (FREE)
export default async function handler(req, res) {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, session-id, user-id');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    console.log('📨 Vercel function called');
    
    const { message } = req.body;
    const sessionId = req.headers['session-id'] || generateSessionId();
    const userId = req.headers['user-id'] || 'vercel-user';
    
    // Your AI response logic
    const response = generateAIResponse(message);
    const confidence = calculateConfidence(message);
    
    // Simulate database operations
    const conversationLength = await simulateDatabaseOperations(sessionId, message, response);
    
    // Return response in same format as AWS
    return res.status(200).json({
      message: response,
      sessionId: sessionId,
      userId: userId,
      timestamp: new Date().toISOString(),
      platform: 'Vercel (Free)',
      confidence: confidence,
      conversationLength: conversationLength,
      features: [
        'Free Forever',
        'No AWS Credits Needed',
        'Auto-scaling',
        'Global CDN'
      ],
      database: {
        simulated: true,
        message: 'Using in-memory storage (free)'
      }
    });
    
  } catch (error) {
    console.error('❌ Vercel function error:', error);
    
    return res.status(200).json({
      message: "🤖 Hello from Vercel Free Tier!",
      timestamp: new Date().toISOString(),
      platform: 'Vercel',
      confidence: 85,
      fallback: true
    });
  }
}

// AI Response Logic
function generateAIResponse(userMessage) {
  const enhancedResponses = {
    'shipping': '🚚 **Vercel-Powered Shipping**: Free delivery on orders over $50! This response is served from Vercel edge network.',
    'return': '📦 **Easy Returns**: 30-day return policy. Powered by free Vercel serverless functions!',
    'payment': '💳 **Secure Payments**: All major cards accepted. No AWS credits required!',
    'vercel': '▲ **Vercel Platform**: This chatbot is now running on Vercel - free forever! No credit card required.',
    'aws': '☁️ **AWS vs Vercel**: Both work! AWS has DynamoDB, Vercel is free forever. Your choice!',
    'free': '🎉 **Free Forever**: This deployment costs $0/month. Perfect for personal projects!',
    'database': '💾 **Simulated Database**: In free tier, we simulate database operations. Upgrade for real DB.',
    'default': '🤖 **Vercel-Powered AI**: Now running on free cloud platform! Try: "vercel", "free", or ask about shipping.'
  };
  
  const lowerMessage = (userMessage || 'hello').toLowerCase();
  for (const [keyword, response] of Object.entries(enhancedResponses)) {
    if (lowerMessage.includes(keyword)) {
      return response;
    }
  }
  return enhancedResponses.default;
}

function calculateConfidence(message) {
  const keywords = ['shipping', 'return', 'payment', 'vercel', 'aws', 'free', 'database'];
  const matches = keywords.filter(keyword => message.toLowerCase().includes(keyword)).length;
  return Math.min(95, 70 + (matches * 10));
}

function generateSessionId() {
  return 'vercel-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Simulate database operations
async function simulateDatabaseOperations(sessionId, userMessage, aiResponse) {
  return Math.floor(Math.random() * 10) + 1;
}
