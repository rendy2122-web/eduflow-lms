import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Helper to format Date to HH:mm string in local timezone (Asia/Jakarta)
function formatTime(date: Date | null): string {
  if (!date) return '--:--';
  const d = new Date(date);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
}

// GET: Fetch staff members + their attendance for a specific date
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const roleFilter = searchParams.get('role') || 'all';
    const searchQuery = searchParams.get('search') || '';

    // 1. Fetch all real admin & guru users from DB
    const realUsers = await prisma.user.findMany({
      where: {
        role: { in: ['admin', 'guru'] }
      },
      orderBy: { nama: 'asc' }
    });

    // 2. Map database users to staff format
    const dbStaff = realUsers.map((u) => ({
      id: u.id,
      name: u.nama,
      role: u.role === 'admin' ? 'Sistem Admin' : 'Guru Kelas',
      email: u.email,
      isMock: false
    }));

    // 3. Mock staff members to ensure the dashboard looks premium and populated
    const mockStaff = [
      { id: 'mock-staff-1', name: 'Ahmad Fauzi, S.Pd', role: 'Guru Matematika', email: 'ahmad@sekolah.sch.id', isMock: true },
      { id: 'mock-staff-2', name: 'Siti Aminah, M.Pd', role: 'Guru Biologi', email: 'siti@sekolah.sch.id', isMock: true },
      { id: 'mock-staff-3', name: 'Rian Hidayat, S.Kom', role: 'Staf IT & Lab', email: 'rian@sekolah.sch.id', isMock: true }
    ];

    // Combine real DB staff and mock staff
    let allStaff = [...dbStaff, ...mockStaff];

    // Apply filters
    if (roleFilter !== 'all') {
      const targetRole = roleFilter.toLowerCase();
      allStaff = allStaff.filter((s) => {
        if (targetRole === 'admin') {
          return s.role.toLowerCase().includes('admin') || s.role.toLowerCase().includes('it');
        } else if (targetRole === 'guru') {
          return s.role.toLowerCase().includes('guru') || s.role.toLowerCase().includes('kelas') || s.role.toLowerCase().includes('matematika') || s.role.toLowerCase().includes('biologi');
        }
        return true;
      });
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      allStaff = allStaff.filter((s) => s.name.toLowerCase().includes(query) || s.email.toLowerCase().includes(query));
    }

    // 4. Fetch real attendance records for DB staff
    const realStaffIds = dbStaff.map(s => s.id);
    const attendanceRecords = await prisma.staffAttendance.findMany({
      where: {
        staff_id: { in: realStaffIds },
        date: date
      }
    });

    const attendanceMap = new Map(attendanceRecords.map(r => [r.staff_id, r]));

    // 5. Merge staff with their attendance status
    const formattedLogs = allStaff.map((staff, idx) => {
      if (!staff.isMock) {
        // Real database user
        const record = attendanceMap.get(staff.id);
        
        let clockInStr = '--:--';
        let clockOutStr = '--:--';
        let status = 'belum_absen'; // default status

        if (record) {
          clockInStr = formatTime(record.clock_in);
          clockOutStr = formatTime(record.clock_out);
          
          if (record.status === 'izin') {
            status = 'izin';
          } else if (record.status === 'alpa') {
            status = 'alpa';
          } else if (record.clock_in) {
            // Determine if late (past 07:00 AM local time)
            const inTime = new Date(record.clock_in);
            const hours = inTime.getUTCHours() + 7; // Convert to UTC+7 for matching typical local hours
            const minutes = inTime.getUTCMinutes();
            const totalMinutes = (hours % 24) * 60 + minutes;
            const threshold = 7 * 60; // 07:00 AM

            if (totalMinutes > threshold) {
              status = 'terlambat';
            } else {
              status = 'hadir';
            }
          }
        }

        return {
          id: staff.id,
          name: staff.name,
          role: staff.role,
          email: staff.email,
          clockIn: clockInStr,
          clockOut: clockOutStr,
          status,
          isMock: false
        };
      } else {
        // Mock staff - return stable simulated data depending on date/id
        let clockIn = '--:--';
        let clockOut = '--:--';
        let status = 'belum_absen';

        // Add some variation based on id and date string
        const seedVal = (idx + date.charCodeAt(date.length - 1)) % 3;
        if (seedVal === 0) {
          clockIn = '06:45';
          clockOut = '14:30';
          status = 'hadir';
        } else if (seedVal === 1) {
          clockIn = '07:15';
          clockOut = '--:--';
          status = 'terlambat';
        } else {
          status = 'belum_absen';
        }

        return {
          id: staff.id,
          name: staff.name,
          role: staff.role,
          email: staff.email,
          clockIn,
          clockOut,
          status,
          isMock: true
        };
      }
    });

    return NextResponse.json({
      success: true,
      logs: formattedLogs,
      date
    });
  } catch (error: any) {
    console.error('Error fetching staff attendance data:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Save simulated clock-in/out or admin override
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { staffId, date, action, status: overrideStatus, userRole, userName } = body;

    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Parameter tanggal (date) wajib diisi' },
        { status: 400 }
      );
    }

    // Determine target staff ID
    let targetStaffId = staffId;

    // If simulating for "Sesi Anda", find the real staff id matching userRole
    if (!targetStaffId && userRole) {
      const user = await prisma.user.findFirst({
        where: {
          role: userRole.toLowerCase() === 'admin' ? 'admin' : 'guru'
        }
      });
      if (user) {
        targetStaffId = user.id;
      } else {
        return NextResponse.json(
          { success: false, error: 'User sesi tidak ditemukan' },
          { status: 404 }
        );
      }
    }

    if (!targetStaffId) {
      return NextResponse.json(
        { success: false, error: 'staffId wajib ditentukan' },
        { status: 400 }
      );
    }

    // If target is mock staff, simulate success
    if (targetStaffId.startsWith('mock-')) {
      return NextResponse.json({ success: true, simulated: true });
    }

    const now = new Date();

    // 1. Check if record exists
    const existing = await prisma.staffAttendance.findFirst({
      where: {
        staff_id: targetStaffId,
        date: date
      }
    });

    if (action === 'clock_in') {
      if (existing) {
        // Update clock_in if not set
        if (!existing.clock_in) {
          await prisma.staffAttendance.update({
            where: { id: existing.id },
            data: { clock_in: now, status: existing.status === 'belum_absen' ? 'hadir' : existing.status }
          });
        }
      } else {
        // Create new
        await prisma.staffAttendance.create({
          data: {
            staff_id: targetStaffId,
            date,
            clock_in: now,
            status: 'hadir'
          }
        });
      }
    } else if (action === 'clock_out') {
      if (existing) {
        await prisma.staffAttendance.update({
          where: { id: existing.id },
          data: { clock_out: now }
        });
      } else {
        await prisma.staffAttendance.create({
          data: {
            staff_id: targetStaffId,
            date,
            clock_out: now,
            status: 'hadir'
          }
        });
      }
    } else if (overrideStatus) {
      // Admin override action
      if (existing) {
        await prisma.staffAttendance.update({
          where: { id: existing.id },
          data: { 
            status: overrideStatus,
            // Clear times if marking as izin or alpa
            clock_in: overrideStatus === 'hadir' ? (existing.clock_in || now) : null,
            clock_out: overrideStatus === 'hadir' ? existing.clock_out : null
          }
        });
      } else {
        await prisma.staffAttendance.create({
          data: {
            staff_id: targetStaffId,
            date,
            status: overrideStatus,
            clock_in: overrideStatus === 'hadir' ? now : null,
            clock_out: null
          }
        });
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Aksi atau Status tidak valid' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving staff attendance:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
