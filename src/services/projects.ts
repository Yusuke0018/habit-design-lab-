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
import { db, auth } from './firebase';
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
  if (!user) {
    console.error('createProject: ユーザーが認証されていません');
    throw new Error('ユーザーが認証されていません。ログインしてください。');
  }

  try {
    console.log('createProject: プロジェクト作成開始', {
      projectName: projectData.projectName,
      ownerUid: user.uid,
      nextCheckDate: projectData.nextCheckDate
    });
    
    // Firebaseの接続状態を確認
    console.log('Firebase Auth状態:', auth.currentUser?.uid);
    console.log('Firestore instance:', db);

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...projectData,
      ownerUid: user.uid,
      createdAt: serverTimestamp(),
      nextCheckDate: Timestamp.fromDate(projectData.nextCheckDate),
    });

    console.log('createProject: プロジェクト作成成功', { projectId: docRef.id });
    return docRef.id;
  } catch (error) {
    console.error('createProject: プロジェクト作成エラー', error);
    
    // エラーの詳細情報を出力
    if (error && typeof error === 'object') {
      console.error('Error details:', {
        name: (error as any).name,
        code: (error as any).code,
        message: (error as any).message,
        stack: (error as any).stack
      });
    }
    
    // より詳細なエラーメッセージを提供
    if (error instanceof Error) {
      if (error.message.includes('Missing or insufficient permissions')) {
        throw new Error('プロジェクトの作成権限がありません。Firebaseの設定を確認してください。');
      }
      if (error.message.includes('Failed to get document because the client is offline')) {
        throw new Error('インターネット接続を確認してください。');
      }
      throw error;
    }
    throw new Error('プロジェクトの作成中に予期しないエラーが発生しました。');
  }
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
  try {
    console.log('getProject: プロジェクト取得中...', projectId);
    
    const projectRef = doc(db, COLLECTION_NAME, projectId);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      console.log('getProject: プロジェクトが見つかりません', projectId);
      return null;
    }

    const data = projectSnap.data();
    console.log('getProject: データ取得', data);
    
    // Timestampの安全な変換
    const nextCheckDate = data.nextCheckDate?.toDate 
      ? data.nextCheckDate.toDate() 
      : data.nextCheckDate instanceof Date 
        ? data.nextCheckDate 
        : new Date();
        
    const createdAt = data.createdAt?.toDate 
      ? data.createdAt.toDate() 
      : data.createdAt instanceof Date 
        ? data.createdAt 
        : new Date();
        
    const updatedAt = data.updatedAt?.toDate 
      ? data.updatedAt.toDate() 
      : data.updatedAt instanceof Date 
        ? data.updatedAt 
        : new Date();

    return {
      id: projectSnap.id,
      projectName: data.projectName || '',
      aspiration: data.aspiration || '',
      feeling: data.feeling || '',
      ownerUid: data.ownerUid || '',
      nextCheckDate,
      createdAt,
      updatedAt,
    };
  } catch (error) {
    console.error('getProject: エラー', error);
    throw error;
  }
};

/**
 * ユーザーのプロジェクト一覧を取得
 */
export const getUserProjects = async (): Promise<Project[]> => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  try {
    console.log('getUserProjects: ユーザーのプロジェクトを取得中...', user.uid);
    
    const q = query(
      collection(db, COLLECTION_NAME),
      where('ownerUid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const projects: Project[] = [];

    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data();
        console.log(`プロジェクトデータ (${doc.id}):`, data);
        
        // Timestampの安全な変換
        const nextCheckDate = data.nextCheckDate?.toDate 
          ? data.nextCheckDate.toDate() 
          : data.nextCheckDate instanceof Date 
            ? data.nextCheckDate 
            : new Date();
            
        const createdAt = data.createdAt?.toDate 
          ? data.createdAt.toDate() 
          : data.createdAt instanceof Date 
            ? data.createdAt 
            : new Date();
            
        const updatedAt = data.updatedAt?.toDate 
          ? data.updatedAt.toDate() 
          : data.updatedAt instanceof Date 
            ? data.updatedAt 
            : new Date();
        
        projects.push({
          id: doc.id,
          projectName: data.projectName || '',
          aspiration: data.aspiration || '',
          feeling: data.feeling || '',
          ownerUid: data.ownerUid || user.uid,
          nextCheckDate,
          createdAt,
          updatedAt,
        });
      } catch (error) {
        console.error(`プロジェクト ${doc.id} の処理中にエラー:`, error);
      }
    });

    console.log('getUserProjects: 取得完了', projects.length, 'プロジェクト');
    return projects;
  } catch (error) {
    console.error('getUserProjects: エラー', error);
    throw error;
  }
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
      nextCheckDate: data.nextCheckDate?.toDate ? data.nextCheckDate.toDate() : new Date(),
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
    } as Project);
  });

  return projects;
};