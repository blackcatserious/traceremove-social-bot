import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

let metricsStore = {
  activeConversations: 0,
  totalRequests: 0,
  successfulRequests: 0,
  errorCount: 0,
  responseTimes: [] as number[],
  modelUsage: {} as Record<string, number>,
  lastUpdated: new Date(),
};

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const timeSinceUpdate = now.getTime() - metricsStore.lastUpdated.getTime();
    
    if (timeSinceUpdate > 60000) {
      metricsStore.activeConversations = Math.max(0, metricsStore.activeConversations - 1);
    }
    
    const averageResponseTime = metricsStore.responseTimes.length > 0
      ? metricsStore.responseTimes.reduce((a, b) => a + b, 0) / metricsStore.responseTimes.length / 1000
      : 1.2;
    
    const errorRate = metricsStore.totalRequests > 0
      ? metricsStore.errorCount / metricsStore.totalRequests
      : 0;
    
    const metrics = {
      activeConversations: metricsStore.activeConversations,
      averageResponseTime,
      errorRate,
      modelUsage: metricsStore.modelUsage,
      totalRequests: metricsStore.totalRequests,
      successfulRequests: metricsStore.successfulRequests,
      timestamp: now.toISOString(),
    };
    
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Realtime analytics error:', error);
    return NextResponse.json({
      activeConversations: 0,
      averageResponseTime: 0,
      errorRate: 0,
      modelUsage: {},
      totalRequests: 0,
      successfulRequests: 0,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();
    
    switch (type) {
      case 'conversation_start':
        metricsStore.activeConversations++;
        break;
      case 'conversation_end':
        metricsStore.activeConversations = Math.max(0, metricsStore.activeConversations - 1);
        break;
      case 'request_success':
        metricsStore.totalRequests++;
        metricsStore.successfulRequests++;
        if (data.responseTime) {
          metricsStore.responseTimes.push(data.responseTime);
          if (metricsStore.responseTimes.length > 100) {
            metricsStore.responseTimes = metricsStore.responseTimes.slice(-50);
          }
        }
        if (data.model) {
          metricsStore.modelUsage[data.model] = (metricsStore.modelUsage[data.model] || 0) + 1;
        }
        break;
      case 'request_error':
        metricsStore.totalRequests++;
        metricsStore.errorCount++;
        break;
    }
    
    metricsStore.lastUpdated = new Date();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Realtime analytics update error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
