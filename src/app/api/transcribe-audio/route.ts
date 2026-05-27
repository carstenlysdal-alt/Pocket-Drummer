import { NextRequest, NextResponse } from 'next/server';
import { TranscriptionService } from '@/lib/transcriptionService';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    
    let fileData: string | undefined;
    let mimeType: string | undefined;
    let fileName: string | undefined;
    let youtubeUrl: string | undefined;
    let klangioApiKey: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      youtubeUrl = formData.get('youtubeUrl') as string | null || undefined;
      klangioApiKey = formData.get('klangioApiKey') as string | null || undefined;

      if (file) {
        mimeType = file.type || 'audio/mp3';
        fileName = file.name;
        
        // Convert File to base64
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fileData = buffer.toString('base64');
      }
    } else {
      // Expect JSON
      const body = await req.json();
      youtubeUrl = body.youtubeUrl;
      fileData = body.fileData;
      mimeType = body.mimeType;
      fileName = body.fileName;
      klangioApiKey = body.klangioApiKey;
    }

    if (!fileData && !youtubeUrl) {
      return NextResponse.json(
        { error: "Du skal uploade en lydfil eller angive et YouTube-link." },
        { status: 400 }
      );
    }

    // Call the transcription service
    const result = await TranscriptionService.transcribe({
      fileData,
      youtubeUrl,
      mimeType,
      fileName,
      klangioApiKey
    });

    return NextResponse.json({
      xml: result.xml,
      logs: result.logs
    });
    
  } catch (error) {
    console.error("Fejl i /api/transcribe-audio:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Transskription fejlede: " + message },
      { status: 500 }
    );
  }
}
