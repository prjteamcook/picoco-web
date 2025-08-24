import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// 임시 메모리 저장소 (실제 프로덕션에서는 Redis 등을 사용)
const imageStore = new Map<string, string>();

// CORS 헤더를 추가하는 헬퍼 함수
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// OPTIONS 요청 처리 (preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageData, imageUrl } = body;
    
    if (!imageData && !imageUrl) {
      return NextResponse.json({ error: 'No image data or URL provided' }, { status: 400 });
    }

    // 고유한 세션 ID 생성
    const sessionId = crypto.randomUUID();
    
    const dataToStore = imageUrl || imageData;
    console.log(`💾 Storing image with session ID: ${sessionId}`);
    console.log(`📊 Data type: ${imageUrl ? 'URL' : 'data'}`);
    console.log(`📊 Data length: ${dataToStore?.length || 0}`);
    console.log(`📊 Data starts with: ${dataToStore?.substring(0, 50) || 'N/A'}`);
    
    // 이미지 데이터 또는 URL을 메모리에 저장 (5분 후 자동 삭제)
    imageStore.set(sessionId, dataToStore);
    
    // 5분 후 자동 삭제
    setTimeout(() => {
      imageStore.delete(sessionId);
      console.log(`🗑️ Image session ${sessionId} expired and deleted`);
    }, 5 * 60 * 1000); // 5분
    
    return NextResponse.json({ 
      sessionId,
      success: true,
      message: 'Image uploaded successfully'
    }, {
      headers: corsHeaders(),
    });

  } catch (error) {
    console.error('❌ Failed to store image:', error);
    return NextResponse.json({ error: 'Failed to store image' }, { 
      status: 500,
      headers: corsHeaders(),
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json({ error: 'No session ID provided' }, { 
        status: 400,
        headers: corsHeaders(),
      });
    }

    const storedData = imageStore.get(sessionId);
    
    if (!storedData) {
      return NextResponse.json({ error: 'Image not found or expired' }, { 
        status: 404,
        headers: corsHeaders(),
      });
    }

    console.log(`📤 Image retrieved for session ID: ${sessionId}`);
    console.log(`🔍 Debug: Stored data length:`, storedData.length);
    console.log(`🔍 Debug: Stored data preview:`, storedData.substring(0, 100) + '...');
    console.log(`🔍 Debug: Stored data starts with 'data:':`, storedData.startsWith('data:'));
    console.log(`🔍 Debug: Stored data starts with 'http':`, storedData.startsWith('http'));
    
    // URL인지 base64 데이터인지 확인
    const isUrl = storedData.startsWith('http://') || storedData.startsWith('https://') || storedData.startsWith('file://');
    const isDataUrl = storedData.startsWith('data:');
    
    console.log(`🔍 Debug: Is URL:`, isUrl);
    console.log(`🔍 Debug: Is Data URL:`, isDataUrl);
    
    const response = { 
      imageData: (isUrl || !isDataUrl) ? null : storedData,
      imageUrl: isUrl ? storedData : null,
      success: true 
    };
    
    // If it's not a URL but also not a proper data URL, treat it as raw base64
    if (!isUrl && !isDataUrl && storedData.length > 100) {
      console.log(`🔍 Debug: Treating as raw base64, converting to data URL`);
      response.imageData = `data:image/jpeg;base64,${storedData}`;
    }
    
    console.log(`🔍 Debug: Final response:`, { 
      hasImageData: !!response.imageData, 
      hasImageUrl: !!response.imageUrl,
      imageDataLength: response.imageData?.length || 0,
      imageUrlLength: response.imageUrl?.length || 0,
      success: response.success 
    });
    
    return NextResponse.json(response, {
      headers: corsHeaders(),
    });

  } catch (error) {
    console.error('❌ Failed to retrieve image:', error);
    return NextResponse.json({ error: 'Failed to retrieve image' }, { 
      status: 500,
      headers: corsHeaders(),
    });
  }
}
