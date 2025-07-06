/**
 * @file プロジェクト詳細ページ
 * @description プロジェクトの詳細とデザイン画面（Designフェーズ）
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 2.4 プロジェクト詳細
 * 関連クラス: HabitElementCard, MAPSetForm
 */

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Target, 
  Heart, 
  ArrowLeft,
  CheckCircle2,
  History as HistoryIcon,
  Edit2,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { HabitElementCard } from '../components/HabitElementCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { getProject, updateProject, deleteProject } from '../services/projects';
import { 
  getHabitElements, 
  createHabitElement, 
  updateHabitElement, 
  deleteHabitElement,
  addMAPSet,
  updateMAPSet,
  deleteMAPSet
} from '../services/habitElements';
import type { HabitElement, MAPSet } from '../types';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAddingElement, setIsAddingElement] = useState(false);
  const [newElementName, setNewElementName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingProjectName, setEditingProjectName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // プロジェクト情報を取得
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id!),
    enabled: !!id,
  });

  // 習慣要素を取得
  const { data: habitElements, isLoading: elementsLoading } = useQuery({
    queryKey: ['habitElements', id],
    queryFn: () => getHabitElements(id!),
    enabled: !!id,
  });

  // 習慣要素作成
  const createElementMutation = useMutation({
    mutationFn: (elementData: Omit<HabitElement, 'id'>) => 
      createHabitElement(id!, elementData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habitElements', id] });
      setIsAddingElement(false);
      setNewElementName('');
    },
  });

  // 習慣要素更新
  const updateElementMutation = useMutation({
    mutationFn: ({ elementId, updates }: { elementId: string; updates: Partial<HabitElement> }) =>
      updateHabitElement(id!, elementId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habitElements', id] });
    },
  });

  // 習慣要素削除
  const deleteElementMutation = useMutation({
    mutationFn: (elementId: string) => deleteHabitElement(id!, elementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habitElements', id] });
    },
  });

  // MAPセット追加
  const addMAPSetMutation = useMutation({
    mutationFn: ({ elementId, mapSet }: { elementId: string; mapSet: Omit<MAPSet, 'id'> }) =>
      addMAPSet(id!, elementId, mapSet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habitElements', id] });
    },
  });

  // MAPセット更新
  const updateMAPSetMutation = useMutation({
    mutationFn: ({ elementId, mapSetId, updates }: { 
      elementId: string; 
      mapSetId: string; 
      updates: Partial<MAPSet> 
    }) => updateMAPSet(id!, elementId, mapSetId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habitElements', id] });
    },
  });

  // MAPセット削除
  const deleteMAPSetMutation = useMutation({
    mutationFn: ({ elementId, mapSetId }: { elementId: string; mapSetId: string }) =>
      deleteMAPSet(id!, elementId, mapSetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habitElements', id] });
    },
  });

  // プロジェクト名更新
  const updateProjectNameMutation = useMutation({
    mutationFn: (newName: string) => updateProject(id!, { projectName: newName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setIsEditingName(false);
    },
  });

  // プロジェクト削除
  const deleteProjectMutation = useMutation({
    mutationFn: () => deleteProject(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate('/dashboard');
    },
  });

  const handleAddElement = () => {
    if (newElementName.trim()) {
      createElementMutation.mutate({
        elementName: newElementName.trim(),
        impact: 5,
        feasibility: 5,
        mapSets: [],
      });
    }
  };

  const handleStartEditingName = () => {
    if (project) {
      setEditingProjectName(project.projectName);
      setIsEditingName(true);
    }
  };

  const handleSaveProjectName = () => {
    if (editingProjectName.trim() && editingProjectName !== project?.projectName) {
      updateProjectNameMutation.mutate(editingProjectName.trim());
    } else {
      setIsEditingName(false);
    }
  };

  const handleDeleteProject = () => {
    deleteProjectMutation.mutate();
  };

  if (projectLoading || elementsLoading) {
    return <LoadingSpinner message="プロジェクトを読み込んでいます..." />;
  }

  if (!project) {
    return (
      <ErrorMessage
        type="error"
        message="プロジェクトが見つかりません"
        details="プロジェクトが削除されたか、アクセス権限がない可能性があります。"
      />
    );
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-4 sm:mb-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-3 sm:mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
          ダッシュボードに戻る
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isEditingName ? (
                <>
                  <input
                    type="text"
                    value={editingProjectName}
                    onChange={(e) => setEditingProjectName(e.target.value)}
                    className="text-xl sm:text-3xl font-bold px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-red-600 dark:text-red-500"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveProjectName()}
                  />
                  <button
                    onClick={handleSaveProjectName}
                    className="p-1.5 glass-subtle hover:bg-primary/20 rounded-lg transition-all duration-300"
                    title="保存"
                  >
                    <Save className="h-4 w-4 text-primary" />
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="p-1.5 glass-subtle hover:bg-secondary/20 rounded-lg transition-all duration-300"
                    title="キャンセル"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <h1 className="text-xl sm:text-3xl font-bold text-red-600 dark:text-red-500">{project.projectName}</h1>
                  <button
                    onClick={handleStartEditingName}
                    className="p-1.5 glass-subtle hover:bg-primary/20 rounded-lg transition-all duration-300"
                    title="プロジェクト名を編集"
                  >
                    <Edit2 className="h-4 w-4 text-primary" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-1.5 glass-subtle hover:bg-destructive/20 rounded-lg transition-all duration-300"
                    title="プロジェクトを削除"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </>
              )}
            </div>
            <div className="space-y-2 mt-3">
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200">{project.aspiration}</span>
              </div>
              <div className="flex items-center gap-2 bg-pink-50 dark:bg-pink-900/20 p-2 rounded-lg">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600 dark:text-pink-400" />
                <span className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200">{project.feeling}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link
              to={`/projects/${id}/check`}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm"
            >
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              振り返り
            </Link>
            <Link
              to={`/projects/${id}/history`}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 text-sm"
            >
              <HistoryIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              履歴
            </Link>
          </div>
        </div>
      </div>


      {/* コンテンツエリア */}
      <div className="space-y-4">
          {/* 習慣要素カード一覧 */}
          {habitElements && habitElements.length > 0 ? (
            habitElements.map((element) => (
              <HabitElementCard
                key={element.id}
                element={element}
                onUpdate={(updates) => 
                  updateElementMutation.mutate({ elementId: element.id!, updates })
                }
                onDelete={() => deleteElementMutation.mutate(element.id!)}
                onAddMAPSet={(mapSet) => 
                  addMAPSetMutation.mutate({ elementId: element.id!, mapSet })
                }
                onUpdateMAPSet={(mapSetId, updates) =>
                  updateMAPSetMutation.mutate({ 
                    elementId: element.id!, 
                    mapSetId, 
                    updates 
                  })
                }
                onDeleteMAPSet={(mapSetId) =>
                  deleteMAPSetMutation.mutate({ 
                    elementId: element.id!, 
                    mapSetId 
                  })
                }
              />
            ))
          ) : (
            <div className="bg-card p-12 rounded-lg border text-center">
              <p className="text-muted-foreground mb-4">
                まだ習慣要素がありません。最初の習慣要素を追加しましょう。
              </p>
            </div>
          )}

          {/* 新規習慣要素追加 */}
          {isAddingElement ? (
            <div className="bg-card border rounded-lg p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newElementName}
                  onChange={(e) => setNewElementName(e.target.value)}
                  placeholder="習慣要素の名前を入力（例：朝早く起きて子供の世話をする）"
                  className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleAddElement()}
                />
                <button
                  onClick={handleAddElement}
                  disabled={!newElementName.trim() || createElementMutation.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  追加
                </button>
                <button
                  onClick={() => {
                    setIsAddingElement(false);
                    setNewElementName('');
                  }}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingElement(true)}
              className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-muted-foreground/30 rounded-lg hover:border-primary/50 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>習慣要素を追加</span>
            </button>
          )}
      </div>

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fadeInUp">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">プロジェクトを削除しますか？</h2>
            <p className="text-muted-foreground mb-6">
              「{project?.projectName}」とすべての習慣要素、履歴データが完全に削除されます。この操作は取り消せません。
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteProject}
                disabled={deleteProjectMutation.isPending}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 disabled:opacity-50"
              >
                {deleteProjectMutation.isPending ? '削除中...' : '削除する'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};