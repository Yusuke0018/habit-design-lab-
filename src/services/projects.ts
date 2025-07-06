/**
 * @file プロジェクトサービス
 * @description プロジェクトに関するCRUD操作
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 4. データモデル
 * 関連クラス: firebase.ts, types/index.ts, HabitElementService
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Project } from '../types';
import { getCurrentUser } from './auth';

const COLLECTION_NAME = 'projects';

/**
 * プロジェクトを作成
 */
export const createProject = async (
  projectData: Omit<Project, 'id' | 'ownerUid' | 'createdAt'>
): Promise<string> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...projectData,
    ownerUid: user.uid,
    createdAt: serverTimestamp(),
    nextCheckDate: Timestamp.fromDate(projectData.nextCheckDate),
  });

  return docRef.id;
};

/**
 * プロジェクトを更新
 */
export const updateProject = async (
  projectId: string,
  updates: Partial<Omit<Project, 'id' | 'ownerUid' | 'createdAt'>>
): Promise<void> => {
  const projectRef = doc(db, COLLECTION_NAME, projectId);
  
  const updateData: any = { ...updates };
  if (updates.nextCheckDate) {
    updateData.nextCheckDate = Timestamp.fromDate(updates.nextCheckDate);
  }
  updateData.updatedAt = serverTimestamp();

  await updateDoc(projectRef, updateData);
};

/**
 * プロジェクトを削除
 */
export const deleteProject = async (projectId: string): Promise<void> => {
  const projectRef = doc(db, COLLECTION_NAME, projectId);
  await deleteDoc(projectRef);
};

/**
 * プロジェクトを取得
 */
export const getProject = async (projectId: string): Promise<Project | null> => {
  const projectRef = doc(db, COLLECTION_NAME, projectId);
  const projectSnap = await getDoc(projectRef);

  if (!projectSnap.exists()) {
    return null;
  }

  const data = projectSnap.data();
  return {
    id: projectSnap.id,
    ...data,
    nextCheckDate: data.nextCheckDate.toDate(),
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  } as Project;
};

/**
 * ユーザーのプロジェクト一覧を取得
 */
export const getUserProjects = async (): Promise<Project[]> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const q = query(
    collection(db, COLLECTION_NAME),
    where('ownerUid', '==', user.uid),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const projects: Project[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    projects.push({
      id: doc.id,
      ...data,
      nextCheckDate: data.nextCheckDate.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as Project);
  });

  return projects;
};

/**
 * チェックが必要なプロジェクトを取得
 */
export const getProjectsNeedingCheck = async (): Promise<Project[]> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const now = Timestamp.now();
  const q = query(
    collection(db, COLLECTION_NAME),
    where('ownerUid', '==', user.uid),
    where('nextCheckDate', '<=', now),
    orderBy('nextCheckDate', 'asc')
  );

  const querySnapshot = await getDocs(q);
  const projects: Project[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    projects.push({
      id: doc.id,
      ...data,
      nextCheckDate: data.nextCheckDate.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as Project);
  });

  return projects;
};