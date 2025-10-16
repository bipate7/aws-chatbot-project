const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Table names - we'll create these in DynamoDB
const SESSIONS_TABLE = "ai-chatbot-sessions";
const ANALYTICS_TABLE = "ai-chatbot-analytics";

exports.handler = async (event) => {
  console.log("🚀 DynamoDB Lambda invoked:", JSON.stringify(event, null, 2));

  try {
    // Parse the request
    const body = JSON.parse(event.body);
    const userMessage = body.message || "hello";
    const sessionId = event.headers["session-id"] || generateSessionId();
    const userId = event.headers["user-id"] || "anonymous";

    // 📝 STEP 1: Save user message to DynamoDB
    await saveMessageToDynamo(sessionId, "user", userMessage, userId);

    // 🧠 STEP 2: Generate AI response
    const aiResponse = generateAIResponse(userMessage);
    const confidence = calculateConfidence(userMessage);

    // 📝 STEP 3: Save AI response to DynamoDB
    await saveMessageToDynamo(sessionId, "assistant", aiResponse, userId);

    // 📊 STEP 4: Update analytics
    await updateAnalytics(userId, sessionId);

    // 🔍 STEP 5: Get conversation history
    const conversationHistory = await getConversationHistory(sessionId);

    // ✅ STEP 6: Return enhanced response
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "session-id, user-id, Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: JSON.stringify({
        message: aiResponse,
        sessionId: sessionId,
        userId: userId,
        timestamp: new Date().toISOString(),
        awsService: "Lambda + DynamoDB",
        confidence: confidence,
        conversationLength: conversationHistory.length,
        history: conversationHistory.slice(-5), // Last 5 messages
        database: {
          table: SESSIONS_TABLE,
          itemsStored: conversationHistory.length,
          features: [
            "Persistent storage",
            "Session management",
            "Chat history",
          ],
        },
      }),
    };
  } catch (error) {
    console.error("❌ Error in Lambda:", error);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message:
          "🤖 I'm having trouble accessing the database, but I'm still here to help!",
        timestamp: new Date().toISOString(),
        error: "Database connection issue",
        fallbackMode: true,
      }),
    };
  }
};

// ==================== DYNAMODB FUNCTIONS ====================

/**
 * Save a message to DynamoDB
 */
async function saveMessageToDynamo(sessionId, role, content, userId) {
  const params = {
    TableName: SESSIONS_TABLE,
    Item: {
      sessionId: sessionId,
      timestamp: Date.now(), // Sort key for ordering
      messageId: generateMessageId(),
      role: role, // 'user' or 'assistant'
      content: content,
      userId: userId,
      createdAt: new Date().toISOString(),
      ttl: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // Auto-delete after 30 days
    },
  };

  try {
    await dynamodb.put(params).promise();
    console.log("✅ Saved to DynamoDB:", { sessionId, role, userId });
    return true;
  } catch (error) {
    console.error("❌ DynamoDB save error:", error);
    throw error;
  }
}

/**
 * Get conversation history for a session
 */
async function getConversationHistory(sessionId) {
  const params = {
    TableName: SESSIONS_TABLE,
    KeyConditionExpression: "sessionId = :sid",
    ExpressionAttributeValues: {
      ":sid": sessionId,
    },
    ScanIndexForward: true, // Oldest first
    Limit: 20, // Last 20 messages
  };

  try {
    const result = await dynamodb.query(params).promise();
    console.log(
      `📖 Retrieved ${result.Items.length} messages for session: ${sessionId}`
    );
    return result.Items || [];
  } catch (error) {
    console.error("❌ DynamoDB query error:", error);
    return [];
  }
}

/**
 * Update analytics for user behavior tracking
 */
async function updateAnalytics(userId, sessionId) {
  const params = {
    TableName: ANALYTICS_TABLE,
    Item: {
      userId: userId,
      timestamp: Date.now(),
      sessionId: sessionId,
      action: "chat_message",
      date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
      hour: new Date().getHours(),
      platform: "web",
    },
  };

  try {
    await dynamodb.put(params).promise();
    console.log("📊 Analytics updated for user:", userId);
  } catch (error) {
    console.error("❌ Analytics update error:", error);
  }
}

// ==================== AI RESPONSE LOGIC ====================

function generateAIResponse(userMessage) {
  const enhancedResponses = {
    shipping:
      "🚚 **Smart Shipping with Database**: Free delivery on orders over $50! Your shipping preferences are now saved in our secure database.",
    return:
      "📦 **Returns History**: 30-day return policy. We now remember your return history across sessions thanks to DynamoDB!",
    payment:
      "💳 **Secure Payment Logs**: All major cards accepted. Your payment method preferences are stored securely.",
    database:
      "💾 **AWS DynamoDB Active**: This conversation is persisted in a NoSQL database! Messages are stored with TTL (auto-cleanup).",
    history:
      "📝 **Chat Memory Enabled**: I can now recall our entire conversation history, even if you close the browser!",
    analytics:
      "📊 **Analytics Tracking**: Your chat usage is being analyzed (anonymously) to improve our service.",
    session:
      "🔐 **Session Management**: Each chat has a unique session ID. Your data is organized and secure.",
    default:
      '🤖 **Database-Powered AI**: Now with persistent memory! Try: "history", "database", or ask about shipping/returns.',
  };

  const lowerMessage = userMessage.toLowerCase();
  for (const [keyword, response] of Object.entries(enhancedResponses)) {
    if (lowerMessage.includes(keyword)) {
      return response;
    }
  }
  return enhancedResponses.default;
}

function calculateConfidence(message) {
  const keywords = [
    "shipping",
    "return",
    "payment",
    "database",
    "history",
    "analytics",
    "session",
  ];
  const matches = keywords.filter((keyword) =>
    message.toLowerCase().includes(keyword)
  ).length;
  return Math.min(95, 70 + matches * 10);
}

// ==================== UTILITY FUNCTIONS ====================

function generateSessionId() {
  return (
    "session-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9)
  );
}

function generateMessageId() {
  return "msg-" + Date.now() + "-" + Math.random().toString(36).substr(2, 6);
}

// ==================== TEST HANDLER ====================

/**
 * For testing the function locally
 */
async function testHandler() {
  const testEvent = {
    body: JSON.stringify({ message: "hello database" }),
    headers: {
      "session-id": "test-session-123",
      "user-id": "test-user-456",
    },
  };

  const result = await exports.handler(testEvent);
  console.log("Test result:", JSON.stringify(result, null, 2));
}

// Uncomment to test locally
// testHandler();
