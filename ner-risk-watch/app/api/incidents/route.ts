import { NextRequest, NextResponse } from 'next/server';
import { incidentStore } from '@/lib/incidentStore';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const urgency = searchParams.get('urgency') || undefined;
  const sector = searchParams.get('sector') || undefined;
  const search = searchParams.get('search') || undefined;

  const incidents = incidentStore.getIncidents({ status, urgency, sector, search });
  return NextResponse.json(incidents);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body) {
      return NextResponse.json({ error: 'Missing payload' }, { status: 400 });
    }

    const created = incidentStore.addIncident(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
