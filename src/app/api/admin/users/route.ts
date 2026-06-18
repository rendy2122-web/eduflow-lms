import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Fetch users filtered by role, or return compatible teachers list
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get('role');
    const searchParam = searchParams.get('search') || '';

    // Backward Compatibility: If no roleParam is specified, return formatted teachers list
    if (!roleParam) {
      const teachers = await prisma.user.findMany({
        where: { role: 'guru' },
        include: { profile: true },
        orderBy: { nama: 'asc' }
      });

      const formattedTeachers = teachers.map((t, idx) => {
        const images = [
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        ];
        
        const subjects = ['Mathematics', 'Science', 'English', 'History', 'Arts'];

        return {
          id: t.id,
          name: t.nama,
          email: t.email,
          subject: subjects[idx % subjects.length],
          status: 'Active',
          image: images[idx % images.length]
        };
      });

      if (formattedTeachers.length === 1) {
        const mockTeachers = [
          { id: 'mock-1', name: 'Eva Jensen', email: 'eva@sekolah.sch.id', subject: 'Math', status: 'Active', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
          { id: 'mock-2', name: 'Mark Lee', email: 'mark@sekolah.sch.id', subject: 'Science', status: 'Active', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
          { id: 'mock-3', name: 'Chloe Garcia', email: 'chloe@sekolah.sch.id', subject: 'English', status: 'Active', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
          { id: 'mock-4', name: 'James Bond', email: 'james@sekolah.sch.id', subject: 'History', status: 'On Leave', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' }
        ];
        formattedTeachers.push(...mockTeachers);
      }

      return NextResponse.json({ success: true, teachers: formattedTeachers });
    }

    // New Endpoint Logic: Fetch users based on role and search query
    const whereClause: any = {};
    if (roleParam !== 'all') {
      whereClause.role = roleParam;
    }

    if (searchParam.trim() !== '') {
      const q = searchParam.toLowerCase();
      whereClause.OR = [
        { nama: { contains: q } },
        { email: { contains: q } }
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: { profile: true },
      orderBy: { nama: 'asc' }
    });

    const formattedUsers = users.map((u) => ({
      id: u.id,
      name: u.nama,
      email: u.email,
      role: u.role,
      identifier: u.profile?.nisn_or_nip || '',
      alamat: u.profile?.alamat || '',
      telepon: u.profile?.telepon || ''
    }));

    return NextResponse.json({ success: true, users: formattedUsers });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Create a new user account & profile
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, role, identifier, password, alamat, telepon } = body;

    if (!name || !email || !role) {
      return NextResponse.json(
        { success: false, error: 'Nama, Email, dan Peran wajib diisi' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email }
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar di sistem' },
        { status: 400 }
      );
    }

    // 1. Create User
    const newUser = await prisma.user.create({
      data: {
        nama: name,
        email,
        role,
        password_hash: password || 'password123'
      }
    });

    // 2. Create Profile
    await prisma.profile.create({
      data: {
        user_id: newUser.id,
        nisn_or_nip: identifier || null,
        alamat: alamat || '',
        telepon: telepon || ''
      }
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update user account & profile
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, email, role, identifier, password, alamat, telepon } = body;

    if (!id || !name || !email || !role) {
      return NextResponse.json(
        { success: false, error: 'ID, Nama, Email, dan Peran wajib diisi' },
        { status: 400 }
      );
    }

    // Check if email already exists for other user
    const existingEmail = await prisma.user.findFirst({
      where: { email, NOT: { id } }
    });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'Email sudah digunakan oleh akun lain' },
        { status: 400 }
      );
    }

    // 1. Update User
    const updateData: any = { nama: name, email, role };
    if (password) {
      updateData.password_hash = password;
    }

    await prisma.user.update({
      where: { id },
      data: updateData
    });

    // 2. Upsert Profile
    await prisma.profile.upsert({
      where: { user_id: id },
      update: {
        nisn_or_nip: identifier || null,
        alamat: alamat || '',
        telepon: telepon || ''
      },
      create: {
        user_id: id,
        nisn_or_nip: identifier || null,
        alamat: alamat || '',
        telepon: telepon || ''
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove user account
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID akun wajib diisi' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
