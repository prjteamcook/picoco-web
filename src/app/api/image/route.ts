import { NextRequest, NextResponse } from 'next/server';

// 임시 메모리 저장소 (실제 프로덕션에서는 Redis 등을 사용)
const imageStore = new Map<string, string>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageData, imageUrl } = body;
    
    if (!imageData && !imageUrl) {
      return NextResponse.json({ error: 'No image data or URL provided' }, { status: 400 });
    }

    // 고유한 세션 ID 생성
    const sessionId = crypto.randomUUID();
    
    // 이미지 데이터 또는 URL을 메모리에 저장 (5분 후 자동 삭제)
    imageStore.set(sessionId, imageUrl || imageData);
    
    // 5분 후 자동 삭제
    setTimeout(() => {
      imageStore.delete(sessionId);
      console.log(`🗑️ Image session ${sessionId} expired and deleted`);
    }, 5 * 60 * 1000); // 5분

    console.log(`💾 Image stored with session ID: ${sessionId}`);
    console.log(`📊 Image ${imageUrl ? 'URL' : 'data'} stored`);
    
    return NextResponse.json({ 
      sessionId,
      success: true,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('❌ Failed to store image:', error);
    return NextResponse.json({ error: 'Failed to store image' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json({ error: 'No session ID provided' }, { status: 400 });
    }

    const storedData = imageStore.get(sessionId);
    
    if (!storedData) {
      return NextResponse.json({ error: 'Image not found or expired' }, { status: 404 });
    }

    console.log(`📤 Image retrieved for session ID: ${sessionId}`);
    console.log(`🔍 Debug: Stored data preview:`, storedData.substring(0, 100) + '...');
    
    // URL인지 base64 데이터인지 확인
    const isUrl = storedData.startsWith('http://') || storedData.startsWith('https://') || storedData.startsWith('file://');
    console.log(`🔍 Debug: Is URL:`, isUrl);
    
    const response = { 
      imageData: isUrl ? null : storedData,
      imageUrl: isUrl ? storedData : null,
      success: true 
    };
    
    console.log(`🔍 Debug: Response:`, { 
      hasImageData: !!response.imageData, 
      hasImageUrl: !!response.imageUrl,
      success: response.success 
    });
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Failed to retrieve image:', error);
    return NextResponse.json({ error: 'Failed to retrieve image' }, { status: 500 });
  }
}
