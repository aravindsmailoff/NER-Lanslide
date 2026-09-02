import { NextRequest, NextResponse } from 'next/server';
import { incidentStore } from '@/lib/incidentStore';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, assignedUnit, notes } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status field is required' }, { status: 400 });
    }

    const updated = incidentStore.updateIncidentStatus(id, status, assignedUnit, notes);
    if (!updated) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
