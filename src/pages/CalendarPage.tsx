/**
 * @file カレンダー表示画面
 * @description 習慣の達成状況をカレンダー形式で表示
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import GrowthVisual from '../components/GrowthVisual';
import { useAuth } from '../contexts/AuthContext';
import { getProject } from '../services/projects';
import { getHabitElements } from '../services/habitElements';
import { getMonthlyCalendarData, calculateHabitStats, formatDate } from '../services/habitRecords';
import { Project, HabitElement, HabitRecord, HabitStats } from '../types';

interface CalendarCell {
  date: Date;
  records: HabitRecord[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

const CalendarPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [habitElements, setHabitElements] = useState<HabitElement[]>([]);
  const [calendarData, setCalendarData] = useState<{ [date: string]: HabitRecord[] }>({});
  const [habitStats, setHabitStats] = useState<{ [key: string]: HabitStats }>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'heatmap' | 'details'>('heatmap');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [projectId, user, currentMonth]);

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
      
      // デフォルトで最初の習慣を選択
      if (elements.length > 0 && !selectedHabitId) {
        setSelectedHabitId(elements[0].id!);
      }

      // カレンダーデータを取得
      const data = await getMonthlyCalendarData(
        user.uid,
        projectId,
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1
      );
      setCalendarData(data);

      // 統計情報を取得
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

  const generateCalendarCells = (): CalendarCell[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const cells: CalendarCell[] = [];
    const today = formatDate(new Date());

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateString = formatDate(date);

      cells.push({
        date,
        records: calendarData[dateString] || [],
        isCurrentMonth: date.getMonth() === month,
        isToday: dateString === today
      });

      if (date > lastDay && i % 7 === 6) break;
    }

    return cells;
  };

  const getCellColor = (cell: CalendarCell): string => {
    if (!cell.isCurrentMonth) return 'bg-gray-50';
    if (cell.date > new Date()) return 'bg-gray-100';
    
    if (viewMode === 'heatmap') {
      const totalHabits = habitElements.length;
      const completedCount = cell.records.filter(r => r.status === 'completed').length;
      const completionRate = totalHabits > 0 ? completedCount / totalHabits : 0;

      if (completionRate === 0) return 'bg-white';
      if (completionRate < 0.25) return 'bg-green-100';
      if (completionRate < 0.5) return 'bg-green-200';
      if (completionRate < 0.75) return 'bg-green-300';
      if (completionRate < 1) return 'bg-green-400';
      return 'bg-green-500';
    } else {
      const record = cell.records.find(r => r.habitElementId === selectedHabitId);
      if (!record) return 'bg-white';
      
      switch (record.status) {
        case 'completed': return 'bg-green-200';
        case 'passed': return 'bg-gray-200';
        case 'not_done': return 'bg-red-100';
        default: return 'bg-white';
      }
    }
  };

  const changeMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const cells = generateCalendarCells();

  if (isLoading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorMessage message={error} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(`/projects/${projectId}`)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>プロジェクトに戻る</span>
            </button>
            <button
              onClick={() => navigate(`/projects/${projectId}/track`)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              今日の記録
            </button>
          </div>
          <h1 className="text-2xl font-bold">{project?.projectName} - カレンダー</h1>
        </div>

        {/* ビューモード切替と習慣選択 */}
        <div className="glass rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('heatmap')}
                className={`px-4 py-2 rounded-lg ${
                  viewMode === 'heatmap'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                ヒートマップ
              </button>
              <button
                onClick={() => setViewMode('details')}
                className={`px-4 py-2 rounded-lg ${
                  viewMode === 'details'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                習慣別
              </button>
            </div>

            {viewMode === 'details' && (
              <select
                value={selectedHabitId || ''}
                onChange={(e) => setSelectedHabitId(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {habitElements.map((element) => (
                  <option key={element.id} value={element.id}>
                    {element.elementName}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* カレンダー */}
        <div className="glass rounded-xl p-6">
          {/* 月の切り替え */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold">
              {currentMonth.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
            </h2>
            <button
              onClick={() => changeMonth(1)}
              disabled={currentMonth.getMonth() === new Date().getMonth() && 
                       currentMonth.getFullYear() === new Date().getFullYear()}
              className={`p-2 rounded-lg ${
                currentMonth.getMonth() === new Date().getMonth() && 
                currentMonth.getFullYear() === new Date().getFullYear()
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'hover:bg-gray-100'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* カレンダーグリッド */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, index) => (
              <div
                key={index}
                onClick={() => {
                  if (cell.isCurrentMonth && cell.date <= new Date()) {
                    navigate(`/projects/${projectId}/track?date=${formatDate(cell.date)}`);
                  }
                }}
                className={`
                  relative h-20 p-2 rounded-lg border transition-all
                  ${getCellColor(cell)}
                  ${cell.isCurrentMonth ? 'cursor-pointer hover:shadow-md' : ''}
                  ${cell.isToday ? 'border-blue-500 border-2' : 'border-gray-200'}
                  ${!cell.isCurrentMonth ? 'opacity-50' : ''}
                `}
              >
                <div className="text-sm font-medium">
                  {cell.date.getDate()}
                </div>
                
                {viewMode === 'details' && selectedHabitId && cell.isCurrentMonth && (
                  <div className="mt-1">
                    {(() => {
                      const record = cell.records.find(r => r.habitElementId === selectedHabitId);
                      const stats = habitStats[selectedHabitId];
                      if (record && record.status === 'completed' && stats) {
                        return (
                          <GrowthVisual 
                            stage={stats.growthStage} 
                            size="small" 
                            animated={false}
                          />
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 統計情報 */}
        {viewMode === 'details' && selectedHabitId && habitStats[selectedHabitId] && (
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              {habitElements.find(e => e.id === selectedHabitId)?.elementName} の統計
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <GrowthVisual 
                  stage={habitStats[selectedHabitId].growthStage} 
                  size="medium" 
                  showLabel={true}
                />
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {habitStats[selectedHabitId].completedDays}
                  </div>
                  <div className="text-sm text-gray-600">達成日数</div>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {habitStats[selectedHabitId].currentStreak}
                  </div>
                  <div className="text-sm text-gray-600">現在の連続記録</div>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {habitStats[selectedHabitId].completionRate.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">達成率</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 凡例 */}
        <div className="glass rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">凡例</h3>
          {viewMode === 'heatmap' ? (
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-white border rounded"></div>
                <span>0%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-100 rounded"></div>
                <span>〜25%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-200 rounded"></div>
                <span>〜50%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-300 rounded"></div>
                <span>〜75%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-400 rounded"></div>
                <span>〜99%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>100%</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-200 rounded"></div>
                <span>達成</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <span>パス</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-100 rounded"></div>
                <span>未達成</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-white border rounded"></div>
                <span>未記録</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CalendarPage;