import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

async function analyzeImageWithVision(file: File): Promise<string> {
  return `Image analysis for ${file.name}: This appears to be a ${file.type} image file. Advanced image analysis would be available with OpenAI Vision API integration.`;
}

async function extractPDFText(file: File): Promise<string> {
  return `[PDF content extraction from ${file.name} would be implemented here using a PDF parsing library]`;
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
