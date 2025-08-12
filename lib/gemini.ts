/**
 * Google Gemini API integration for TalkFlo
 * Handles audio transcription and text processing
 */

// Types intentionally not imported to avoid unused warnings

// Environment variables validation
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_AUDIO_API_URL = process.env.GEMINI_AUDIO_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
const GEMINI_PRO_API_URL = process.env.GEMINI_PRO_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

if (!GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set. Gemini features will not work.')
}

/**
 * Transcribe audio file using Google Gemini 2.5 Flash
 */
export async function transcribeAudioWithGemini(audioUrl: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured')
  }

  try {
    // Download audio file
    const audioResponse = await fetch(audioUrl)
    if (!audioResponse.ok) {
      throw new Error('Failed to download audio file')
    }

    const audioBuffer = await audioResponse.arrayBuffer()
    const audioBase64 = Buffer.from(audioBuffer).toString('base64')

    // Prepare request for Gemini Audio
    const requestBody = {
      contents: [{
        parts: [{
          inline_data: {
            mime_type: audioResponse.headers.get('content-type') || 'audio/mpeg',
            data: audioBase64
          }
        }, {
          text: "Please transcribe this audio file accurately. Return only the transcription text."
        }]
      }],
      generation_config: {
        temperature: 0.1,
        top_p: 0.8,
        max_output_tokens: 8192
      }
    }

    // Make API call to Gemini Audio (2.5 Flash)
    const response = await fetch(`${GEMINI_AUDIO_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini Audio API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    
    if (!result.candidates || result.candidates.length === 0) {
      throw new Error('No transcription candidates returned')
    }

    const transcript = result.candidates[0].content?.parts?.[0]?.text
    if (!transcript) {
      throw new Error('No transcript text found in response')
    }

    return transcript.trim()

  } catch (error) {
    console.error('Gemini transcription error:', error)
    throw error
  }
}

/**
 * Process and rewrite text using Gemini 2.5 Pro
 */
export async function processTextWithGemini(transcript: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured')
  }

  try {
    const prompt = `Please rewrite and improve the following transcript into a well-structured, readable note. 

Instructions:
- Organize the content with clear headings and sections
- Fix any grammar or transcription errors
- Maintain the original meaning and intent
- Add bullet points for key information
- Include a brief summary at the end
- Use markdown formatting for better readability

Original transcript:
${transcript}`

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generation_config: {
        temperature: 0.3,
        top_p: 0.8,
        max_output_tokens: 8192
      }
    }

    // Make API call to Gemini 2.5 Pro
    const response = await fetch(`${GEMINI_PRO_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini Pro API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    
    if (!result.candidates || result.candidates.length === 0) {
      throw new Error('No processing candidates returned')
    }

    const processedContent = result.candidates[0].content?.parts?.[0]?.text
    if (!processedContent) {
      throw new Error('No processed content found in response')
    }

    return processedContent.trim()

  } catch (error) {
    console.error('Gemini processing error:', error)
    throw error
  }
}

/**
 * Rewrite transcript with custom user instructions using Gemini 2.5 Pro
 */
export async function rewriteTranscriptWithGemini(transcript: string, instructions: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured')
  }

  try {
    const prompt = `You are an expert writing assistant.
Rewrite the original transcript strictly following the user's instructions.
OUTPUT RULES (must follow all):
- Return ONLY the rewritten note body. Do not include any explanations, prefaces, or closing remarks.
- Plain text only (no Markdown). Do NOT use asterisks, backticks, underscores, or any other rich‑text markers.
- Use simple formatting with blank lines between paragraphs.
- For lists, use hyphen bullets: - followed by a space. Do NOT use asterisks for bullets.
- Keep the original meaning and facts. Improve clarity, readability, and structure.
- If instructions conflict with these rules, follow the rules above first, then the instructions.

User instructions:
${instructions}

Original transcript:
${transcript}`

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generation_config: {
        temperature: 0.3,
        top_p: 0.8,
        max_output_tokens: 8192
      }
    }

    const response = await fetch(`${GEMINI_PRO_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini rewrite error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      throw new Error('No rewrite content found in response')
    }
    return text.trim()
  } catch (error) {
    console.error('Gemini rewrite error:', error)
    throw error
  }
}

/**
 * Generate a title from processed content using Gemini
 */
export async function generateTitleWithGemini(content: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured')
  }

  try {
    const prompt = `Based on the following content, generate a concise, descriptive title (maximum 60 characters). The title should capture the main topic or theme of the content.

Content:
${content.substring(0, 1000)}...

Please respond with only the title, no additional text or formatting.`

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generation_config: {
        temperature: 0.4,
        top_p: 0.8,
        max_output_tokens: 100
      }
    }

    // Make API call to Gemini Pro
    const response = await fetch(`${GEMINI_PRO_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini title generation error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    
    if (!result.candidates || result.candidates.length === 0) {
      throw new Error('No title candidates returned')
    }

    const title = result.candidates[0].content?.parts?.[0]?.text
    if (!title) {
      throw new Error('No title found in response')
    }

    // Clean and limit title length
    const cleanTitle = title.trim().replace(/^["']|["']$/g, '') // Remove quotes
    return cleanTitle.length > 60 ? cleanTitle.substring(0, 60).trim() + '...' : cleanTitle

  } catch (error) {
    console.error('Gemini title generation error:', error)
    // Return a fallback title
    return `Audio Note - ${new Date().toLocaleDateString()}`
  }
}