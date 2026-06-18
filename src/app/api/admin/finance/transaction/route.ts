import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const auth = await checkAuth(['admin']);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { type, amount, category, description, date } = body;

    if (!type || !amount || !category || !date) {
      return NextResponse.json(
        { success: false, error: 'Kolom type, amount, category, dan date wajib diisi' },
        { status: 400 }
      );
    }

    const transaction = await prisma.finance.create({
      data: {
        type,
        amount: parseFloat(amount),
        category,
        description: description || '',
        date,
        created_by: auth.user.id
      }
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
