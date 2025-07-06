/**
 * @file 履歴サービス
 * @description 振り返り履歴の管理
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 2.6 適応と改善
 * 関連クラス: projects.ts, habitElements.ts, types/index.ts
 */

import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { History, HabitElement } from '../types';
import { getHabitElements } from './habitElements';

/**
 * 振り返りを保存
 */
export const saveReflection = async (
  projectId: string,
  history: Omit<History, 'id' | 'checkedAt' | 'designSnapshot'>
): Promise<string> => {
  // 現在の習慣要素を取得してスナップショットとして保存
  const currentElements = await getHabitElements(projectId);
  
  const historyRef = collection(db, 'projects', projectId, 'history');
  const docRef = await addDoc(historyRef, {
    ...history,
    checkedAt: serverTimestamp(),
    designSnapshot: {
      habitElements: currentElements,
    },
  });

  return docRef.id;
};

/**
 * プロジェクトの履歴を取得
 */
export const getProjectHistory = async (
  projectId: string,
  limitCount: number = 50
): Promise<History[]> => {
  const historyRef = collection(db, 'projects', projectId, 'history');
  const q = query(historyRef, orderBy('checkedAt', 'desc'), limit(limitCount));
  
  const querySnapshot = await getDocs(q);
  const histories: History[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    histories.push({
      id: doc.id,
      ...data,
      checkedAt: data.checkedAt.toDate(),
    } as History);
  });

  return histories;
};

/**
 * 最新の振り返りを取得
 */
export const getLatestReflection = async (projectId: string): Promise<History | null> => {
  const historyRef = collection(db, 'projects', projectId, 'history');
  const q = query(historyRef, orderBy('checkedAt', 'desc'), limit(1));
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  const data = doc.data();
  
  return {
    id: doc.id,
    ...data,
    checkedAt: data.checkedAt.toDate(),
  } as History;
};