const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Wiping existing database...');
  
  // Wipe all tables in order of relationships to prevent foreign key issues
  await prisma.examAttempt.deleteMany();
  await prisma.examQuestion.deleteMany();
  await prisma.exam.deleteMany();
  
  await prisma.finance.deleteMany();
  await prisma.tahfidzRecord.deleteMany();
  await prisma.staffAttendance.deleteMany();
  await prisma.studentAttendance.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.task.deleteMany();
  await prisma.material.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.class.deleteMany();
  await prisma.habitLog.deleteMany();
  await prisma.communicationLog.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.user.deleteMany();

  console.log('Database wiped successfully! Start seeding Grades 1-6 SD...');

  // 1. Create Classes for SD (Grade 1 to 6)
  const classNames = [
    'Kelas 1-SD',
    'Kelas 2-SD',
    'Kelas 3-SD',
    'Kelas 4-SD',
    'Kelas 5-SD',
    'Kelas 6-SD'
  ];
  
  const classes = [];
  for (const name of classNames) {
    const cls = await prisma.class.create({
      data: {
        name,
        description: `Jenjang Sekolah Dasar - ${name}`
      }
    });
    classes.push(cls);
  }

  // 2. Create Users
  // Admin Sarah
  const adminSarah = await prisma.user.create({
    data: {
      email: 'admin@sekolah.sch.id',
      password_hash: 'admin123',
      role: 'admin',
      nama: 'Sarah (Admin)'
    }
  });

  // Teacher Sarah
  const guruSarah = await prisma.user.create({
    data: {
      email: 'guru@sekolah.sch.id',
      password_hash: 'guru123',
      role: 'guru',
      nama: 'Ms. Sarah Johnson'
    }
  });

  // Parents
  const parentsData = [
    { email: 'ortu@sekolah.sch.id', nama: 'Pak Andi (Wali Bilal & Budi)' },
    { email: 'ortu2@sekolah.sch.id', nama: 'Ibu Rina (Wali Aisyah)' },
    { email: 'ortu3@sekolah.sch.id', nama: 'Pak Eko (Wali Chandra)' },
    { email: 'ortu4@sekolah.sch.id', nama: 'Ibu Sita (Wali Dian)' },
    { email: 'ortu6@sekolah.sch.id', nama: 'Pak Rudi (Wali Fatimah)' }
  ];
  
  const parents = {};
  for (const p of parentsData) {
    const parentUser = await prisma.user.create({
      data: {
        email: p.email,
        password_hash: 'ortu123',
        role: 'orang_tua',
        nama: p.nama
      }
    });
    parents[p.email] = parentUser;
    
    await prisma.profile.create({
      data: {
        user_id: parentUser.id,
        nisn_or_nip: `NIP_ORTU_${p.email.split('@')[0].toUpperCase()}`,
        alamat: 'Jl. Kenanga No. 8, Jakarta',
        telepon: '081344556677'
      }
    });
  }

  // Students (Grades 1 to 6 SD)
  const studentsData = [
    { email: 'budi@siswa.sch.id', nama: 'Budi Santoso', className: 'Kelas 1-SD', parentEmail: 'ortu@sekolah.sch.id', nisn: 'NISN101' },
    { email: 'aisyah@siswa.sch.id', nama: 'Aisyah Humaira', className: 'Kelas 2-SD', parentEmail: 'ortu2@sekolah.sch.id', nisn: 'NISN102' },
    { email: 'chandra@siswa.sch.id', nama: 'Chandra Wijaya', className: 'Kelas 3-SD', parentEmail: 'ortu3@sekolah.sch.id', nisn: 'NISN103' },
    { email: 'dian@siswa.sch.id', nama: 'Dian Pratama', className: 'Kelas 4-SD', parentEmail: 'ortu4@sekolah.sch.id', nisn: 'NISN104' },
    { email: 'siswa@sekolah.sch.id', nama: 'Bilal Al-Mansoori', className: 'Kelas 5-SD', parentEmail: 'ortu@sekolah.sch.id', nisn: 'NISN105' },
    { email: 'fatimah@siswa.sch.id', nama: 'Fatimah Azzahra', className: 'Kelas 6-SD', parentEmail: 'ortu6@sekolah.sch.id', nisn: 'NISN106' }
  ];

  const students = {};
  for (const s of studentsData) {
    const studentUser = await prisma.user.create({
      data: {
        email: s.email,
        password_hash: 'siswa123',
        role: 'siswa',
        nama: s.nama
      }
    });
    students[s.email] = studentUser;

    const cls = classes.find(c => c.name === s.className);
    const parent = parents[s.parentEmail];

    await prisma.profile.create({
      data: {
        user_id: studentUser.id,
        parent_id: parent ? parent.id : null,
        class_id: cls ? cls.id : null,
        nisn_or_nip: s.nisn,
        alamat: 'Jl. Merdeka No. ' + s.nisn.substring(4),
        telepon: '0856' + s.nisn.substring(4) + '8899',
        rpg_level: s.email === 'siswa@sekolah.sch.id' ? 4 : 2,
        rpg_xp: s.email === 'siswa@sekolah.sch.id' ? 380 : 120,
        rpg_gold: s.email === 'siswa@sekolah.sch.id' ? 240 : 150
      }
    });
  }

  // Profile for Admin and Guru
  await prisma.profile.create({
    data: {
      user_id: adminSarah.id,
      nisn_or_nip: 'NIP99901',
      alamat: 'Jl. Melati No. 4, Jakarta',
      telepon: '081234567890'
    }
  });

  await prisma.profile.create({
    data: {
      user_id: guruSarah.id,
      nisn_or_nip: 'NIP88802',
      alamat: 'Jl. Mawar No. 12, Bandung',
      telepon: '081298765432'
    }
  });

  // 3. Subjects (Mata Pelajaran) for each Grade 1-6 SD
  const subjectList = [
    { className: 'Kelas 1-SD', name: 'Matematika 1', code: 'MATH101' },
    { className: 'Kelas 1-SD', name: 'Bahasa Indonesia 1', code: 'IND101' },
    { className: 'Kelas 2-SD', name: 'Matematika 2', code: 'MATH201' },
    { className: 'Kelas 2-SD', name: 'Agama Islam 2', code: 'ISL201' },
    { className: 'Kelas 3-SD', name: 'Matematika 3', code: 'MATH301' },
    { className: 'Kelas 3-SD', name: 'IPA 3', code: 'SCI301' },
    { className: 'Kelas 4-SD', name: 'Matematika 4', code: 'MATH401' },
    { className: 'Kelas 4-SD', name: 'IPS 4', code: 'SOC401' },
    { className: 'Kelas 5-SD', name: 'Matematika 5', code: 'MATH501' },
    { className: 'Kelas 5-SD', name: 'IPAS 5', code: 'SCI501' },
    { className: 'Kelas 5-SD', name: 'Bahasa Indonesia 5', code: 'IND501' },
    { className: 'Kelas 6-SD', name: 'Matematika 6', code: 'MATH601' },
    { className: 'Kelas 6-SD', name: 'IPA 6', code: 'SCI601' }
  ];

  const subjects = [];
  for (const sub of subjectList) {
    const cls = classes.find(c => c.name === sub.className);
    if (cls) {
      const dbSub = await prisma.subject.create({
        data: {
          name: sub.name,
          code: sub.code,
          class_id: cls.id,
          teacher_id: guruSarah.id
        }
      });
      subjects.push({ ...sub, id: dbSub.id });
    }
  }

  // 4. Materials (Materi Pembelajaran)
  for (const sub of subjects) {
    await prisma.material.create({
      data: {
        subject_id: sub.id,
        title: `Bab 1: Konsep Dasar - ${sub.name}`,
        description: `[Materi: Bab 1] [Estimasi Membaca: 30 Menit]\nModul pengenalan ringkas untuk pelajaran ${sub.name}.`,
        file_url: `/materials/modul_${sub.code.toLowerCase()}.pdf`
      }
    });
  }

  // 5. Tasks & Submissions (Tugas & Pengumpulan)
  for (const s of studentsData) {
    const studentUser = students[s.email];
    const classSubjects = subjects.filter(sub => sub.className === s.className);
    
    for (const sub of classSubjects) {
      // Task 1: PR Mandiri (Tipe: Tulis Tangan)
      const task1 = await prisma.task.create({
        data: {
          subject_id: sub.id,
          title: `Tugas Harian 1: Konsep ${sub.name}`,
          description: `[Tipe Pengumpulan: Tulis Tangan Fisik] [Bobot: 20%]\nKerjakan latihan pemahaman di lembar folio.`,
          deadline: new Date('2026-06-01T23:59:00Z')
        }
      });

      // Grade 85 (Graded)
      await prisma.submission.create({
        data: {
          task_id: task1.id,
          student_id: studentUser.id,
          file_url: `/submissions/${s.email.split('@')[0]}_tugas1.pdf`,
          score: 85,
          graded_at: new Date('2026-06-03T10:00:00Z'),
          created_at: new Date('2026-06-01T15:00:00Z')
        }
      });

      // Task 2: Quiz Evaluasi (Tipe: PDF / Gambar)
      const task2 = await prisma.task.create({
        data: {
          subject_id: sub.id,
          title: `Quiz Pemahaman ${sub.name}`,
          description: `[Tipe Pengumpulan: PDF / Gambar] [Bobot: 10%]\nJawab pertanyaan kuis singkat mengenai bab pertama.`,
          deadline: new Date('2026-06-10T23:59:00Z')
        }
      });

      // Grade 95 (Graded)
      await prisma.submission.create({
        data: {
          task_id: task2.id,
          student_id: studentUser.id,
          file_url: `/submissions/${s.email.split('@')[0]}_quiz.pdf`,
          score: 95,
          graded_at: new Date('2026-06-11T09:00:00Z'),
          created_at: new Date('2026-06-09T14:00:00Z')
        }
      });

      // Task 3: Tugas Project Akhir (Tipe: PDF / Gambar) - Belum Dinilai / Pending
      const task3 = await prisma.task.create({
        data: {
          subject_id: sub.id,
          title: `Tugas Proyek Utama ${sub.name}`,
          description: `[Tipe Pengumpulan: PDF / Gambar] [Bobot: 30%]\nKumpulkan rangkuman komparatif dalam bentuk PDF.`,
          deadline: new Date('2026-06-25T23:59:00Z')
        }
      });

      // Submission but not graded yet (score: null)
      await prisma.submission.create({
        data: {
          task_id: task3.id,
          student_id: studentUser.id,
          file_url: `/submissions/${s.email.split('@')[0]}_project.pdf`,
          score: null,
          created_at: new Date('2026-06-11T16:00:00Z')
        }
      });
    }
  }

  // 6. Exams & Exam Attempts (Ujian & Hasil Pengerjaan)
  for (const s of studentsData) {
    const studentUser = students[s.email];
    const classSubjects = subjects.filter(sub => sub.className === s.className);
    
    for (const sub of classSubjects) {
      // Create Online Exam (UTS)
      const exam = await prisma.exam.create({
        data: {
          subject_id: sub.id,
          title: `UTS Online - ${sub.name}`,
          description: `Ujian Tengah Semester Online Berdurasi 30 Menit.`,
          duration: 30,
          deadline: new Date('2026-06-20T23:59:00Z')
        }
      });

      // Create Question 1
      const q1 = await prisma.examQuestion.create({
        data: {
          exam_id: exam.id,
          question_text: `Manakah dari berikut ini yang merupakan konsep dasar dari ${sub.name}?`,
          options: JSON.stringify(['Jawaban Tepat', 'Jawaban Keliru 1', 'Jawaban Keliru 2', 'Jawaban Keliru 3']),
          correct_option: 'A'
        }
      });

      // Create Question 2
      const q2 = await prisma.examQuestion.create({
        data: {
          exam_id: exam.id,
          question_text: `Bagaimana penerapan praktis ${sub.name} dalam kehidupan sehari-hari?`,
          options: JSON.stringify(['Bukan Opsi', 'Jawaban Tepat', 'Salah Opsi', 'Keliru Opsi']),
          correct_option: 'B'
        }
      });

      // Create Question 3
      const q3 = await prisma.examQuestion.create({
        data: {
          exam_id: exam.id,
          question_text: `Apa kesimpulan utama yang dapat diambil dari materi pertama ${sub.name}?`,
          options: JSON.stringify(['Salah Opsi', 'Keliru Opsi', 'Jawaban Tepat', 'Tidak Relevan']),
          correct_option: 'C'
        }
      });

      // Student Attempt with score 100
      const studentAnswers = {};
      studentAnswers[q1.id] = 'A';
      studentAnswers[q2.id] = 'B';
      studentAnswers[q3.id] = 'C';

      await prisma.examAttempt.create({
        data: {
          exam_id: exam.id,
          student_id: studentUser.id,
          score: 100,
          answers: JSON.stringify(studentAnswers),
          started_at: new Date('2026-06-08T09:00:00Z'),
          submitted_at: new Date('2026-06-08T09:25:00Z')
        }
      });
    }
  }

  // 7. Student Attendance (Absensi Murid)
  const dates = ['2026-06-08', '2026-06-09', '2026-06-10', '2026-06-11'];
  for (const date of dates) {
    for (const s of studentsData) {
      const studentUser = students[s.email];
      await prisma.studentAttendance.create({
        data: {
          student_id: studentUser.id,
          date,
          status: 'hadir',
          notes: 'Masuk tepat waktu'
        }
      });
    }
  }

  // 8. Staff Attendance (Absensi Guru & Staf)
  for (const date of dates) {
    await prisma.staffAttendance.create({
      data: {
        staff_id: guruSarah.id,
        date,
        clock_in: new Date(`${date}T06:45:00Z`),
        clock_out: new Date(`${date}T16:15:00Z`),
        status: 'hadir'
      }
    });

    await prisma.staffAttendance.create({
      data: {
        staff_id: adminSarah.id,
        date,
        clock_in: new Date(`${date}T07:00:00Z`),
        clock_out: new Date(`${date}T16:00:00Z`),
        status: 'hadir'
      }
    });
  }

  // 9. Tahfidz Records
  for (const s of studentsData) {
    const studentUser = students[s.email];
    await prisma.tahfidzRecord.create({
      data: {
        student_id: studentUser.id,
        teacher_id: guruSarah.id,
        date: '2026-06-11',
        surah_name: 'Surah An-Naba',
        start_ayat: 1,
        end_ayat: 20,
        status: 'lancar',
        notes: 'Hafalan sangat lancar dan tajwid makhraj terjaga baik.'
      }
    });
  }

  // 10. Habit Logs (Mutaba'ah Yaumiyah)
  for (const s of studentsData) {
    const studentUser = students[s.email];
    for (const date of dates) {
      await prisma.habitLog.create({
        data: {
          student_id: studentUser.id,
          date,
          subuh: 'masjid',
          dzuhur: 'masjid',
          ashar: 'masjid',
          maghrib: 'masjid',
          isya: 'masjid',
          duha: true,
          tahajjud: true,
          tadarrus: true,
          birrul_walidain: true,
          belajar: true,
          verified: true
        }
      });
    }
  }

  // 11. School Finances (Kas Keuangan)
  await prisma.finance.createMany({
    data: [
      {
        type: 'masuk',
        amount: 3500000,
        category: 'spp',
        description: 'Pemasukan Uang SPP Bulanan Kolektif SD Kelas 1-6',
        date: '2026-06-11',
        created_by: adminSarah.id
      },
      {
        type: 'keluar',
        amount: 850000,
        category: 'operasional',
        description: 'Pembelian Buku Tematik Pendamping dan Modul Guru',
        date: '2026-06-11',
        created_by: adminSarah.id
      },
      {
        type: 'masuk',
        amount: 1500000,
        category: 'donasi',
        description: 'Donasi Orang Tua Asuh untuk Program Beasiswa Hafidz SD',
        date: '2026-06-10',
        created_by: adminSarah.id
      }
    ]
  });

  // 12. Announcements
  await prisma.announcement.createMany({
    data: [
      {
        title: 'Pembukaan Tahun Ajaran Baru SD',
        content: 'Tahun ajaran baru untuk jenjang Kelas 1 s.d. 6 SD dimulai hari Senin depan. Mohon orang tua mempersiapkan perlengkapan anak.',
        category: 'akademik',
        target: 'semua',
        author_name: 'Sarah (Admin)',
        author_role: 'admin'
      },
      {
        title: 'UTS Online Serentak',
        content: 'UTS Online akan dilaksanakan serentak mulai hari Senin depan. Silakan akses modul latihan di dasbor.',
        category: 'akademik',
        target: 'siswa',
        author_name: 'Ms. Sarah Johnson',
        author_role: 'guru'
      }
    ]
  });

  // 13. Communication Logs (Buku Penghubung Chat)
  for (const s of studentsData) {
    const studentUser = students[s.email];
    await prisma.communicationLog.createMany({
      data: [
        {
          student_id: studentUser.id,
          sender_role: 'orang_tua',
          sender_name: `Orang Tua ${s.nama}`,
          message: `Bagaimana keaktifan belajar mandiri ${s.nama} di kelas hari ini?`,
          date: '2026-06-11'
        },
        {
          student_id: studentUser.id,
          sender_role: 'guru',
          sender_name: 'Ms. Sarah Johnson',
          message: `${s.nama} sangat aktif dan menyelesaikan semua porsi kuis dengan nilai sempurna. Adab belajarnya luar biasa.`,
          date: '2026-06-11'
        }
      ]
    });
  }

  console.log('Seeding completed successfully! Default accounts:');
  console.log(' - Admin: admin@sekolah.sch.id / admin123');
  console.log(' - Guru: guru@sekolah.sch.id / guru123');
  console.log(' - Ortu: ortu@sekolah.sch.id / ortu123');
  console.log(' - Siswa Bilal: siswa@sekolah.sch.id / siswa123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
