# Week 2 - Day 1: AWS DynamoDB Integration

## 🎯 Today's Goals

- Create DynamoDB tables for persistent storage
- Enhance Lambda with database operations
- Implement session management
- Build chat history persistence

## 📋 Step-by-Step Implementation

### 1. Create DynamoDB Tables

**Go to AWS Console → DynamoDB → Create Table**

**Table 1: `ai-chatbot-sessions`**

- Partition Key: `sessionId` (String)
- Sort Key: `timestamp` (Number)
- Enable TTL: `ttl` attribute (30 days)

**Table 2: `ai-chatbot-analytics`**

- Partition Key: `userId` (String)
- Sort Key: `timestamp` (Number)

### 2. Update Lambda Function

- Replace your current Lambda code with `lambda-dynamodb.js`
- Ensure Lambda has DynamoDB permissions
- Test the function

### 3. Deploy Enhanced Frontend

- Use `aws-chatbot-enhanced.html`
- Test session persistence
- Verify database connectivity

## ✅ Success Metrics

- [ ] Messages persist between browser sessions
- [ ] Each user has unique session ID
- [ ] Chat history retrievable
- [ ] Analytics data being collected
- [ ] Auto-cleanup working (TTL)

## 🚀 Next: Day 2 - S3 File Storage

We'll add file upload capabilities using Amazon S3!
