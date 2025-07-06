/**
 * @file 型定義ファイル
 * @description アプリケーション全体で使用する型定義
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書
 * 関連クラス: FirebaseService, ProjectService, HabitElementService
 */

// ユーザー関連の型
export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
}

// プロジェクト関連の型
export interface Project {
  id?: string;
  projectName: string;
  aspiration: string;  // 具体的な願望
  feeling: string;     // 得たい感情
  ownerUid: string;
  nextCheckDate: Date;
  createdAt: Date;
  updatedAt?: Date;
}

// B=MAPセットの型
export interface MAPSet {
  id?: string;
  M: string;  // Motivation
  A: string;  // Ability
  P: string;  // Prompt
}

// 習慣要素の型
export interface HabitElement {
  id?: string;
  elementName: string;
  impact: number;       // インパクト（1-10）
  feasibility: number;  // 実行可能性（1-10）
  mapSets: MAPSet[];
  positionX?: number;   // フォーカスマップ上のX座標
  positionY?: number;   // フォーカスマップ上のY座標
}

// 振り返りの型
export interface Reflection {
  well: string;      // うまくいった点
  challenge: string; // 難しかった点
  next: string;      // 次に試したいこと
  freeText: string;  // 自由記述
}

// 履歴の型
export interface History {
  id?: string;
  checkedAt: Date;
  reflection: Reflection;
  designSnapshot: {
    habitElements: HabitElement[];
  };
}

// チェック履歴の型（AI分析用）
export interface CheckHistory {
  wellDone: string;
  difficult: string;
  nextTry: string;
  freeText?: string;
  checkedAt: string;
}