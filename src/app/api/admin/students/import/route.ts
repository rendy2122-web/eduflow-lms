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
    const { students } = body;

    if (!students || !Array.isArray(students)) {
      return NextResponse.json({ success: false, error: 'Format data tidak valid' }, { status: 400 });
    }

    let successCount = 0;
    let parentCreatedCount = 0;
    let classCreatedCount = 0;

    for (const item of students) {
      const { name, email, nisn, className, parentName, parentEmail, parentPhone, alamat, telepon } = item;

      if (!name || !email || !nisn) {
        continue;
      }

      // Check duplicate student email
      const existingEmail = await prisma.user.findUnique({
        where: { email }
      });
      if (existingEmail) {
        continue;
      }

      // Check duplicate NISN
      const existingNisn = await prisma.profile.findUnique({
        where: { nisn_or_nip: nisn }
      });
      if (existingNisn) {
        continue;
      }

      // Resolve class
      let classId: string | null = null;
      if (className && className.trim()) {
        const trimmedClassName = className.trim();
        let classRecord = await prisma.class.findFirst({
          where: { name: trimmedClassName }
        });
        if (!classRecord) {
          classRecord = await prisma.class.create({
            data: {
              name: trimmedClassName,
              description: `Kelas ${trimmedClassName} (Dibuat otomatis via Impor)`
            }
          });
          classCreatedCount++;
        }
        classId = classRecord.id;
      }

      // Resolve parent
      let parentId: string | null = null;
      if (parentEmail && parentEmail.trim()) {
        const trimmedParentEmail = parentEmail.trim();
        let parentRecord = await prisma.user.findUnique({
          where: { email: trimmedParentEmail }
        });
        if (!parentRecord) {
          parentRecord = await prisma.user.create({
            data: {
              nama: parentName || 'Orang Tua Siswa',
              email: trimmedParentEmail,
              password_hash: 'ortu123',
              role: 'orang_tua'
            }
          });
          await prisma.profile.create({
            data: {
              user_id: parentRecord.id,
              telepon: parentPhone || ''
            }
          });
          parentCreatedCount++;
        }
        parentId = parentRecord.id;
      }

      // Create student
      const newStudent = await prisma.user.create({
        data: {
          nama: name,
          email,
          password_hash: 'siswa123',
          role: 'siswa'
        }
      });

      await prisma.profile.create({
        data: {
          user_id: newStudent.id,
          class_id: classId,
          parent_id: parentId,
          nisn_or_nip: nisn,
          alamat: alamat || '',
          telepon: telepon || ''
        }
      });

      successCount++;
    }

    return NextResponse.json({
      success: true,
      importedStudents: successCount,
      createdParents: parentCreatedCount,
      createdClasses: classCreatedCount
    });
  } catch (err: any) {
    console.error('Import students error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
