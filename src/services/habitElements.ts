/**
 * @file 習慣要素サービス
 * @description 習慣要素とB=MAPセットのCRUD操作
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
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { HabitElement, MAPSet } from '../types';

/**
 * 習慣要素を作成
 */
export const createHabitElement = async (
  projectId: string,
  elementData: Omit<HabitElement, 'id'>
): Promise<string> => {
  const habitElementsRef = collection(db, 'projects', projectId, 'habit_elements');
  
  // MAPセットは別途保存するため、一時的に除外
  const { mapSets, ...elementDataWithoutMapSets } = elementData;
  
  const docRef = await addDoc(habitElementsRef, {
    ...elementDataWithoutMapSets,
    createdAt: serverTimestamp(),
  });

  // MAPセットを保存
  if (mapSets && mapSets.length > 0) {
    const batch = writeBatch(db);
    const mapSetsRef = collection(db, 'projects', projectId, 'habit_elements', docRef.id, 'map_sets');
    
    mapSets.forEach((mapSet) => {
      const mapSetDoc = doc(mapSetsRef);
      batch.set(mapSetDoc, mapSet);
    });
    
    await batch.commit();
  }

  return docRef.id;
};

/**
 * 習慣要素を更新
 */
export const updateHabitElement = async (
  projectId: string,
  elementId: string,
  updates: Partial<Omit<HabitElement, 'id' | 'mapSets'>>
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
  // まずMAPセットを削除
  const mapSetsRef = collection(db, 'projects', projectId, 'habit_elements', elementId, 'map_sets');
  const mapSetsSnapshot = await getDocs(mapSetsRef);
  
  const batch = writeBatch(db);
  mapSetsSnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  // 習慣要素自体を削除
  const elementRef = doc(db, 'projects', projectId, 'habit_elements', elementId);
  batch.delete(elementRef);
  
  await batch.commit();
};

/**
 * プロジェクトの全習慣要素を取得
 */
export const getHabitElements = async (projectId: string): Promise<HabitElement[]> => {
  const habitElementsRef = collection(db, 'projects', projectId, 'habit_elements');
  const q = query(habitElementsRef, orderBy('createdAt', 'desc'));
  
  const querySnapshot = await getDocs(q);
  const elements: HabitElement[] = [];

  for (const docSnap of querySnapshot.docs) {
    const elementData = docSnap.data();
    
    // MAPセットを取得
    const mapSetsRef = collection(db, 'projects', projectId, 'habit_elements', docSnap.id, 'map_sets');
    const mapSetsSnapshot = await getDocs(mapSetsRef);
    const mapSets: MAPSet[] = [];
    
    mapSetsSnapshot.forEach((mapSetDoc) => {
      mapSets.push({
        id: mapSetDoc.id,
        ...mapSetDoc.data(),
      } as MAPSet);
    });
    
    elements.push({
      id: docSnap.id,
      ...elementData,
      mapSets,
    } as HabitElement);
  }

  return elements;
};

/**
 * MAPセットを追加
 */
export const addMAPSet = async (
  projectId: string,
  elementId: string,
  mapSet: Omit<MAPSet, 'id'>
): Promise<string> => {
  const mapSetsRef = collection(db, 'projects', projectId, 'habit_elements', elementId, 'map_sets');
  const docRef = await addDoc(mapSetsRef, mapSet);
  return docRef.id;
};

/**
 * MAPセットを更新
 */
export const updateMAPSet = async (
  projectId: string,
  elementId: string,
  mapSetId: string,
  updates: Partial<Omit<MAPSet, 'id'>>
): Promise<void> => {
  const mapSetRef = doc(db, 'projects', projectId, 'habit_elements', elementId, 'map_sets', mapSetId);
  await updateDoc(mapSetRef, updates);
};

/**
 * MAPセットを削除
 */
export const deleteMAPSet = async (
  projectId: string,
  elementId: string,
  mapSetId: string
): Promise<void> => {
  const mapSetRef = doc(db, 'projects', projectId, 'habit_elements', elementId, 'map_sets', mapSetId);
  await deleteDoc(mapSetRef);
};