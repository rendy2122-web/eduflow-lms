const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting dummy data seeding...\n');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.teachingSchedule.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.class.deleteMany();
  console.log('✅ Data cleared\n');

  // 1. Create Classes
  console.log('Creating classes...');
  const classes = [];
  const classNames = ['Kelas 1-A', 'Kelas 1-B', 'Kelas 2-A', 'Kelas 2-B', 'Kelas 3-A', 'Kelas 3-B', 'Kelas 4-A', 'Kelas 4-B', 'Kelas 5-A', 'Kelas 5-B'];
  
  for (const name of classNames) {
    const cls = await prisma.class.create({
      data: {
        name,
        description: `Kelas ${name} - Sekolah Dasar Islam Edutree`
      }
    });
    classes.push(cls);
    console.log(`  ✓ ${name}`);
  }

  // 2. Create Teachers (Guru)
  console.log('\nCreating teachers...');
  const teachers = [];
  const teacherData = [
    { nama: 'Sarah Jenkins', email: 'sarah.jenkins@edutree.sch.id', nip: '198501012001012001' },
    { nama: 'Ahmad Fauzi', email: 'ahmad.fauzi@edutree.sch.id', nip: '198702152002022002' },
    { nama: 'Fatimah Azzahra', email: 'fatimah.azzahra@edutree.sch.id', nip: '199003102003033003' },
    { nama: 'Muhammad Rizki', email: 'muhammad.rizki@edutree.sch.id', nip: '198805202004044004' },
    { nama: 'Aisyah Putri', email: 'aisyah.putri@edutree.sch.id', nip: '199207152005055005' },
    { nama: 'Budi Santoso', email: 'budi.santoso@edutree.sch.id', nip: '198612102006066006' },
    { nama: 'Nurul Hidayah', email: 'nurul.hidayah@edutree.sch.id', nip: '199108152007077007' },
    { nama: 'Andi Wijaya', email: 'andi.wijaya@edutree.sch.id', nip: '198909102008088008' },
    { nama: 'Dewi Sartika', email: 'dewi.sartika@edutree.sch.id', nip: '199204152009099009' },
    { nama: 'Rendi Pratama', email: 'rendi.pratama@edutree.sch.id', nip: '199006152010111010' }
  ];

  for (const data of teacherData) {
    const teacher = await prisma.user.create({
      data: {
        ...data,
        password_hash: 'default123',
        role: 'guru',
        profile: {
          create: {
            nisn_or_nip: data.nip,
            telepon: `0812${Math.floor(10000000 + Math.random() * 90000000)}`,
            alamat: 'Jakarta, Indonesia'
          }
        }
      },
      include: { profile: true }
    });
    teachers.push(teacher);
    console.log(`  ✓ ${data.nama}`);
  }

  // 3. Create Subjects
  console.log('\nCreating subjects...');
  const subjects = [];
  const subjectNames = ['Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA', 'IPS', 'Agama Islam', 'PKN', 'Seni Budaya', 'Penjaskes', 'Informatika'];
  
  for (let i = 0; i < classes.length; i++) {
    const cls = classes[i];
    // Assign 5-7 random subjects per class
    const numSubjects = 5 + Math.floor(Math.random() * 3);
    const shuffledSubjects = [...subjectNames].sort(() => Math.random() - 0.5).slice(0, numSubjects);
    
    for (const subjectName of shuffledSubjects) {
      const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];
      const subject = await prisma.subject.create({
        data: {
          name: subjectName,
          code: subjectName.substring(0, 4).toUpperCase() + '-' + cls.name.replace('Kelas ', ''),
          class_id: cls.id,
          teacher_id: randomTeacher.id
        }
      });
      subjects.push(subject);
    }
    console.log(`  ✓ ${cls.name}: ${shuffledSubjects.length} subjects`);
  }

  // 4. Create Students
  console.log('\nCreating students...');
  const firstNames = ['Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Guntur', 'Hana', 'Indra', 'Jaya', 'Kartini', 'Lukman', 'Maya', 'Nanda', 'Omar', 'Putri', 'Qori', 'Rendi', 'Sari', 'Taufik', 'Umar', 'Vina', 'Wawan', 'Xena', 'Yusuf', 'Zahra'];
  const lastNames = ['Pratama', 'Wijaya', 'Kusuma', 'Sari', 'Hidayat', 'Nugroho', 'Putri', 'Santoso', 'Azzahra', 'Fauzi', 'Hidayah', 'Pertiwi', 'Setiawan', 'Rahayu', 'Budiman'];
  
  let totalStudents = 0;
  for (const cls of classes) {
    const numStudents = 20 + Math.floor(Math.random() * 10); // 20-30 students per class
    for (let i = 0; i < numStudents; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const nama = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${totalStudents + 1}@student.edutree.sch.id`;
      const nisn = `${20240001 + totalStudents}`;
      
      // Create student user
      const student = await prisma.user.create({
        data: {
          email,
          password_hash: 'default123',
          role: 'siswa',
          nama
        }
      });

      // Create student profile
      await prisma.profile.create({
        data: {
          user_id: student.id,
          class_id: cls.id,
          nisn_or_nip: nisn,
          telepon: `08${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          alamat: `Jakarta, Indonesia`
        }
      });

      // Create parent user (50% chance)
      if (Math.random() > 0.5) {
        const parentName = `Orang Tua ${firstName}`;
        const parentEmail = `ortu.${firstName.toLowerCase()}@parent.edutree.sch.id`;
        
        const parent = await prisma.user.create({
          data: {
            email: parentEmail,
            password_hash: 'default123',
            role: 'orang_tua',
            nama: parentName
          }
        });

        // Update student profile with parent_id
        await prisma.profile.update({
          where: { user_id: student.id },
          data: { parent_id: parent.id }
        });
      }

      totalStudents++;
    }
    console.log(`  ✓ ${cls.name}: ${numStudents} students`);
  }

  // 5. Create Teaching Schedules
  console.log('\nCreating teaching schedules...');
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
  const timeSlots = [
    '07:00-08:30',
    '08:30-10:00',
    '10:00-11:30',
    '11:30-13:00',
    '13:00-14:30'
  ];

  let totalSchedules = 0;
  for (const cls of classes) {
    // Get subjects for this class
    const classSubjects = subjects.filter(s => s.class_id === cls.id);
    
    // Create 3-5 schedules per class
    const numSchedules = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numSchedules && i < classSubjects.length; i++) {
      const subject = classSubjects[i];
      const day = days[Math.floor(Math.random() * days.length)];
      const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      const [startTime, endTime] = timeSlot.split('-');

      await prisma.teachingSchedule.create({
        data: {
          subject_id: subject.id,
          teacher_id: subject.teacher_id,
          class_id: cls.id,
          day,
          start_time: startTime,
          end_time: endTime,
          room: `Ruang ${Math.floor(Math.random() * 20) + 1}`
        }
      });
      totalSchedules++;
    }
  }
  console.log(`  ✓ Created ${totalSchedules} teaching schedules`);

  // Summary
  console.log('\n📊 SEEDING SUMMARY:');
  console.log('==================');
  console.log(`Classes: ${classes.length}`);
  console.log(`Teachers: ${teachers.length}`);
  console.log(`Subjects: ${subjects.length}`);
  console.log(`Students: ${totalStudents}`);
  console.log(`Teaching Schedules: ${totalSchedules}`);
  console.log('\n✅ Dummy data seeding completed successfully!');
  console.log('\n📝 Default Login Credentials:');
  console.log('  Admin: admin@edutree.sch.id / default123');
  console.log('  Guru: sarah.jenkins@edutree.sch.id / default123');
  console.log('  Siswa: ahmad.pratama1@student.edutree.sch.id / default123');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });