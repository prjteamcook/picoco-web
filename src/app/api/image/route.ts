import { NextRequest, NextResponse } from 'next/server';

// 임시 메모리 저장소 (실제 프로덕션에서는 Redis 등을 사용)
const imageStore = new Map<string, string>();

export async function POST(request: NextRequest) {
  try {
    const { imageData } = await request.json();
    
    if (!imageData) {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
    }

    // 고유한 세션 ID 생성
    const sessionId = crypto.randomUUID();
    
    // 이미지 데이터를 메모리에 저장 (5분 후 자동 삭제)
    imageStore.set(sessionId, imageData);
    
    // 5분 후 자동 삭제
    setTimeout(() => {
      imageStore.delete(sessionId);
      console.log(`🗑️ Image session ${sessionId} expired and deleted`);
    }, 5 * 60 * 1000); // 5분

    console.log(`💾 Image stored with session ID: ${sessionId}`);
    console.log(`📊 Image size: ${imageData.length} characters`);
    
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

    const imageData = imageStore.get(sessionId);
    
    if (!imageData) {
      return NextResponse.json({ error: 'Image not found or expired' }, { status: 404 });
    }

    console.log(`📤 Image retrieved for session ID: ${sessionId}`);
    
    return NextResponse.json({ 
      imageData,
      success: true 
    });

  } catch (error) {
    console.error('❌ Failed to retrieve image:', error);
    return NextResponse.json({ error: 'Failed to retrieve image' }, { status: 500 });
  }
}
