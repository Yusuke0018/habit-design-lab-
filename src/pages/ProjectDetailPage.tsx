/**
 * @file プロジェクト詳細ページ
 * @description プロジェクトの詳細とデザイン画面（Designフェーズ）
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 2.4 プロジェクト詳細
 * 関連クラス: HabitElementCard, MAPSetForm, FocusMapping
 */

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Map, 
  Calendar, 
  Target, 
  Heart, 
  Loader2, 
  ArrowLeft,
  CheckCircle2,
  History as HistoryIcon 
} from 'lucide-react';
import { HabitElementCard } from '../components/HabitElementCard';
import { FocusMapping } from '../components/FocusMapping';
import { getProject, updateProject } from '../services/projects';
import { 
  getHabitElements, 
  createHabitElement, 
  updateHabitElement, 
  deleteHabitElement,
  addMAPSet,
  updateMAPSet,
  deleteMAPSet
} from '../services/habitElements';
import { HabitElement, MAPSet } from '../types';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAddingElement, setIsAddingElement] = useState(false);
  const [newElementName, setNewElementName] = useState('');
  const [showMapping, setShowMapping] = useState(false);

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

  if (projectLoading || elementsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
        <p className="text-destructive">プロジェクトが見つかりません。</p>
      </div>
    );
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          ダッシュボードに戻る
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.projectName}</h1>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="h-4 w-4" />
                <span className="text-sm">{project.aspiration}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Heart className="h-4 w-4" />
                <span className="text-sm">{project.feeling}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link
              to={`/projects/${id}/check`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              <CheckCircle2 className="h-4 w-4" />
              振り返り
            </Link>
            <Link
              to={`/projects/${id}/history`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
            >
              <HistoryIcon className="h-4 w-4" />
              履歴
            </Link>
          </div>
        </div>
      </div>

      {/* タブ切り替え */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setShowMapping(false)}
          className={`px-4 py-2 rounded-md transition-colors ${
            !showMapping 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          習慣要素一覧
        </button>
        <button
          onClick={() => setShowMapping(true)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            showMapping 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          <Map className="h-4 w-4" />
          フォーカス・マッピング
        </button>
      </div>

      {/* コンテンツエリア */}
      {showMapping ? (
        <div className="bg-card p-8 rounded-lg border">
          {habitElements && habitElements.length > 0 ? (
            <FocusMapping
              habitElements={habitElements}
              onUpdatePosition={(elementId, impact, feasibility) => {
                updateElementMutation.mutate({
                  elementId,
                  updates: { impact, feasibility }
                });
              }}
            />
          ) : (
            <div className="min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  習慣要素を追加してから、フォーカス・マッピングを使用してください
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
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
                  className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
      )}
    </div>
  );
};