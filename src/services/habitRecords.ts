/**
 * @file 習慣記録管理サービス
 * @description 習慣の日々の記録を管理するサービス
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import type { HabitRecord, HabitStats, GrowthStage, GrowthStageInfo } from '../types';

const COLLECTION_NAME = 'habitRecords';

// 成長ステージの定義
export const GROWTH_STAGES: GrowthStageInfo[] = [
  {
    stage: 'seed',
    name: '種',
    minDays: 0,
    maxDays: 0,
    emoji: '🌰',
    color: '#8B4513',
    description: 'これから始まる新しい習慣'
  },
  {
    stage: 'sprout',
    name: '新芽',
    minDays: 1,
    maxDays: 6,
    emoji: '🌱',
    color: '#90EE90',
    description: '小さな双葉が顔を出しました'
  },
  {
    stage: 'sapling',
    name: '若木',
    minDays: 7,
    maxDays: 20,
    emoji: '🌿',
    color: '#228B22',
    description: '茎が伸び、葉が増えてきました'
  },
  {
    stage: 'tree',
    name: '成木',
    minDays: 21,
    maxDays: 49,
    emoji: '🌳',
    color: '#006400',
    description: '立派な幹と枝を持つ木に成長'
  },
  {
    stage: 'blooming',
    name: '開花',
    minDays: 50,
    maxDays: 99,
    emoji: '🌸',
    color: '#FF69B4',
    description: '美しい花が咲きました'
  },
  {
    stage: 'fruit',
    name: '結実',
    minDays: 100,
    maxDays: Infinity,
    emoji: '🍎',
    color: '#FFD700',
    description: '実りの時を迎えました'
  }
];

// 日付を YYYY-MM-DD 形式に変換
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 今日の日付を取得
export const getToday = (): string => {
  return formatDate(new Date());
};

// 習慣記録を作成/更新
export const upsertHabitRecord = async (
  record: Omit<HabitRecord, 'id' | 'createdAt'>
): Promise<void> => {
  const recordId = `${record.userId}_${record.habitElementId}_${record.date}`;
  const docRef = doc(db, COLLECTION_NAME, recordId);

  // undefinedのフィールドを除外
  const cleanRecord: any = {
    habitElementId: record.habitElementId,
    projectId: record.projectId,
    userId: record.userId,
    date: record.date,
    status: record.status,
    createdAt: serverTimestamp()
  };

  // オプショナルフィールドは値がある場合のみ追加
  if (record.passReason !== undefined) {
    cleanRecord.passReason = record.passReason;
  }
  if (record.note !== undefined) {
    cleanRecord.note = record.note;
  }

  await setDoc(docRef, cleanRecord, { merge: true });
};

// 特定の日付の習慣記録を取得
export const getHabitRecordsByDate = async (
  userId: string,
  projectId: string,
  date: string
): Promise<HabitRecord[]> => {
  console.log('getHabitRecordsByDate called with:', { userId, projectId, date });
  
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    where('projectId', '==', projectId),
    where('date', '==', date)
  );

  try {
    const snapshot = await getDocs(q);
    console.log('Query result:', snapshot.size, 'documents found');
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as HabitRecord));
  } catch (error) {
    console.error('Error in getHabitRecordsByDate:', error);
    throw error;
  }
};

// 日付範囲の習慣記録を取得
export const getHabitRecordsByDateRange = async (
  userId: string,
  habitElementId: string,
  startDate: string,
  endDate: string
): Promise<HabitRecord[]> => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    where('habitElementId', '==', habitElementId),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as HabitRecord));
};

// 習慣の統計情報を計算
export const calculateHabitStats = async (
  userId: string,
  habitElementId: string
): Promise<HabitStats> => {
  console.log('calculateHabitStats called with:', { userId, habitElementId });
  
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    where('habitElementId', '==', habitElementId),
    orderBy('date', 'desc')
  );

  try {
    const snapshot = await getDocs(q);
    console.log('Stats query result:', snapshot.size, 'documents found');
    const records = snapshot.docs.map(doc => doc.data() as HabitRecord);

  // 統計を計算
  const totalDays = records.length;
  const completedDays = records.filter(r => r.status === 'completed').length;
  const passedDays = records.filter(r => r.status === 'passed').length;

  // 連続記録を計算（パスを含む）
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // 日付でソート（新しい順）
  const sortedRecords = records.sort((a, b) => b.date.localeCompare(a.date));

  // 今日から遡って連続記録を計算
  const today = getToday();
  let checkDate = new Date();

  for (let i = 0; i < 365; i++) { // 最大1年分チェック
    const dateStr = formatDate(checkDate);
    const record = sortedRecords.find(r => r.date === dateStr);

    if (record && (record.status === 'completed' || record.status === 'passed')) {
      if (i === 0 || (i > 0 && tempStreak > 0)) {
        tempStreak++;
        if (dateStr <= today) {
          currentStreak = tempStreak;
        }
      }
    } else if (dateStr <= today) {
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      if (currentStreak === 0 && tempStreak > 0) {
        currentStreak = tempStreak;
      }
      tempStreak = 0;
      if (i > 0 && !record) {
        break; // 記録がない過去の日付に到達
      }
    }

    checkDate.setDate(checkDate.getDate() - 1);
  }

  if (tempStreak > longestStreak) {
    longestStreak = tempStreak;
  }

  const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

  // 成長ステージを判定
  const growthStage = getGrowthStage(completedDays);

  return {
    habitElementId,
    totalDays,
    completedDays,
    passedDays,
    currentStreak,
    longestStreak,
    completionRate,
    growthStage
  };
  } catch (error) {
    console.error('Error in calculateHabitStats:', error);
    throw error;
  }
};

// 成長ステージを判定
export const getGrowthStage = (completedDays: number): GrowthStage => {
  for (const stage of GROWTH_STAGES) {
    if (completedDays >= stage.minDays && completedDays <= stage.maxDays) {
      return stage.stage;
    }
  }
  return 'seed';
};

// 成長ステージ情報を取得
export const getGrowthStageInfo = (stage: GrowthStage): GrowthStageInfo => {
  return GROWTH_STAGES.find(s => s.stage === stage) || GROWTH_STAGES[0];
};

// プロジェクト内の全習慣の統計を取得
export const getProjectHabitStats = async (
  userId: string,
  _projectId: string,
  habitElementIds: string[]
): Promise<HabitStats[]> => {
  const statsPromises = habitElementIds.map(id => calculateHabitStats(userId, id));
  return Promise.all(statsPromises);
};

// 月間カレンダーデータを取得
export const getMonthlyCalendarData = async (
  userId: string,
  projectId: string,
  year: number,
  month: number
): Promise<{ [date: string]: HabitRecord[] }> => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    where('projectId', '==', projectId),
    where('date', '>=', formatDate(startDate)),
    where('date', '<=', formatDate(endDate))
  );

  const snapshot = await getDocs(q);
  const records = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as HabitRecord));

  // 日付ごとにグループ化
  const calendarData: { [date: string]: HabitRecord[] } = {};
  records.forEach(record => {
    if (!calendarData[record.date]) {
      calendarData[record.date] = [];
    }
    calendarData[record.date].push(record);
  });

  return calendarData;
};

// 複数の習慣記録を一括更新
export const batchUpdateHabitRecords = async (
  records: Array<Omit<HabitRecord, 'id' | 'createdAt'>>
): Promise<void> => {
  const batch = writeBatch(db);

  records.forEach(record => {
    const recordId = `${record.userId}_${record.habitElementId}_${record.date}`;
    const docRef = doc(db, COLLECTION_NAME, recordId);
    
    // undefinedのフィールドを除外
    const cleanRecord: any = {
      habitElementId: record.habitElementId,
      projectId: record.projectId,
      userId: record.userId,
      date: record.date,
      status: record.status,
      createdAt: serverTimestamp()
    };

    // オプショナルフィールドは値がある場合のみ追加
    if (record.passReason !== undefined) {
      cleanRecord.passReason = record.passReason;
    }
    if (record.note !== undefined) {
      cleanRecord.note = record.note;
    }

    batch.set(docRef, cleanRecord, { merge: true });
  });

  await batch.commit();
};