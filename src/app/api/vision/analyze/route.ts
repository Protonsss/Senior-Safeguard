// AI Vision Analysis API - Analyze screen captures to provide context-aware help
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI with GPT-4 Vision
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { image, prompt, language = 'en' } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'Missing image data' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn('[Vision] OpenAI API key not configured - returning mock response');
      return NextResponse.json({
        analysis: "I can see your screen now! (Note: OpenAI API key not configured for full AI analysis. Add OPENAI_API_KEY to enable GPT-4 Vision.)",
        suggestions: [
          "Set up OPENAI_API_KEY environment variable",
          "The screen capture feature is working correctly",
          "AI vision will provide detailed analysis once API key is added"
        ]
      });
    }

    console.log('[Vision] Analyzing screen with GPT-4 Vision...');
    
    // Prepare system prompt based on language - BE PROACTIVE AND SPECIFIC
    const systemPrompts: Record<string, string> = {
      en: 'You are a confident, expert AI assistant with perfect vision. Your job is to immediately identify EXACTLY what application, website, or screen the senior is looking at. Be specific: "You are in a Google Meet video call with 9 participants" not "You are in a video call". Identify the app name, what they are doing, and proactively suggest what they might need help with. Be warm but CONFIDENT and SPECIFIC. Never ask them to describe what they see - YOU can see it.',
      zh: '你是一个自信的、专家级的AI助手，拥有完美的视觉能力。你的工作是立即准确识别老年人正在查看的应用程序、网站或屏幕。要具体："你正在进行有9位参与者的Google Meet视频通话"，而不是"你在视频通话中"。识别应用名称、他们在做什么，并主动建议他们可能需要什么帮助。要温暖但要自信和具体。永远不要要求他们描述他们看到的东西 - 你能看到。',
      hi: 'आप एक आत्मविश्वासी, विशेषज्ञ AI सहायक हैं जिनके पास परफेक्ट विज़न है। आपका काम है तुरंत पहचानना कि वरिष्ठ किस एप्लिकेशन, वेबसाइट या स्क्रीन को देख रहे हैं। विशिष्ट रहें: "आप 9 प्रतिभागियों के साथ Google Meet वीडियो कॉल में हैं" न कि "आप वीडियो कॉल में हैं"।',
      ta: 'நீங்கள் ஒரு நம்பிக்கையான, நிபுணர் AI உதவியாளர் சரியான பார்வை கொண்டவர். மூத்தவர் எந்த பயன்பாட்டை, இணையதளத்தை அல்லது திரையைப் பார்க்கிறார் என்பதை உடனடியாக அடையாளம் காண வேண்டும்.',
    };

    // Call GPT-4 Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          content: systemPrompts[language] || systemPrompts.en,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt || 'Identify the EXACT application or website on this screen. Be specific with names (Google Meet, Zoom, Gmail, etc). State what they are currently doing. Then ask what specific thing they need help with on THIS screen.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${image}`,
                detail: 'high'
              }
            }
          ]
        }
      ],
    });

    const analysis = response.choices[0]?.message?.content || 'Could not analyze screen';
    
    console.log('[Vision] ✅ Analysis complete:', analysis.substring(0, 100) + '...');

    // Extract key insights and suggestions
    const suggestions = extractSuggestions(analysis);

    return NextResponse.json({
      analysis,
      suggestions,
      confidence: response.choices[0]?.finish_reason === 'stop' ? 'high' : 'medium',
    });

  } catch (error: any) {
    console.error('[Vision] ❌ Error analyzing screen:', error);
    
    return NextResponse.json(
      {
        error: 'vision_analysis_failed',
        message: 'Could not analyze screen',
        debug: error.message,
      },
      { status: 500 }
    );
  }
}

function extractSuggestions(analysis: string): string[] {
  // Extract actionable suggestions from the analysis
  const suggestions: string[] = [];
  
  // Look for numbered lists or bullet points
  const lines = analysis.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.match(/^[\d\-\*•]\./)) {
      suggestions.push(trimmed.replace(/^[\d\-\*•]\.?\s*/, ''));
    }
  }
  
  // If no clear suggestions, return the whole analysis as one suggestion
  if (suggestions.length === 0) {
    suggestions.push(analysis);
  }
  
  return suggestions.slice(0, 5); // Limit to top 5 suggestions
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

