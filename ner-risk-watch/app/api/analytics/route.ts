import { NextResponse } from 'next/server';
import { incidentStore } from '@/lib/incidentStore';

export async function GET() {
  const analytics = incidentStore.getAnalytics();
  return NextResponse.json(analytics);
}
