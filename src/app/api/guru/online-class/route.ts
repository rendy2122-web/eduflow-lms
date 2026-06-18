import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const classes = await prisma.onlineClass.findMany({
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      classes,
    });
  } catch (error: any) {
    console.error('Error fetching online classes:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, date, time, platform, link, class_name, subject_name, notes } = body;

    if (!title || !date || !time || !platform || !link || !class_name || !subject_name) {
      return NextResponse.json(
        { success: false, error: 'Semua kolom wajib diisi kecuali catatan' },
        { status: 400 }
      );
    }

    // Basic URL validation
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      return NextResponse.json(
        { success: false, error: 'Tautan pertemuan harus diawali dengan http:// atau https://' },
        { status: 400 }
      );
    }

    const newClass = await prisma.onlineClass.create({
      data: {
        title,
        date,
        time,
        platform,
        link,
        class_name,
        subject_name,
        notes: notes || '',
      },
    });

    return NextResponse.json({
      success: true,
      class: newClass,
    });
  } catch (error: any) {
    console.error('Error creating online class:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID kelas online wajib disertakan' },
        { status: 400 }
      );
    }

    await prisma.onlineClass.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Kelas online berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting online class:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
