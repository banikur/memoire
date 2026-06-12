import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const store = getStore();
  
  const photo = store.find(p => p.id === id);
  if (!photo) return new NextResponse('Photo not found', { status: 404 });
  
  return NextResponse.json(photo);
}
