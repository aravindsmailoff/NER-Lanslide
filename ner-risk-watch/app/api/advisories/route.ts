import { NextRequest, NextResponse } from 'next/server';
import { incidentStore } from '@/lib/incidentStore';

export async function GET() {
  const advisories = incidentStore.getAdvisories();
  return NextResponse.json(advisories);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title || !body.level) {
      return NextResponse.json({ error: 'Title and level are required' }, { status: 400 });
    }

    const newAdvisory = {
      id: body.id || `ADV-MAN-${Date.now()}`,
      title: body.title,
      sector: body.sector || 'GLOBAL',
      type: body.type || 'Field Alert',
      level: body.level,
      time: body.time || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      description: body.description || '',
      tags: body.tags || ['Command Broadcast'],
    };

    const saved = incidentStore.addAdvisory(newAdvisory);
    return NextResponse.json(saved, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
