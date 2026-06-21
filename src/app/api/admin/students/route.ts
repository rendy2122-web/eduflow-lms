import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET: Fetch all students with their class and parent/guardian info
export async function GET() {
  try {
    const auth = await checkAuth(['admin', 'guru']);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }
    // 1. Fetch all students
    const students = await prisma.user.findMany({
      where: { role: 'siswa' },
      include: {
        profile: {
          include: {
            class: true
          }
        }
      },
      orderBy: { nama: 'asc' }
    });

    // 2. Fetch all parents with profiles to resolve details
    const parents = await prisma.user.findMany({
      where: { role: 'orang_tua' },
      include: { profile: true }
    });

    const parentMap = new Map(parents.map(p => [p.id, p]));

    // 3. Map students to frontend format
    const formattedStudents = students.map((s) => {
      const parentUser = s.profile?.parent_id ? parentMap.get(s.profile.parent_id) : null;
      return {
        id: s.id,
        name: s.nama,
        email: s.email,
        nisn: s.profile?.nisn_or_nip || '',
        classId: s.profile?.class_id || '',
        className: s.profile?.class?.name || 'Belum Masuk Kelas',
        parentId: s.profile?.parent_id || '',
        parentName: parentUser ? parentUser.nama : 'Belum Terhubung',
        parentEmail: parentUser ? parentUser.email : '',
        parentPhone: parentUser ? parentUser.profile?.telepon || '' : '',
        alamat: s.profile?.alamat || '',
        telepon: s.profile?.telepon || '',
      };
    });

    // 4. Fetch all classes for input select dropdowns
    const classes = await prisma.class.findMany({
      orderBy: { name: 'asc' }
    });

    // 5. Format parent list for selector
    const parentList = parents.map(p => ({
      id: p.id,
      name: p.nama,
      email: p.email
    }));

    return NextResponse.json({
      success: true,
      students: formattedStudents,
      classes,
      parents: parentList
    });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Create a new student and profile
export async function POST(req: NextRequest) {
  try {
    const auth = await checkAuth(['admin']);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }
    const body = await req.json();
    const { name, email, nisn, classId, parentId, alamat, telepon } = body;

    if (!name || !email || !nisn) {
      return NextResponse.json(
        { success: false, error: 'Nama, Email, dan NISN wajib diisi' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar di sistem' },
        { status: 400 }
      );
    }

    // Check if NISN already exists
    if (nisn) {
      const existingNisn = await prisma.profile.findUnique({
        where: { nisn_or_nip: nisn }
      });
      if (existingNisn) {
        return NextResponse.json(
          { success: false, error: 'NISN sudah digunakan oleh murid lain' },
          { status: 400 }
        );
      }
    }

    // 1. Create User
    const newUser = await prisma.user.create({
      data: {
        nama: name,
        email,
        password_hash: 'siswa123', // default password
        role: 'siswa'
      }
    });

    // 2. Create Profile
    await prisma.profile.create({
      data: {
        user_id: newUser.id,
        class_id: classId || null,
        parent_id: parentId || null,
        nisn_or_nip: nisn || null,
        alamat: alamat || '',
        telepon: telepon || ''
      }
    });

    return NextResponse.json({ success: true, student: newUser });
  } catch (error: any) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update student profile
export async function PUT(req: NextRequest) {
  try {
    const auth = await checkAuth(['admin']);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }
    const body = await req.json();
    const { id, name, email, nisn, classId, parentId, alamat, telepon } = body;

    if (!id || !name || !email || !nisn) {
      return NextResponse.json(
        { success: false, error: 'ID, Nama, Email, dan NISN wajib diisi' },
        { status: 400 }
      );
    }

    // Check if email used by other user
    const existingEmail = await prisma.user.findFirst({
      where: { email, NOT: { id } }
    });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar di sistem' },
        { status: 400 }
      );
    }

    // Check if NISN used by other user
    const existingNisn = await prisma.profile.findFirst({
      where: { nisn_or_nip: nisn, NOT: { user_id: id } }
    });
    if (existingNisn) {
      return NextResponse.json(
        { success: false, error: 'NISN sudah digunakan oleh murid lain' },
        { status: 400 }
      );
    }

    // 1. Update User table
    await prisma.user.update({
      where: { id },
      data: { nama: name, email }
    });

    // 2. Upsert Profile table
    await prisma.profile.upsert({
      where: { user_id: id },
      update: {
        class_id: classId || null,
        parent_id: parentId || null,
        nisn_or_nip: nisn || null,
        alamat: alamat || '',
        telepon: telepon || ''
      },
      create: {
        user_id: id,
        class_id: classId || null,
        parent_id: parentId || null,
        nisn_or_nip: nisn || null,
        alamat: alamat || '',
        telepon: telepon || ''
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove student user
export async function DELETE(req: NextRequest) {
  try {
    const auth = await checkAuth(['admin']);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID murid wajib diisi' },
        { status: 400 }
      );
    }

    // Deleting User automatically deletes Profile because of Cascade relation
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
