import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file || !type) {
      return NextResponse.json(
        { success: false, error: 'File dan tipe harus diisi' },
        { status: 400 }
      );
    }

    // Read CSV file
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json(
        { success: false, error: 'File CSV kosong atau tidak valid' },
        { status: 400 }
      );
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const results = { success: 0, failed: 0, errors: [] as string[] };

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      try {
        if (type === 'students') {
          await importStudent(headers, values, results);
        } else if (type === 'teachers') {
          await importTeacher(headers, values, results);
        } else if (type === 'classes') {
          await importClass(headers, values, results);
        } else {
          results.failed++;
          results.errors.push(`Baris ${i + 1}: Tipe tidak dikenali`);
        }
      } catch (err: any) {
        results.failed++;
        results.errors.push(`Baris ${i + 1}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      result: results
    });
  } catch (error) {
    console.error('Error in bulk upload:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memproses upload' },
      { status: 500 }
    );
  }
}

async function importStudent(headers: string[], values: string[], results: any) {
  const data: any = {};
  headers.forEach((header, idx) => {
    data[header] = values[idx] || '';
  });

  if (!data.nama || !data.email || !data.kelas) {
    throw new Error('Field nama, email, dan kelas harus diisi');
  }

  // Find class
  const classData = await prisma.class.findFirst({
    where: { name: data.kelas }
  });

  if (!classData) {
    throw new Error(`Kelas "${data.kelas}" tidak ditemukan`);
  }

  // Create user (student)
  const student = await prisma.user.create({
    data: {
      email: data.email,
      password_hash: 'default123', // Default password, should be changed
      role: 'siswa',
      nama: data.nama
    }
  });

  // Create profile
  await prisma.profile.create({
    data: {
      user_id: student.id,
      class_id: classData.id,
      nisn_or_nip: data.nisn || null,
      telepon: data.telepon || null,
      alamat: data.alamat || null
    }
  });

  // If parent email provided, create parent user
  if (data.orangtuaemail) {
    const parent = await prisma.user.create({
      data: {
        email: data.orangtuaemail,
        password_hash: 'default123',
        role: 'orang_tua',
        nama: 'Orang Tua ' + data.nama
      }
    });

    // Update profile with parent_id
    await prisma.profile.update({
      where: { user_id: student.id },
      data: { parent_id: parent.id }
    });
  }

  results.success++;
}

async function importTeacher(headers: string[], values: string[], results: any) {
  const data: any = {};
  headers.forEach((header, idx) => {
    data[header] = values[idx] || '';
  });

  if (!data.nama || !data.email) {
    throw new Error('Field nama dan email harus diisi');
  }

  // Create user (teacher)
  const teacher = await prisma.user.create({
    data: {
      email: data.email,
      password_hash: 'default123',
      role: 'guru',
      nama: data.nama
    }
  });

  // Create subjects if provided
  const subjectFields = headers.filter(h => h.startsWith('mapel'));
  for (const field of subjectFields) {
    const subjectName = data[field];
    if (subjectName) {
      // Find or create class (default to first class)
      const classData = await prisma.class.findFirst();
      
      if (classData) {
        await prisma.subject.create({
          data: {
            name: subjectName,
            code: subjectName.substring(0, 4).toUpperCase(),
            class_id: classData.id,
            teacher_id: teacher.id
          }
        });
      }
    }
  }

  results.success++;
}

async function importClass(headers: string[], values: string[], results: any) {
  const data: any = {};
  headers.forEach((header, idx) => {
    data[header] = values[idx] || '';
  });

  if (!data.nama) {
    throw new Error('Field nama harus diisi');
  }

  await prisma.class.create({
    data: {
      name: data.nama,
      description: data.deskripsi || null
    }
  });

  results.success++;
}