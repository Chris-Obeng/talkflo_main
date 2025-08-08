# TalkFlo Edge Functions Deployment Guide

## Overview

TalkFlo uses **Supabase Edge Functions** for heavy processing tasks like audio transcription and AI content processing. This provides better performance, scalability, and isolation for compute-intensive operations.

## 🎯 Edge Functions Created

### 1. **process-audio**
- **Purpose**: Main audio processing pipeline
- **Features**: 
  - Audio transcription with Gemini Chirp
  - Content rewriting with Gemini 2.5 Pro
  - Title generation
  - Database updates
- **File**: `supabase/functions/process-audio/index.ts`

### 2. **webhook-handler**
- **Purpose**: Handle external webhooks and events
- **Features**:
  - Process upload notifications
  - Handle completion/failure events
  - Trigger other workflows
- **File**: `supabase/functions/webhook-handler/index.ts`

### 3. **batch-process**
- **Purpose**: Batch processing for multiple files
- **Features**:
  - Process pending notes in batches
  - Retry failed processing
  - Cleanup old failed notes
- **File**: `supabase/functions/batch-process/index.ts`

## 🚀 Deployment Methods

### Method 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to your project: https://supabase.com/dashboard/project/mpeibvgwuijdltndxsoa
   - Navigate to **Edge Functions**

2. **Deploy each function:**
   
   **For process-audio:**
   - Click "Create Function"
   - Name: `process-audio`
   - Copy content from: `supabase/functions/process-audio/index.ts`
   - Click "Deploy"

   **For webhook-handler:**
   - Click "Create Function" 
   - Name: `webhook-handler`
   - Copy content from: `supabase/functions/webhook-handler/index.ts`
   - Click "Deploy"

   **For batch-process:**
   - Click "Create Function"
   - Name: `batch-process`
   - Copy content from: `supabase/functions/batch-process/index.ts`
   - Click "Deploy"

3. **Set Environment Variables**
   In each function's settings, add:
   ```
   SUPABASE_URL=https://mpeibvgwuijdltndxsoa.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

### Method 2: Supabase CLI

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login and link project**
   ```bash
   supabase login
   supabase link --project-ref mpeibvgwuijdltndxsoa
   ```

3. **Deploy functions**
   ```bash
   # Deploy all functions
   supabase functions deploy
   
   # Or deploy individually
   supabase functions deploy process-audio
   supabase functions deploy webhook-handler
   supabase functions deploy batch-process
   ```

4. **Set secrets**
   ```bash
   supabase secrets set GEMINI_API_KEY=your_gemini_api_key
   ```

## 🔧 Environment Variables Required

Make sure these are set in your Edge Functions environment:

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin operations | ✅ |
| `GEMINI_API_KEY` | Google Gemini API key | ✅ |

## 📋 Function URLs

Once deployed, your functions will be available at:

- **process-audio**: `https://mpeibvgwuijdltndxsoa.supabase.co/functions/v1/process-audio`
- **webhook-handler**: `https://mpeibvgwuijdltndxsoa.supabase.co/functions/v1/webhook-handler`
- **batch-process**: `https://mpeibvgwuijdltndxsoa.supabase.co/functions/v1/batch-process`

## 🧪 Testing Edge Functions

### Test process-audio function:

```bash
curl -X POST https://mpeibvgwuijdltndxsoa.supabase.co/functions/v1/process-audio \\
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "noteId": "your-note-id",
    "audioUrl": "https://example.com/audio.mp3",
    "userId": "your-user-id"
  }'
```

### Test webhook-handler:

```bash
curl -X POST https://mpeibvgwuijdltndxsoa.supabase.co/functions/v1/webhook-handler \\
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "audio_uploaded",
    "data": {
      "noteId": "your-note-id",
      "userId": "your-user-id"
    }
  }'
```

### Test batch-process:

```bash
curl -X POST https://mpeibvgwuijdltndxsoa.supabase.co/functions/v1/batch-process \\
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "userId": "your-user-id",
    "maxBatchSize": 3
  }'
```

## 🔄 Integration with Your App

The Edge Functions are already integrated with your API routes:

1. **Upload Flow**: `POST /api/upload-audio` → Triggers `process-audio` Edge Function
2. **Manual Processing**: `POST /api/process-audio/[noteId]` → Direct processing (fallback)
3. **Batch Processing**: Call `batch-process` Edge Function for bulk operations

## 📊 Monitoring

Monitor your Edge Functions in the Supabase Dashboard:

1. Go to **Edge Functions** section
2. Click on each function to see:
   - Invocation logs
   - Error rates
   - Performance metrics
   - Recent executions

## 🐛 Troubleshooting

### Common Issues:

1. **Function not found**
   - Ensure function is deployed
   - Check function name spelling

2. **Environment variables missing**
   - Set all required environment variables
   - Redeploy after setting secrets

3. **Gemini API errors**
   - Verify your Gemini API key is valid
   - Check quota limits

4. **Database connection issues**
   - Ensure SUPABASE_SERVICE_ROLE_KEY is correct
   - Check RLS policies allow the operations

### Checking Logs:

```bash
# View function logs via CLI
supabase functions logs process-audio
supabase functions logs webhook-handler
supabase functions logs batch-process
```

## 🚀 Next Steps

1. **Deploy the Edge Functions** using one of the methods above
2. **Set environment variables** in the Supabase dashboard
3. **Test each function** to ensure they work correctly
4. **Monitor performance** and adjust as needed
5. **Scale** by adding more Edge Functions as your app grows

## 💡 Benefits of Edge Functions

- **Scalability**: Auto-scaling based on demand
- **Performance**: Runs closer to users globally
- **Isolation**: Separate from your main application
- **Cost-effective**: Pay per execution
- **No server management**: Fully managed by Supabase

Your TalkFlo app now has a robust, scalable backend with Edge Functions handling all the heavy lifting! 🎉