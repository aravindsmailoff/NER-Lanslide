import { NextRequest } from 'next/server';
import { incidentStore } from '@/lib/incidentStore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial welcome/connected frame
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: 'LIVE_RADAR_ONLINE', timestamp: Date.now() })}\n\n`)
      );

      const onIncidentCreated = (incident: any) => {
        controller.enqueue(
          encoder.encode(`event: INCIDENT_CREATED\ndata: ${JSON.stringify(incident)}\n\n`)
        );
      };

      const onIncidentUpdated = (incident: any) => {
        controller.enqueue(
          encoder.encode(`event: INCIDENT_UPDATED\ndata: ${JSON.stringify(incident)}\n\n`)
        );
      };

      const onAdvisoryCreated = (advisory: any) => {
        controller.enqueue(
          encoder.encode(`event: ADVISORY_CREATED\ndata: ${JSON.stringify(advisory)}\n\n`)
        );
      };

      incidentStore.events.on('INCIDENT_CREATED', onIncidentCreated);
      incidentStore.events.on('INCIDENT_UPDATED', onIncidentUpdated);
      incidentStore.events.on('ADVISORY_CREATED', onAdvisoryCreated);

      // Keepalive heartbeat comment
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          clearInterval(interval);
        }
      }, 15000);

      // Clean up when request aborted
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        incidentStore.events.off('INCIDENT_CREATED', onIncidentCreated);
        incidentStore.events.off('INCIDENT_UPDATED', onIncidentUpdated);
        incidentStore.events.off('ADVISORY_CREATED', onAdvisoryCreated);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
