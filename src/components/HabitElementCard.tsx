/**
 * @file 習慣要素カードコンポーネント
 * @description 習慣要素と新しい習慣デザイン要素（極小化、If-Then、祝福）を表示・編集するカード
 * 設計ドキュメント: 習慣デザイン・ラボ仕様書 - 2.4 デザイン画面
 * 関連クラス: ProjectDetailPage, HabitElement
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Edit2, Trash2, GripVertical, Target, Zap, Gift } from 'lucide-react';
import type { HabitElement, IfThenRule, Reward } from '../types';

interface HabitElementCardProps {
  element: HabitElement;
  onUpdate: (updates: Partial<HabitElement>) => void;
  onDelete: () => void;
}

export const HabitElementCard: React.FC<HabitElementCardProps> = ({
  element,
  onUpdate,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(element.elementName);
  const [isEditingMinimalAction, setIsEditingMinimalAction] = useState(false);
  const [editingMinimalAction, setEditingMinimalAction] = useState(element.habitDesign.minimalAction);
  const [isAddingIfThen, setIsAddingIfThen] = useState(false);
  const [newIfThen, setNewIfThen] = useState('');
  const [isAddingReward, setIsAddingReward] = useState(false);
  const [newReward, setNewReward] = useState({ condition: '', celebration: '' });
  const [editingIfThenId, setEditingIfThenId] = useState<string | null>(null);
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);

  const handleSaveName = () => {
    if (editingName.trim()) {
      onUpdate({ elementName: editingName.trim() });
      setIsEditing(false);
    }
  };

  const handleSaveMinimalAction = () => {
    if (editingMinimalAction.trim()) {
      onUpdate({
        habitDesign: {
          ...element.habitDesign,
          minimalAction: editingMinimalAction.trim(),
        },
      });
      setIsEditingMinimalAction(false);
    }
  };

  const handleAddIfThen = () => {
    if (newIfThen.trim()) {
      const newRule: IfThenRule = {
        id: Date.now().toString(),
        trigger: newIfThen.trim(),
        createdAt: new Date(),
      };
      onUpdate({
        habitDesign: {
          ...element.habitDesign,
          ifThenRules: [...element.habitDesign.ifThenRules, newRule],
        },
      });
      setNewIfThen('');
      setIsAddingIfThen(false);
    }
  };

  const handleUpdateIfThen = (ruleId: string, newTrigger: string) => {
    if (newTrigger.trim()) {
      onUpdate({
        habitDesign: {
          ...element.habitDesign,
          ifThenRules: element.habitDesign.ifThenRules.map((rule) =>
            rule.id === ruleId ? { ...rule, trigger: newTrigger.trim() } : rule
          ),
        },
      });
      setEditingIfThenId(null);
    }
  };

  const handleDeleteIfThen = (ruleId: string) => {
    onUpdate({
      habitDesign: {
        ...element.habitDesign,
        ifThenRules: element.habitDesign.ifThenRules.filter((rule) => rule.id !== ruleId),
      },
    });
  };

  const handleAddReward = () => {
    if (newReward.condition.trim() && newReward.celebration.trim()) {
      const reward: Reward = {
        id: Date.now().toString(),
        condition: newReward.condition.trim(),
        celebration: newReward.celebration.trim(),
        createdAt: new Date(),
      };
      onUpdate({
        habitDesign: {
          ...element.habitDesign,
          rewards: [...element.habitDesign.rewards, reward],
        },
      });
      setNewReward({ condition: '', celebration: '' });
      setIsAddingReward(false);
    }
  };

  const handleUpdateReward = (rewardId: string, updates: Partial<Reward>) => {
    onUpdate({
      habitDesign: {
        ...element.habitDesign,
        rewards: element.habitDesign.rewards.map((reward) =>
          reward.id === rewardId ? { ...reward, ...updates } : reward
        ),
      },
    });
    setEditingRewardId(null);
  };

  const handleDeleteReward = (rewardId: string) => {
    onUpdate({
      habitDesign: {
        ...element.habitDesign,
        rewards: element.habitDesign.rewards.filter((reward) => reward.id !== rewardId),
      },
    });
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
                className="flex-1 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
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
            <h3 className="font-bold text-base sm:text-lg flex-1 line-clamp-1 text-gray-900 dark:text-gray-100">{element.elementName}</h3>
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

      {/* 習慣デザイン要素 */}
      {isExpanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 relative z-10 space-y-4">
          {/* 1. 極小化 */}
          <div className="glass-subtle rounded-xl p-3 border border-white/10 hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <div className="relative">
                <Target className="h-4 w-4 text-info animate-pulse" />
                <div className="absolute inset-0 bg-info/50 blur-lg" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">極小化：最低限すべき習慣</h4>
            </div>
            {isEditingMinimalAction ? (
              <div className="space-y-2">
                <textarea
                  value={editingMinimalAction}
                  onChange={(e) => setEditingMinimalAction(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                  placeholder="最低限、これだけはやる習慣を記入"
                  rows={2}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleSaveMinimalAction}
                    className="text-sm text-primary hover:underline"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setEditingMinimalAction(element.habitDesign.minimalAction);
                      setIsEditingMinimalAction(false);
                    }}
                    className="text-sm text-muted-foreground hover:underline"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground">{element.habitDesign.minimalAction}</p>
                <button
                  onClick={() => setIsEditingMinimalAction(true)}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  編集
                </button>
              </div>
            )}
          </div>

          {/* 2. If-Then */}
          <div className="glass-subtle rounded-xl p-3 border border-white/10 hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <div className="relative">
                <Zap className="h-4 w-4 text-warning animate-pulse" />
                <div className="absolute inset-0 bg-warning/50 blur-lg" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">If-Then：トリガー</h4>
            </div>
            
            <div className="space-y-2">
              {element.habitDesign.ifThenRules.map((rule, index) => (
                <div key={rule.id} className="glass-subtle rounded-lg p-2 animate-fadeInUp" style={{ animationDelay: `${index * 100}ms` }}>
                  {editingIfThenId === rule.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        defaultValue={rule.trigger}
                        className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                        autoFocus
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateIfThen(rule.id!, (e.target as HTMLInputElement).value);
                          }
                        }}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={(e) => {
                            const input = e.currentTarget.parentElement?.parentElement?.querySelector('input');
                            if (input) handleUpdateIfThen(rule.id!, input.value);
                          }}
                          className="text-xs text-primary hover:underline"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => setEditingIfThenId(null)}
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <p className="text-sm text-muted-foreground flex-1">{rule.trigger}</p>
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => setEditingIfThenId(rule.id!)}
                          className="text-xs text-primary hover:underline"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDeleteIfThen(rule.id!)}
                          className="text-xs text-destructive hover:underline"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isAddingIfThen ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newIfThen}
                    onChange={(e) => setNewIfThen(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                    placeholder="例：朝起きたら、昼食後に、〇〇を見たら"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handleAddIfThen()}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleAddIfThen}
                      className="px-3 py-1.5 btn-primary text-white rounded-lg text-sm hover:scale-105 transition-all duration-300"
                    >
                      追加
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingIfThen(false);
                        setNewIfThen('');
                      }}
                      className="px-3 py-1.5 glass border border-white/20 rounded-lg text-sm hover:bg-secondary/20 transition-all duration-300"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingIfThen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 glass border-2 border-dashed border-primary/30 rounded-lg hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 group"
                >
                  <Plus className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform duration-300 text-primary" />
                  <span className="text-xs sm:text-sm font-medium text-primary">トリガーを追加</span>
                </button>
              )}
            </div>
          </div>

          {/* 3. 祝福 */}
          <div className="glass-subtle rounded-xl p-3 border border-white/10 hover:border-primary/30 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <div className="relative">
                <Gift className="h-4 w-4 text-success animate-float" />
                <div className="absolute inset-0 bg-success/50 blur-lg" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">祝福：自分への報酬</h4>
            </div>
            
            <div className="space-y-2">
              {element.habitDesign.rewards.map((reward, index) => (
                <div key={reward.id} className="glass-subtle rounded-lg p-2 animate-fadeInUp" style={{ animationDelay: `${index * 100}ms` }}>
                  {editingRewardId === reward.id ? (
                    <RewardEditForm
                      reward={reward}
                      onSave={(updates) => handleUpdateReward(reward.id!, updates)}
                      onCancel={() => setEditingRewardId(null)}
                    />
                  ) : (
                    <div>
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-medium text-gray-900 dark:text-gray-100">条件:</span>
                          <span className="ml-2 text-muted-foreground">{reward.condition}</span>
                        </p>
                        <p className="text-sm">
                          <span className="font-medium text-gray-900 dark:text-gray-100">報酬:</span>
                          <span className="ml-2 text-muted-foreground">{reward.celebration}</span>
                        </p>
                      </div>
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          onClick={() => setEditingRewardId(reward.id!)}
                          className="text-xs text-primary hover:underline"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDeleteReward(reward.id!)}
                          className="text-xs text-destructive hover:underline"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isAddingReward ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newReward.condition}
                    onChange={(e) => setNewReward({ ...newReward, condition: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                    placeholder="条件（例：1回できたら、1週間連続でできたら）"
                  />
                  <input
                    type="text"
                    value={newReward.celebration}
                    onChange={(e) => setNewReward({ ...newReward, celebration: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
                    placeholder="報酬（例：好きなお菓子を食べる、映画を見る）"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleAddReward}
                      className="px-3 py-1.5 btn-primary text-white rounded-lg text-sm hover:scale-105 transition-all duration-300"
                    >
                      追加
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingReward(false);
                        setNewReward({ condition: '', celebration: '' });
                      }}
                      className="px-3 py-1.5 glass border border-white/20 rounded-lg text-sm hover:bg-secondary/20 transition-all duration-300"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingReward(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 glass border-2 border-dashed border-primary/30 rounded-lg hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 group"
                >
                  <Plus className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform duration-300 text-primary" />
                  <span className="text-xs sm:text-sm font-medium text-primary">報酬を追加</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 報酬編集フォームコンポーネント
const RewardEditForm: React.FC<{
  reward: Reward;
  onSave: (updates: Partial<Reward>) => void;
  onCancel: () => void;
}> = ({ reward, onSave, onCancel }) => {
  const [editingReward, setEditingReward] = useState(reward);

  const handleSave = () => {
    if (editingReward.condition.trim() && editingReward.celebration.trim()) {
      onSave({
        condition: editingReward.condition.trim(),
        celebration: editingReward.celebration.trim(),
      });
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={editingReward.condition}
        onChange={(e) => setEditingReward({ ...editingReward, condition: e.target.value })}
        className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
        placeholder="条件"
      />
      <input
        type="text"
        value={editingReward.celebration}
        onChange={(e) => setEditingReward({ ...editingReward, celebration: e.target.value })}
        className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
        placeholder="報酬"
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={handleSave}
          className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
        >
          保存
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/80"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
};