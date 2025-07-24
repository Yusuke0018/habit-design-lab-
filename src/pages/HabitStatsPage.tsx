/**
 * @file 習慣統計画面
 * @description 習慣の詳細な統計情報と成長履歴を表示
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Trophy, Target } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import GrowthVisual from '../components/GrowthVisual';
import { useAuth } from '../contexts/AuthContext';
import { getProject } from '../services/projects';
import { getHabitElements } from '../services/habitElements';
import { 
  getProjectHabitStats, 
  getHabitRecordsByDateRange,
  GROWTH_STAGES,
  formatDate
} from '../services/habitRecords';
import type { Project, HabitElement, HabitStats, HabitRecord } from '../types';

interface HabitProgress {
  element: HabitElement;
  stats: HabitStats;
  recentRecords: HabitRecord[];
}

const HabitStatsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [habitProgress, setHabitProgress] = useState<HabitProgress[]>([]);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [projectId, user]);

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
      
      // 統計情報を取得
      const stats = await getProjectHabitStats(
        user.uid,
        projectId,
        elements.map(e => e.id!).filter(Boolean)
      );

      // 各習慣の最近の記録を取得（過去30日分）
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const progressData: HabitProgress[] = [];
      for (let i = 0; i < elements.length; i++) {
        if (elements[i].id) {
          const records = await getHabitRecordsByDateRange(
            user.uid,
            elements[i].id!,
            formatDate(startDate),
            formatDate(endDate)
          );
          progressData.push({
            element: elements[i],
            stats: stats[i],
            recentRecords: records
          });
        }
      }

      setHabitProgress(progressData);
      if (progressData.length > 0) {
        setSelectedHabitId(progressData[0].element.id!);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('データの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedHabit = habitProgress.find(h => h.element.id === selectedHabitId);

  const getStreakTrend = (records: HabitRecord[]): number[] => {
    const trend: number[] = [];
    const recordMap = new Map<string, HabitRecord>();
    
    // レコードを日付でマップ化
    records.forEach(record => {
      recordMap.set(record.date, record);
    });
    
    // 過去30日分のデータを生成
    const today = new Date();
    let currentStreak = 0;
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date);
      
      const record = recordMap.get(dateStr);
      
      if (record && (record.status === 'completed' || record.status === 'passed')) {
        currentStreak++;
      } else {
        currentStreak = 0;
      }
      
      trend.push(currentStreak);
    }

    return trend;
  };

  const getWeeklyStats = (records: HabitRecord[]) => {
    const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
    const stats = weekDays.map(() => ({ completed: 0, total: 0 }));

    records.forEach(record => {
      const day = new Date(record.date).getDay();
      stats[day].total++;
      if (record.status === 'completed') {
        stats[day].completed++;
      }
    });

    return stats.map((stat, index) => ({
      day: weekDays[index],
      rate: stat.total > 0 ? (stat.completed / stat.total) * 100 : 0,
      completed: stat.completed,
      total: stat.total
    }));
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
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
          </div>
          <h1 className="text-2xl font-bold">{project?.projectName} - 統計・振り返り</h1>
        </div>

        {/* 習慣選択タブ */}
        <div className="glass rounded-xl p-4">
          <div className="flex flex-wrap gap-2">
            {habitProgress.map((habit) => (
              <button
                key={habit.element.id}
                onClick={() => setSelectedHabitId(habit.element.id!)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedHabitId === habit.element.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <GrowthVisual 
                    stage={habit.stats.growthStage} 
                    size="small" 
                    animated={false}
                  />
                  <span>{habit.element.elementName}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedHabit && (
          <>
            {/* メイン統計 */}
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6">{selectedHabit.element.elementName}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 成長ビジュアル */}
                <div className="text-center">
                  <GrowthVisual 
                    stage={selectedHabit.stats.growthStage} 
                    size="large" 
                    showLabel={true}
                  />
                  <div className="mt-4">
                    <div className="text-sm text-gray-600">次のステージまで</div>
                    <div className="text-lg font-semibold">
                      {(() => {
                        const nextStageIndex = GROWTH_STAGES.findIndex(s => s.stage === selectedHabit.stats.growthStage) + 1;
                        if (nextStageIndex < GROWTH_STAGES.length) {
                          const nextStage = GROWTH_STAGES[nextStageIndex];
                          const daysToNext = nextStage.minDays - selectedHabit.stats.completedDays;
                          return `あと${daysToNext}日`;
                        }
                        return '最高レベル達成！';
                      })()}
                    </div>
                  </div>
                </div>

                {/* 主要統計 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">総達成日数</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {selectedHabit.stats.completedDays}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                      <span className="text-gray-700">現在の連続</span>
                    </div>
                    <span className="text-2xl font-bold text-orange-600">
                      {selectedHabit.stats.currentStreak}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700">達成率</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {selectedHabit.stats.completionRate.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* 追加情報 */}
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">最長連続記録</div>
                    <div className="text-3xl font-bold text-gray-800">
                      {selectedHabit.stats.longestStreak}日
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">パス日数</div>
                    <div className="text-3xl font-bold text-gray-800">
                      {selectedHabit.stats.passedDays}日
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">記録開始から</div>
                    <div className="text-3xl font-bold text-gray-800">
                      {selectedHabit.stats.totalDays}日
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 曜日別統計 */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">曜日別達成率</h3>
              <div className="space-y-3">
                {getWeeklyStats(selectedHabit.recentRecords).map((stat) => (
                  <div key={stat.day} className="flex items-center space-x-3">
                    <div className="w-8 text-center font-medium">{stat.day}</div>
                    <div className="flex-1">
                      <div className="h-8 bg-gray-200 rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-end pr-2"
                          style={{ width: `${stat.rate}%` }}
                        >
                          {stat.rate > 0 && (
                            <span className="text-xs text-white font-medium">
                              {stat.rate.toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 w-16 text-right">
                      {stat.completed}/{stat.total}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 連続記録グラフ */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">過去30日間の連続記録推移</h3>
              {(() => {
                const streakData = getStreakTrend(selectedHabit.recentRecords);
                const maxStreak = Math.max(...streakData, 1); // 最小値を1に設定
                
                if (streakData.length === 0) {
                  return (
                    <div className="h-48 flex items-center justify-center text-gray-500">
                      まだ記録がありません
                    </div>
                  );
                }
                
                return (
                  <>
                    <div className="h-48 flex items-end space-x-1">
                      {streakData.map((streak, index) => (
                        <div
                          key={index}
                          className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t transition-all hover:opacity-80 relative group"
                          style={{ 
                            height: streak === 0 ? '2px' : `${(streak / maxStreak) * 100}%`,
                            minHeight: '2px'
                          }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {streak}日
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-gray-600">
                      <span>30日前</span>
                      <span>今日</span>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* 成長の軌跡 */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">成長の軌跡</h3>
              <div className="flex items-center justify-between space-x-2">
                {GROWTH_STAGES.map((stage) => (
                  <div
                    key={stage.stage}
                    className={`flex-1 text-center ${
                      selectedHabit.stats.completedDays >= stage.minDays
                        ? 'opacity-100'
                        : 'opacity-30'
                    }`}
                  >
                    <div className="text-3xl mb-2">{stage.emoji}</div>
                    <div className="text-xs font-medium">{stage.name}</div>
                    <div className="text-xs text-gray-600">{stage.minDays}日〜</div>
                    {selectedHabit.stats.completedDays >= stage.minDays && 
                     selectedHabit.stats.completedDays <= stage.maxDays && (
                      <div className="mt-1 w-2 h-2 bg-green-500 rounded-full mx-auto animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
  );
};

export default HabitStatsPage;