import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await checkAuth(['admin', 'guru', 'siswa', 'orang_tua']);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      include: { profile: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
      },
      profile: {
        id: user.profile?.id,
        nisn_or_nip: user.profile?.nisn_or_nip || '',
        alamat: user.profile?.alamat || '',
        telepon: user.profile?.telepon || '',
        avatar_url: user.profile?.avatar_url || '',
        rpg_level: user.profile?.rpg_level || 1,
        rpg_xp: user.profile?.rpg_xp || 0,
        rpg_gold: user.profile?.rpg_gold || 50,
      }
    });
  } catch (err: any) {
    console.error('Error in GET /api/profile:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await checkAuth(['admin', 'guru', 'siswa', 'orang_tua']);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const body = await req.json();
    const { nama, alamat, telepon, avatarUrl, oldPassword, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      include: { profile: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User tidak ditemukan' }, { status: 404 });
    }

    // Handle Password Change if requested
    if (newPassword) {
      if (user.password_hash !== oldPassword) {
        return NextResponse.json({ success: false, error: 'Kata sandi lama tidak sesuai' }, { status: 400 });
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { password_hash: newPassword }
      });
    }

    // Update User Name
    if (nama && nama !== user.nama) {
      await prisma.user.update({
        where: { id: user.id },
        data: { nama }
      });
    }

    // Update Profile Fields
    if (user.profile) {
      await prisma.profile.update({
        where: { id: user.profile.id },
        data: {
          alamat: alamat !== undefined ? alamat : user.profile.alamat,
          telepon: telepon !== undefined ? telepon : user.profile.telepon,
          avatar_url: avatarUrl !== undefined ? avatarUrl : user.profile.avatar_url,
        }
      });
    } else {
      // Create profile if somehow not exist
      await prisma.profile.create({
        data: {
          user_id: user.id,
          alamat: alamat || '',
          telepon: telepon || '',
          avatar_url: avatarUrl || '',
        }
      });
    }

    return NextResponse.json({ success: true, message: 'Profil berhasil diperbarui' });
  } catch (err: any) {
    console.error('Error in POST /api/profile:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
