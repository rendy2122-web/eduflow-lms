import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch all announcements (newest first)
export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { created_at: 'desc' },
    });
    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

// POST: Create a new announcement OR Delete an announcement
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Handle DELETE action via POST body
    if (body.action === 'delete' && body.id) {
      await prisma.announcement.delete({
        where: { id: body.id },
      });
      return NextResponse.json({ success: true, message: 'Announcement deleted' });
    }

    // Handle CREATE action
    const { title, content, category, target, author_name, author_role } = body;

    if (!title || !content || !category || !target || !author_name || !author_role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        category,
        target,
        author_name,
        author_role,
      },
    });

    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    console.error('Error processing announcement:', error);
    return NextResponse.json({ error: 'Failed to process announcement' }, { status: 500 });
  }
}
