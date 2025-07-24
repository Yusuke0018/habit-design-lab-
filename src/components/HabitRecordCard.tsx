/**
 * @file 習慣記録カードコンポーネント
 * @description 各習慣の日々の記録を表示・更新するカード
 */

import React, { useState } from 'react';
import { Check, X, Pause, Flame, StickyNote } from 'lucide-react';
import { HabitElement, HabitRecord, PassReason, GrowthStage } from '../types';
import GrowthVisual from './GrowthVisual';
import { getToday } from '../services/habitRecords';

interface HabitRecordCardProps {
  habitElement: HabitElement;
  record?: HabitRecord;
  growthStage: GrowthStage;
  currentStreak: number;
  onStatusChange: (status: 'completed' | 'passed' | 'not_done', passReason?: PassReason) => void;
  onNoteAdd?: (note: string) => void;
}

const HabitRecordCard: React.FC<HabitRecordCardProps> = ({
  habitElement,
  record,
  growthStage,
  currentStreak,
  onStatusChange,
  onNoteAdd
}) => {
  const [showPassModal, setShowPassModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [note, setNote] = useState(record?.note || '');

  const passReasons: { value: PassReason; label: string; emoji: string }[] = [
    { value: 'illness', label: '体調不良', emoji: '🏥' },
    { value: 'travel', label: '旅行・外出', emoji: '✈️' },
    { value: 'emergency', label: '予定外の用事', emoji: '📅' },
    { value: 'rest', label: '意図的な休息', emoji: '🎯' },
    { value: 'custom', label: 'その他', emoji: '✏️' }
  ];

  const handlePassClick = () => {
    setShowPassModal(true);
  };

  const handlePassReasonSelect = (reason: PassReason) => {
    onStatusChange('passed', reason);
    setShowPassModal(false);
  };

  const handleNoteSubmit = () => {
    if (onNoteAdd) {
      onNoteAdd(note);
    }
    setShowNoteModal(false);
  };

  const getStatusColor = () => {
    if (!record || record.date !== getToday()) return 'bg-gray-100';
    switch (record.status) {
      case 'completed': return 'bg-green-100 border-green-300';
      case 'passed': return 'bg-gray-100 border-gray-300';
      case 'not_done': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-100';
    }
  };

  return (
    <>
      <div className={`relative p-4 rounded-xl border-2 ${getStatusColor()} transition-all duration-300 hover:shadow-lg`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <GrowthVisual stage={growthStage} size="small" animated={false} />
            <div>
              <h3 className="font-semibold text-lg">{habitElement.elementName}</h3>
              {currentStreak > 0 && (
                <div className="flex items-center space-x-1 text-sm text-orange-600">
                  <Flame className="w-4 h-4" />
                  <span>{currentStreak}日連続</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowNoteModal(true)}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <StickyNote className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-around mt-4">
          <button
            onClick={() => onStatusChange('completed')}
            className={`flex-1 mx-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              record?.status === 'completed'
                ? 'bg-green-500 text-white shadow-md scale-105'
                : 'bg-gray-200 text-gray-700 hover:bg-green-500 hover:text-white'
            }`}
          >
            <Check className="w-5 h-5 mx-auto" />
            <span className="text-xs mt-1 block">達成</span>
          </button>

          <button
            onClick={handlePassClick}
            className={`flex-1 mx-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              record?.status === 'passed'
                ? 'bg-gray-500 text-white shadow-md scale-105'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-500 hover:text-white'
            }`}
          >
            <Pause className="w-5 h-5 mx-auto" />
            <span className="text-xs mt-1 block">パス</span>
          </button>

          <button
            onClick={() => onStatusChange('not_done')}
            className={`flex-1 mx-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              record?.status === 'not_done'
                ? 'bg-red-500 text-white shadow-md scale-105'
                : 'bg-gray-200 text-gray-700 hover:bg-red-500 hover:text-white'
            }`}
          >
            <X className="w-5 h-5 mx-auto" />
            <span className="text-xs mt-1 block">未達成</span>
          </button>
        </div>

        {record?.passReason && record.status === 'passed' && (
          <div className="mt-3 text-center text-sm text-gray-600">
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-200 rounded-full">
              <span>{passReasons.find(r => r.value === record.passReason)?.emoji}</span>
              <span>{passReasons.find(r => r.value === record.passReason)?.label}</span>
            </span>
          </div>
        )}

        {record?.note && (
          <div className="mt-3 p-2 bg-yellow-50 rounded-lg text-sm text-gray-700">
            {record.note}
          </div>
        )}
      </div>

      {/* パス理由選択モーダル */}
      {showPassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">パスの理由を選択</h3>
            <div className="space-y-2">
              {passReasons.map((reason) => (
                <button
                  key={reason.value}
                  onClick={() => handlePassReasonSelect(reason.value)}
                  className="w-full p-3 text-left rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center space-x-3"
                >
                  <span className="text-2xl">{reason.emoji}</span>
                  <span>{reason.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowPassModal(false)}
              className="mt-4 w-full p-2 text-gray-600 hover:text-gray-800"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* メモ追加モーダル */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">メモを追加</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="今日の気づきや感想を記録..."
              className="w-full p-3 border rounded-lg resize-none h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex space-x-2 mt-4">
              <button
                onClick={handleNoteSubmit}
                className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                保存
              </button>
              <button
                onClick={() => setShowNoteModal(false)}
                className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HabitRecordCard;