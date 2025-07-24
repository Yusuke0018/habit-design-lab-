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

// If-Thenルールの型
export interface IfThenRule {
  id?: string;
  trigger: string;  // どのようなトリガーがあれば行動に移すか
  createdAt?: Date;
}

// 祝福（報酬）の型
export interface Reward {
  id?: string;
  condition: string;    // 達成条件（例：1回できたら、1週間連続でできたら）
  celebration: string;  // どのように自分に報いるか
  createdAt?: Date;
}

// 新しい習慣デザイン要素の型
export interface HabitDesign {
  id?: string;
  minimalAction: string;     // 極小化：最低限すべき習慣の内容
  ifThenRules: IfThenRule[]; // If-Then：複数のトリガー設定
  rewards: Reward[];         // 祝福：複数の報酬設定
}

// 習慣要素の型
export interface HabitElement {
  id?: string;
  elementName: string;
  impact: number;       // インパクト（1-10）
  feasibility: number;  // 実行可能性（1-10）
  habitDesign: HabitDesign;  // 新しい習慣デザイン要素
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

// 習慣記録の型
export interface HabitRecord {
  id?: string;
  habitElementId: string;
  projectId: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  status: 'completed' | 'passed' | 'not_done';
  passReason?: PassReason;
  note?: string;
  createdAt: Date;
}

// パス理由の型
export type PassReason = 'illness' | 'travel' | 'emergency' | 'rest' | 'custom';

// 習慣統計の型
export interface HabitStats {
  habitElementId: string;
  totalDays: number;
  completedDays: number;
  passedDays: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  growthStage: GrowthStage;
}

// 成長ステージの型
export type GrowthStage = 'seed' | 'sprout' | 'sapling' | 'tree' | 'blooming' | 'fruit';

// 成長ステージの詳細
export interface GrowthStageInfo {
  stage: GrowthStage;
  name: string;
  minDays: number;
  maxDays: number;
  emoji: string;
  color: string;
  description: string;
}

// カレンダー表示用の型
export interface CalendarDay {
  date: string;
  habits: {
    habitElementId: string;
    status: 'completed' | 'passed' | 'not_done' | 'future';
    growthStage?: GrowthStage;
  }[];
}

// 実績の型
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  condition: {
    type: 'streak' | 'total_days' | 'all_habits' | 'special';
    value: number;
  };
}