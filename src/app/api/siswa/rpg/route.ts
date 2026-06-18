import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Get student's RPG status
export async function GET() {
  try {
    const student = await prisma.user.findFirst({
      where: { email: 'siswa@sekolah.sch.id' },
      include: { profile: true }
    });

    if (!student || !student.profile) {
      return NextResponse.json(
        { success: false, error: 'Siswa tidak ditemukan' },
        { status: 404 }
      );
    }

    const { rpg_level, rpg_xp, rpg_gold, rpg_items, rpg_equipped } = student.profile;

    return NextResponse.json({
      success: true,
      rpg: {
        level: rpg_level,
        xp: rpg_xp,
        gold: rpg_gold,
        items: JSON.parse(rpg_items || '[]'),
        equipped: JSON.parse(rpg_equipped || '[]')
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Handle buy, equip, unequip, and add_xp actions
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, itemId, cost, xpAmount } = body;

    const student = await prisma.user.findFirst({
      where: { email: 'siswa@sekolah.sch.id' },
      include: { profile: true }
    });

    if (!student || !student.profile) {
      return NextResponse.json(
        { success: false, error: 'Siswa tidak ditemukan' },
        { status: 404 }
      );
    }

    const profile = student.profile;
    let currentLevel = profile.rpg_level;
    let currentXp = profile.rpg_xp;
    let currentGold = profile.rpg_gold;
    let ownedItems = JSON.parse(profile.rpg_items || '[]') as string[];
    let equippedItems = JSON.parse(profile.rpg_equipped || '[]') as string[];

    if (action === 'buy') {
      if (!itemId || cost === undefined) {
        return NextResponse.json({ success: false, error: 'itemId dan cost wajib dikirim' }, { status: 400 });
      }

      if (ownedItems.includes(itemId)) {
        return NextResponse.json({ success: false, error: 'Item sudah dimiliki' }, { status: 400 });
      }

      if (currentGold < cost) {
        return NextResponse.json({ success: false, error: 'Koin Emas tidak mencukupi' }, { status: 400 });
      }

      // Deduct gold and add item
      currentGold -= cost;
      ownedItems.push(itemId);
    } 
    
    else if (action === 'equip') {
      if (!itemId) {
        return NextResponse.json({ success: false, error: 'itemId wajib dikirim' }, { status: 400 });
      }

      if (!ownedItems.includes(itemId)) {
        return NextResponse.json({ success: false, error: 'Item belum dibeli' }, { status: 400 });
      }

      if (!equippedItems.includes(itemId)) {
        // Simple slot rule: only one item per category (e.g. peci/sorban/glasses/crown)
        // Let's categorise items:
        // Head items: peci, sorban, crown
        // Face items: glasses
        const isHead = ['peci', 'sorban', 'crown'].includes(itemId);
        if (isHead) {
          equippedItems = equippedItems.filter(i => !['peci', 'sorban', 'crown'].includes(i));
        } else {
          equippedItems = equippedItems.filter(i => i !== itemId);
        }
        equippedItems.push(itemId);
      }
    } 
    
    else if (action === 'unequip') {
      if (!itemId) {
        return NextResponse.json({ success: false, error: 'itemId wajib dikirim' }, { status: 400 });
      }
      equippedItems = equippedItems.filter(i => i !== itemId);
    } 
    
    else if (action === 'add_xp') {
      if (xpAmount === undefined) {
        return NextResponse.json({ success: false, error: 'xpAmount wajib dikirim' }, { status: 400 });
      }

      currentXp += xpAmount;
      let levelUpOccurred = false;

      // Level up formula: every 100 XP triggers level up and grants 50 gold
      while (currentXp >= 100) {
        currentXp -= 100;
        currentLevel += 1;
        currentGold += 50;
        levelUpOccurred = true;
      }
    } 
    
    else {
      return NextResponse.json({ success: false, error: 'Aksi tidak valid' }, { status: 400 });
    }

    // Save back to DB
    const updatedProfile = await prisma.profile.update({
      where: { id: profile.id },
      data: {
        rpg_level: currentLevel,
        rpg_xp: currentXp,
        rpg_gold: currentGold,
        rpg_items: JSON.stringify(ownedItems),
        rpg_equipped: JSON.stringify(equippedItems)
      }
    });

    return NextResponse.json({
      success: true,
      rpg: {
        level: updatedProfile.rpg_level,
        xp: updatedProfile.rpg_xp,
        gold: updatedProfile.rpg_gold,
        items: ownedItems,
        equipped: equippedItems
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
