exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  // Get the user's message from the request
  let userMessage = "hello";
  try {
    if (event.body) {
      const body = JSON.parse(event.body);
      userMessage = body.message || "hello";
    }
  } catch (error) {
    console.log("Error parsing body:", error);
  }

  // Enhanced AI responses with Lambda
  const responses = {
    shipping:
      "🚚 **AWS-Powered Shipping**: Free delivery on orders over $50! Using AWS Lambda for real-time tracking. Standard delivery takes 3-5 business days.",
    return:
      "📦 **Smart Returns**: 30-day return policy. Items must be in original condition. Powered by AWS for fast processing!",
    payment:
      "💳 **Secure Payments**: We accept Visa, MasterCard, PayPal, and Apple Pay. We use AWS security to protect your payment information.",
    contact:
      "📞 **AWS-Scaled Support**: Contact us at support@ourstore.com or call 1-800-HELP-NOW. Our systems scale automatically using AWS!",
    aws: "☁️ **AWS Power**: This chatbot uses AWS Lambda, API Gateway, and will soon use Amazon Bedrock AI! Built by you in Week 1!",
    hours:
      "🕒 **24/7 Support**: We're available anytime! Thanks to AWS cloud infrastructure that never sleeps.",
    product:
      "📱 **Our Products**: We offer electronics, home goods, fashion, and more! All powered by AWS e-commerce solutions.",
    default:
      "🤖 **AWS Chatbot**: I'm learning! Next we'll add Amazon Bedrock AI. Try asking about: shipping, returns, payment, or AWS!",
  };

  const lowerMessage = userMessage.toLowerCase();
  let responseText = responses.default;
  let matchedKeyword = "default";

  for (const [keyword, response] of Object.entries(responses)) {
    if (lowerMessage.includes(keyword)) {
      responseText = response;
      matchedKeyword = keyword;
      break;
    }
  }

  // Calculate confidence based on match quality
  const confidenceScores = {
    shipping: 95,
    return: 90,
    payment: 98,
    contact: 100,
    aws: 85,
    hours: 100,
    product: 80,
    default: 50,
  };

  const confidence = confidenceScores[matchedKeyword];

  // Return the response
  const response = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
      "Access-Control-Allow-Headers":
        "Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token",
    },
    body: JSON.stringify({
      message: responseText,
      timestamp: new Date().toISOString(),
      awsService: "Lambda",
      confidence: confidence,
      matchedKeyword: matchedKeyword,
      requestId: event.requestContext?.requestId || "local-test",
    }),
  };

  return response;
};
