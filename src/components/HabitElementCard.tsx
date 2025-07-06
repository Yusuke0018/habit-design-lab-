/**
 * @file 習慣要素カードコンポーネント
 * @description 習慣要素とB=MAPセットを表示・編集するカード
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 2.4 デザイン画面
 * 関連クラス: ProjectDetailPage, MAPSetForm, HabitElement
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Edit2, Trash2, GripVertical, Zap, Brain, MapPin } from 'lucide-react';
import type { HabitElement, MAPSet } from '../types';

interface HabitElementCardProps {
  element: HabitElement;
  onUpdate: (updates: Partial<HabitElement>) => void;
  onDelete: () => void;
  onAddMAPSet: (mapSet: Omit<MAPSet, 'id'>) => void;
  onUpdateMAPSet: (mapSetId: string, updates: Partial<MAPSet>) => void;
  onDeleteMAPSet: (mapSetId: string) => void;
}

export const HabitElementCard: React.FC<HabitElementCardProps> = ({
  element,
  onUpdate,
  onDelete,
  onAddMAPSet,
  onUpdateMAPSet,
  onDeleteMAPSet,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(element.elementName);
  const [isAddingMAPSet, setIsAddingMAPSet] = useState(false);
  const [newMAPSet, setNewMAPSet] = useState({ M: '', A: '', P: '' });
  const [editingMAPSetId, setEditingMAPSetId] = useState<string | null>(null);

  const handleSaveName = () => {
    if (editingName.trim()) {
      onUpdate({ elementName: editingName.trim() });
      setIsEditing(false);
    }
  };

  const handleAddMAPSet = () => {
    if (newMAPSet.M && newMAPSet.A && newMAPSet.P) {
      onAddMAPSet(newMAPSet);
      setNewMAPSet({ M: '', A: '', P: '' });
      setIsAddingMAPSet(false);
    }
  };

  return (
    <div className="glass border-2 border-white/20 hover:border-primary/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden card-3d group">
      {/* 背景装飾 */}
      <div className="absolute inset-0 bg-gradient-to-br from-gradient-start/5 via-gradient-middle/5 to-gradient-end/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* カードヘッダー */}
      <div className="p-3 sm:p-4 flex items-center justify-between relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="flex items-center flex-1 relative z-10">
          <GripVertical className="h-5 w-5 text-muted-foreground mr-2 cursor-move hover:text-primary transition-colors" />
          
          {isEditing ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="flex-1 px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
              />
              <button
                onClick={handleSaveName}
                className="text-sm text-primary hover:underline"
              >
                保存
              </button>
              <button
                onClick={() => {
                  setEditingName(element.elementName);
                  setIsEditing(false);
                }}
                className="text-sm text-muted-foreground hover:underline"
              >
                キャンセル
              </button>
            </div>
          ) : (
            <h3 className="font-bold text-base sm:text-lg flex-1 line-clamp-1 gradient-text">{element.elementName}</h3>
          )}
        </div>

        <div className="flex items-center gap-2 relative z-10">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 glass-subtle hover:bg-accent/20 rounded-lg transition-all duration-300 group/edit"
              title="編集"
            >
              <Edit2 className="h-4 w-4 group-hover/edit:scale-110 transition-transform" />
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1.5 glass-subtle hover:bg-destructive/20 text-destructive rounded-lg transition-all duration-300 group/delete"
            title="削除"
          >
            <Trash2 className="h-4 w-4 group-hover/delete:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 sm:p-1.5 glass-subtle hover:bg-accent/20 rounded-lg transition-all duration-300"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4 animate-bounce-slow" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* B=MAPセット一覧 */}
      {isExpanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 relative z-10">
          <div className="space-y-2 sm:space-y-3">
            {element.mapSets.map((mapSet, index) => (
              <div key={mapSet.id} className="glass-subtle rounded-xl p-3 border border-white/10 hover:border-primary/30 transition-all duration-300 animate-fadeInUp" style={{ animationDelay: `${index * 100}ms` }}>
                {editingMAPSetId === mapSet.id ? (
                  <MAPSetEditForm
                    mapSet={mapSet}
                    onSave={(updates) => {
                      onUpdateMAPSet(mapSet.id!, updates);
                      setEditingMAPSetId(null);
                    }}
                    onCancel={() => setEditingMAPSetId(null)}
                  />
                ) : (
                  <div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <div className="relative">
                          <Zap className="h-4 w-4 text-warning animate-pulse" />
                          <div className="absolute inset-0 bg-warning/50 blur-lg" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium gradient-text">M (動機):</span>
                          <span className="ml-2 text-muted-foreground">{mapSet.M}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="relative">
                          <Brain className="h-4 w-4 text-success animate-float" />
                          <div className="absolute inset-0 bg-success/50 blur-lg" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium gradient-text">A (能力):</span>
                          <span className="ml-2 text-muted-foreground">{mapSet.A}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="relative">
                          <MapPin className="h-4 w-4 text-info animate-bounce-slow" />
                          <div className="absolute inset-0 bg-info/50 blur-lg" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium gradient-text">P (きっかけ):</span>
                          <span className="ml-2 text-muted-foreground">{mapSet.P}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        onClick={() => setEditingMAPSetId(mapSet.id!)}
                        className="text-xs text-primary hover:underline"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => onDeleteMAPSet(mapSet.id!)}
                        className="text-xs text-destructive hover:underline"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* 新規MAPセット追加フォーム */}
            {isAddingMAPSet ? (
              <div className="glass-subtle rounded-xl p-3 border-2 border-primary/30 space-y-3 animate-fadeInUp">
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                    <Zap className="h-3 w-3 text-warning" />
                    <span className="gradient-text">M (動機)</span>
                  </label>
                  <input
                    type="text"
                    value={newMAPSet.M}
                    onChange={(e) => setNewMAPSet({ ...newMAPSet, M: e.target.value })}
                    className="w-full px-3 py-2 glass border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                    placeholder="なぜこの行動をしたいのか？"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                    <Brain className="h-3 w-3 text-success" />
                    <span className="gradient-text">A (能力)</span>
                  </label>
                  <input
                    type="text"
                    value={newMAPSet.A}
                    onChange={(e) => setNewMAPSet({ ...newMAPSet, A: e.target.value })}
                    className="w-full px-3 py-2 glass border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                    placeholder="どうすれば簡単にできるか？"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-info" />
                    <span className="gradient-text">P (きっかけ)</span>
                  </label>
                  <input
                    type="text"
                    value={newMAPSet.P}
                    onChange={(e) => setNewMAPSet({ ...newMAPSet, P: e.target.value })}
                    className="w-full px-3 py-2 glass border border-white/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                    placeholder="いつ・どこで・何をきっかけに？"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleAddMAPSet}
                    className="px-3 py-1.5 gradient-primary text-white rounded-lg text-sm hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg btn-glow"
                  >
                    追加
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingMAPSet(false);
                      setNewMAPSet({ M: '', A: '', P: '' });
                    }}
                    className="px-3 py-1.5 glass border border-white/20 rounded-lg text-sm hover:bg-secondary/20 transition-all duration-300"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingMAPSet(true)}
                className="w-full flex items-center justify-center gap-2 py-3 glass border-2 border-dashed border-primary/30 rounded-xl hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 group"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:rotate-90 transition-transform duration-300 text-primary" />
                <span className="text-xs sm:text-sm font-medium gradient-text">B=MAPセットを追加</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// MAPセット編集フォームコンポーネント
const MAPSetEditForm: React.FC<{
  mapSet: MAPSet;
  onSave: (updates: Partial<MAPSet>) => void;
  onCancel: () => void;
}> = ({ mapSet, onSave, onCancel }) => {
  const [editingMAPSet, setEditingMAPSet] = useState(mapSet);

  const handleSave = () => {
    if (editingMAPSet.M && editingMAPSet.A && editingMAPSet.P) {
      onSave(editingMAPSet);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">M (動機)</label>
        <input
          type="text"
          value={editingMAPSet.M}
          onChange={(e) => setEditingMAPSet({ ...editingMAPSet, M: e.target.value })}
          className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">A (能力)</label>
        <input
          type="text"
          value={editingMAPSet.A}
          onChange={(e) => setEditingMAPSet({ ...editingMAPSet, A: e.target.value })}
          className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">P (きっかけ)</label>
        <input
          type="text"
          value={editingMAPSet.P}
          onChange={(e) => setEditingMAPSet({ ...editingMAPSet, P: e.target.value })}
          className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={handleSave}
          className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
        >
          保存
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
};