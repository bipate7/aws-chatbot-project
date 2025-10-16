// Test the Lambda function locally
const mockEvent = {
  body: JSON.stringify({
    message: "Tell me about shipping",
  }),
  requestContext: {
    requestId: "local-test-123",
  },
};

// Import and test the Lambda handler
async function testLambda() {
  try {
    // Import the Lambda function
    const { handler } = await import("./lambda-function.js");

    console.log("🧪 Testing Lambda Function...");
    console.log("Test Event:", JSON.stringify(mockEvent, null, 2));

    // Execute the Lambda function
    const result = await handler(mockEvent);

    console.log("\n✅ Lambda Test Result:");
    console.log("Status Code:", result.statusCode);
    console.log("Response Body:", JSON.parse(result.body));
    console.log("\n📋 Headers:", result.headers);
  } catch (error) {
    console.error("❌ Lambda Test Failed:");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

// Run different test cases
async function runAllTests() {
  console.log("🚀 Starting Lambda Function Tests\n");

  const testCases = [
    { message: "hello" },
    { message: "shipping info" },
    { message: "return policy" },
    { message: "payment methods" },
    { message: "contact support" },
    { message: "aws services" },
    { message: "random question" },
  ];

  for (const testCase of testCases) {
    console.log(`\n--- Testing: "${testCase.message}" ---`);

    const testEvent = {
      body: JSON.stringify(testCase),
      requestContext: { requestId: "test-" + Date.now() },
    };

    try {
      const { handler } = await import("./lambda-function.js");
      const result = await handler(testEvent);
      const body = JSON.parse(result.body);

      console.log(`✅ Response: ${body.message.substring(0, 50)}...`);
      console.log(
        `   Confidence: ${body.confidence}% | Keyword: ${body.matchedKeyword}`
      );
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }
}

// Run single test or all tests
// testLambda(); // Run single test
runAllTests(); // Run all test cases
