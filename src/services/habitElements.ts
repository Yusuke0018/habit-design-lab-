/**
 * @file 習慣要素サービス
 * @description 習慣要素のCRUD操作
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 2.4 デザイン画面
 * 関連クラス: projects.ts, types/index.ts
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { HabitElement } from '../types';

/**
 * 習慣要素を作成
 */
export const createHabitElement = async (
  projectId: string,
  elementData: Omit<HabitElement, 'id'>
): Promise<string> => {
  const habitElementsRef = collection(db, 'projects', projectId, 'habit_elements');
  
  const docRef = await addDoc(habitElementsRef, {
    ...elementData,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

/**
 * 習慣要素を更新
 */
export const updateHabitElement = async (
  projectId: string,
  elementId: string,
  updates: Partial<Omit<HabitElement, 'id'>>
): Promise<void> => {
  const elementRef = doc(db, 'projects', projectId, 'habit_elements', elementId);
  await updateDoc(elementRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

/**
 * 習慣要素を削除
 */
export const deleteHabitElement = async (
  projectId: string,
  elementId: string
): Promise<void> => {
  const elementRef = doc(db, 'projects', projectId, 'habit_elements', elementId);
  await deleteDoc(elementRef);
};

/**
 * プロジェクトの全習慣要素を取得
 */
export const getHabitElements = async (projectId: string): Promise<HabitElement[]> => {
  const habitElementsRef = collection(db, 'projects', projectId, 'habit_elements');
  const q = query(habitElementsRef, orderBy('createdAt', 'desc'));
  
  const querySnapshot = await getDocs(q);
  const elements: HabitElement[] = [];

  querySnapshot.docs.forEach((docSnap) => {
    const elementData = docSnap.data();
    
    // habitDesignが存在しない場合のデフォルト値を設定（マイグレーション対応）
    if (!elementData.habitDesign) {
      elementData.habitDesign = {
        minimalAction: '',
        ifThenRules: [],
        rewards: []
      };
    }
    
    elements.push({
      id: docSnap.id,
      ...elementData,
    } as HabitElement);
  });

  return elements;
};