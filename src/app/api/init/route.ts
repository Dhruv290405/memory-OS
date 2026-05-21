import { initializeMemoryOS } from '@/lib/init';

export async function GET() {
  try {
    await initializeMemoryOS();
    return Response.json({ status: 'initialized' });
  } catch (error) {
    console.error('Init error:', error);
    return Response.json({ error: 'Initialization failed' }, { status: 500 });
  }
}
