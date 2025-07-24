/**
 * @file デイリートラッキング画面
 * @description 今日の習慣を記録する画面
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import HabitRecordCard from '../components/HabitRecordCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useAuth } from '../contexts/AuthContext';
import { getProject } from '../services/projects';
import { getHabitElements } from '../services/habitElements';
import { 
  getHabitRecordsByDate, 
  upsertHabitRecord, 
  calculateHabitStats,
  getToday,
  formatDate 
} from '../services/habitRecords';
import type { Project, HabitElement, HabitRecord, HabitStats, PassReason } from '../types';

const DailyTrackingPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [habitElements, setHabitElements] = useState<HabitElement[]>([]);
  const [habitRecords, setHabitRecords] = useState<HabitRecord[]>([]);
  const [habitStats, setHabitStats] = useState<{ [key: string]: HabitStats }>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateString = formatDate(selectedDate);
  const isToday = dateString === getToday();

  useEffect(() => {
    loadData();
  }, [projectId, user, dateString]);

  const loadData = async () => {
    if (!user || !projectId) return;

    setIsLoading(true);
    setError(null);

    try {
      // プロジェクト情報を取得
      const projectData = await getProject(projectId);
      if (!projectData) {
        setError('プロジェクトが見つかりません');
        return;
      }
      setProject(projectData);

      // 習慣要素を取得
      const elements = await getHabitElements(projectId);
      setHabitElements(elements);

      // 選択された日付の記録を取得
      const records = await getHabitRecordsByDate(user.uid, projectId, dateString);
      setHabitRecords(records);

      // 各習慣の統計情報を取得
      const statsData: { [key: string]: HabitStats } = {};
      for (const element of elements) {
        if (element.id) {
          const stats = await calculateHabitStats(user.uid, element.id);
          statsData[element.id] = stats;
        }
      }
      setHabitStats(statsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('データの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (
    habitElementId: string,
    status: 'completed' | 'passed' | 'not_done',
    passReason?: PassReason
  ) => {
    if (!user || !projectId) return;

    try {
      await upsertHabitRecord({
        habitElementId,
        projectId,
        userId: user.uid,
        date: dateString,
        status,
        passReason: status === 'passed' ? passReason : undefined
      });

      // 記録を再読み込み
      await loadData();
    } catch (err) {
      console.error('Error updating record:', err);
      setError('記録の更新に失敗しました');
    }
  };

  const handleNoteAdd = async (habitElementId: string, note: string) => {
    if (!user || !projectId) return;

    try {
      await upsertHabitRecord({
        habitElementId,
        projectId,
        userId: user.uid,
        date: dateString,
        status: habitRecords.find(r => r.habitElementId === habitElementId)?.status || 'not_done',
        note
      });

      await loadData();
    } catch (err) {
      console.error('Error adding note:', err);
      setError('メモの保存に失敗しました');
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    
    // 未来の日付は選択できない
    if (newDate > new Date()) {
      return;
    }
    
    setSelectedDate(newDate);
  };

  const getRecordForElement = (elementId: string): HabitRecord | undefined => {
    return habitRecords.find(r => r.habitElementId === elementId);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(`/projects/${projectId}`)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>プロジェクトに戻る</span>
            </button>
            <button
              onClick={() => navigate(`/projects/${projectId}/calendar`)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <Calendar className="w-5 h-5" />
              <span>カレンダー表示</span>
            </button>
          </div>

          <h1 className="text-2xl font-bold">{project?.projectName}</h1>
          <div className="mt-2 flex items-center space-x-2 text-gray-600">
            <Target className="w-4 h-4" />
            <span className="text-sm">{project?.aspiration}</span>
          </div>
        </div>

        {/* 日付選択 */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => changeDate(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="text-2xl font-bold">
                {selectedDate.toLocaleDateString('ja-JP', { 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'short'
                })}
              </div>
              {isToday && (
                <div className="text-sm text-blue-600 font-medium">今日</div>
              )}
            </div>

            <button
              onClick={() => changeDate(1)}
              disabled={isToday}
              className={`p-2 rounded-lg transition-colors ${
                isToday 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 習慣カードリスト */}
        <div className="space-y-4">
          {habitElements.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center">
              <p className="text-gray-500">まだ習慣要素が登録されていません</p>
              <button
                onClick={() => navigate(`/projects/${projectId}`)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                習慣要素を追加
              </button>
            </div>
          ) : (
            habitElements.map((element) => (
              <HabitRecordCard
                key={element.id}
                habitElement={element}
                record={getRecordForElement(element.id!)}
                growthStage={habitStats[element.id!]?.growthStage || 'seed'}
                currentStreak={habitStats[element.id!]?.currentStreak || 0}
                onStatusChange={(status, passReason) => 
                  handleStatusChange(element.id!, status, passReason)
                }
                onNoteAdd={(note) => handleNoteAdd(element.id!, note)}
              />
            ))
          )}
        </div>

        {/* 統計サマリー */}
        {habitElements.length > 0 && (
          <div className="glass rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">今日の進捗</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {habitRecords.filter(r => r.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">達成</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {habitRecords.filter(r => r.status === 'passed').length}
                </div>
                <div className="text-sm text-gray-600">パス</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {habitElements.length - habitRecords.filter(r => 
                    r.status === 'completed' || r.status === 'passed'
                  ).length}
                </div>
                <div className="text-sm text-gray-600">未記録</div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default DailyTrackingPage;