import { NextRequest, NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/models';

export const runtime = 'nodejs';

async function analyzeImageWithVision(file: File): Promise<string> {
  try {
    const client = getOpenAIClient();
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    
    const response = await client.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this image and describe what you see in detail. Include any text, objects, people, colors, composition, and context you can identify.' },
          { type: 'image_url', image_url: { url: `data:${file.type};base64,${base64}` } }
        ]
      }],
      max_tokens: 500
    });
    
    return response.choices[0]?.message?.content || 'Unable to analyze image';
  } catch (error) {
    console.error('Vision API error:', error);
    return `Image analysis for ${file.name}: This appears to be a ${file.type} image file. Advanced image analysis would be available with proper OpenAI Vision API configuration. Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

async function extractPDFText(file: File): Promise<string> {
  try {
    const pdf = (await import('pdf-parse')).default;
    const buffer = await file.arrayBuffer();
    const data = await pdf(Buffer.from(buffer));
    
    if (!data.text || data.text.trim().length === 0) {
      return `PDF file ${file.name} appears to be empty or contains only images/scanned content that requires OCR processing.`;
    }
    
    const wordCount = data.text.split(/\s+/).length;
    const pageCount = data.numpages;
    
    return `PDF Content from ${file.name}:\n\nPages: ${pageCount}\nWord Count: ${wordCount}\n\nExtracted Text:\n${data.text.substring(0, 2000)}${data.text.length > 2000 ? '...\n\n[Content truncated - full text extracted successfully]' : ''}`;
  } catch (error) {
    console.error('PDF extraction error:', error);
    return `PDF extraction error for ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}. The file may be corrupted, password-protected, or in an unsupported format.`;
  }
}

async function processTextFile(file: File): Promise<string> {
  try {
    return await file.text();
  } catch (error) {
    return `[Error reading text file: ${error instanceof Error ? error.message : 'Unknown error'}]`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File too large (max 10MB)',
        name: file.name,
        size: file.size,
        type: file.type,
      }, { status: 400 });
    }

    let analysis = '';
    let content = '';

    try {
      if (file.type.startsWith('image/')) {
        analysis = await analyzeImageWithVision(file);
        content = `Image Analysis: ${analysis}`;
      } else if (file.type === 'application/pdf') {
        content = await extractPDFText(file);
      } else if (file.type.startsWith('text/')) {
        content = await processTextFile(file);
      } else {
        content = `[File type ${file.type} - content extraction not supported]`;
      }

      return NextResponse.json({
        success: true,
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
          content: content.substring(0, 2000), // Limit content length
          analysis,
          processedAt: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      return NextResponse.json({
        error: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        name: file.name,
        size: file.size,
        type: file.type,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('File analysis error:', error);
    return NextResponse.json({ error: 'File analysis failed' }, { status: 500 });
  }
}
