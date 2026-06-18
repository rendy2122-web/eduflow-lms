import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'homeschool.json');

export interface Milestone {
  id: string;
  title: string;
  subject: string;
  completed: boolean;
  studentId: string;
}

export interface Portfolio {
  id: string;
  title: string;
  subject: string;
  notes: string;
  fileUrl: string;
  studentId: string;
  studentName: string;
  parentId: string;
  date: string;
  status: 'pending' | 'graded';
  academicScore?: number | null;
  teacherFeedback?: string | null;
  adabScore?: number | null;
  created_at: string;
}

async function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {}

  try {
    await fs.access(DATA_FILE);
  } catch (err) {
    // File doesn't exist, create it with default values
    const defaultData = {
      milestones: [
        { id: 'm1', title: 'Bab 1: Mengenal Angka & Himpunan', subject: 'Matematika', completed: true, studentId: 'default-student-id' },
        { id: 'm2', title: 'Bab 2: Operasi Penjumlahan & Pengurangan', subject: 'Matematika', completed: true, studentId: 'default-student-id' },
        { id: 'm3', title: 'Bab 3: Perkalian Dasar & Pembagian', subject: 'Matematika', completed: false, studentId: 'default-student-id' },
        { id: 'm4', title: 'Bab 1: Bagian Tubuh Tumbuhan & Fotosintesis', subject: 'IPAS', completed: true, studentId: 'default-student-id' },
        { id: 'm5', title: 'Bab 2: Wujud Zat & Perubahannya', subject: 'IPAS', completed: false, studentId: 'default-student-id' },
        { id: 'm6', title: 'Bab 1: Vocabulary & Simple Greetings', subject: 'Bahasa Inggris', completed: false, studentId: 'default-student-id' }
      ],
      portfolios: [
        {
          id: 'p1',
          title: 'Kunjungan Sejarah ke Museum Nasional',
          subject: 'IPS / Sejarah',
          notes: 'Belajar tentang peninggalan prasasti kuno Kerajaan Tarumanegara dan mengamati arsitektur candi mini.',
          fileUrl: '/submissions/mock_museum_visit.pdf',
          studentId: 'default-student-id',
          studentName: 'Bilal Al-Mansoori',
          parentId: 'default-parent-id',
          date: new Date().toISOString().split('T')[0],
          status: 'graded',
          academicScore: 95,
          teacherFeedback: 'Ulasan yang sangat mendalam! Bilal mampu mengidentifikasi nama prasasti dengan tepat.',
          adabScore: 90,
          created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
        }
      ]
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

export async function readHomeschoolData() {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

export async function writeHomeschoolData(data: any) {
  const dir = path.dirname(DATA_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getMilestones(studentId: string): Promise<Milestone[]> {
  const data = await readHomeschoolData();
  // Map 'default-student-id' to studentId if we want to bind them dynamically
  return data.milestones.map((m: Milestone) => ({
    ...m,
    studentId: studentId
  }));
}

export async function toggleMilestone(milestoneId: string, completed: boolean): Promise<boolean> {
  const data = await readHomeschoolData();
  const idx = data.milestones.findIndex((m: any) => m.id === milestoneId);
  if (idx !== -1) {
    data.milestones[idx].completed = completed;
    await writeHomeschoolData(data);
    return true;
  }
  return false;
}

export async function getPortfolios(studentId?: string): Promise<Portfolio[]> {
  const data = await readHomeschoolData();
  if (studentId) {
    return data.portfolios.filter((p: Portfolio) => p.studentId === studentId || p.studentId === 'default-student-id');
  }
  return data.portfolios;
}

export async function addPortfolio(p: Omit<Portfolio, 'id' | 'status' | 'created_at'>): Promise<Portfolio> {
  const data = await readHomeschoolData();
  const newPortfolio: Portfolio = {
    ...p,
    id: `p_${Date.now()}`,
    status: 'pending',
    academicScore: null,
    teacherFeedback: null,
    created_at: new Date().toISOString()
  };
  data.portfolios.unshift(newPortfolio);
  await writeHomeschoolData(data);
  return newPortfolio;
}

export async function gradePortfolio(id: string, academicScore: number, teacherFeedback: string): Promise<boolean> {
  const data = await readHomeschoolData();
  const idx = data.portfolios.findIndex((p: any) => p.id === id);
  if (idx !== -1) {
    data.portfolios[idx].academicScore = academicScore;
    data.portfolios[idx].teacherFeedback = teacherFeedback;
    data.portfolios[idx].status = 'graded';
    await writeHomeschoolData(data);
    return true;
  }
  return false;
}
