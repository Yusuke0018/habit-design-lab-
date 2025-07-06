/**
 * @file 習慣要素カードコンポーネント
 * @description 習慣要素とB=MAPセットを表示・編集するカード
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 2.4 デザイン画面
 * 関連クラス: ProjectDetailPage, MAPSetForm, HabitElement
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
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
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* カードヘッダー */}
      <div className="p-3 sm:p-4 flex items-center justify-between bg-gradient-to-r from-transparent to-primary/5">
        <div className="flex items-center flex-1">
          <GripVertical className="h-5 w-5 text-muted-foreground mr-2 cursor-move" />
          
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
            <h3 className="font-medium text-base sm:text-lg flex-1 line-clamp-1">{element.elementName}</h3>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 hover:bg-accent rounded-md transition-colors"
              title="編集"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-destructive/10 text-destructive rounded-md transition-colors"
            title="削除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 sm:p-1.5 hover:bg-accent rounded-md transition-colors"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* B=MAPセット一覧 */}
      {isExpanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
          <div className="space-y-2 sm:space-y-3">
            {element.mapSets.map((mapSet) => (
              <div key={mapSet.id} className="bg-muted/30 rounded-md p-3">
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
                      <div>
                        <span className="font-medium text-primary">M (動機):</span>
                        <span className="ml-2">{mapSet.M}</span>
                      </div>
                      <div>
                        <span className="font-medium text-primary">A (能力):</span>
                        <span className="ml-2">{mapSet.A}</span>
                      </div>
                      <div>
                        <span className="font-medium text-primary">P (きっかけ):</span>
                        <span className="ml-2">{mapSet.P}</span>
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
              <div className="bg-muted/30 rounded-md p-3 space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">M (動機)</label>
                  <input
                    type="text"
                    value={newMAPSet.M}
                    onChange={(e) => setNewMAPSet({ ...newMAPSet, M: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="なぜこの行動をしたいのか？"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">A (能力)</label>
                  <input
                    type="text"
                    value={newMAPSet.A}
                    onChange={(e) => setNewMAPSet({ ...newMAPSet, A: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="どうすれば簡単にできるか？"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">P (きっかけ)</label>
                  <input
                    type="text"
                    value={newMAPSet.P}
                    onChange={(e) => setNewMAPSet({ ...newMAPSet, P: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="いつ・どこで・何をきっかけに？"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleAddMAPSet}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
                  >
                    追加
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingMAPSet(false);
                      setNewMAPSet({ M: '', A: '', P: '' });
                    }}
                    className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingMAPSet(true)}
                className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-muted-foreground/30 rounded-md hover:border-primary/50 transition-colors"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">B=MAPセットを追加</span>
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