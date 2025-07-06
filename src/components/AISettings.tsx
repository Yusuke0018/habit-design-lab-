/**
 * @file AI設定コンポーネント
 * @description OpenAI APIキーの設定UI
 */

import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, X, Info } from 'lucide-react';
import { aiService } from '../services/ai';
import { useToast } from '../hooks/useToast';

interface AISettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISettings: React.FC<AISettingsProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const savedKey = aiService.getApiKey();
      if (savedKey) {
        setApiKey(savedKey);
      }
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      addToast('APIキーを入力してください', 'error');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      addToast('有効なOpenAI APIキーを入力してください', 'error');
      return;
    }

    setIsSaving(true);
    try {
      aiService.setApiKey(apiKey.trim());
      addToast('APIキーを保存しました', 'success');
      onClose();
    } catch (error) {
      addToast('保存に失敗しました', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fadeInUp">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            AI設定
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* 説明 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p className="mb-2">
                  AIアドバイス機能を利用するには、OpenAI APIキーが必要です。
                </p>
                <p>
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    OpenAIダッシュボード
                  </a>
                  でAPIキーを取得してください。
                </p>
              </div>
            </div>
          </div>

          {/* APIキー入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              OpenAI APIキー
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-2 pr-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                title={showKey ? 'APIキーを隠す' : 'APIキーを表示'}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* 注意事項 */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>※ APIキーは暗号化されずにブラウザに保存されます。</p>
            <p>※ 本番環境では適切なセキュリティ対策を実施してください。</p>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving || !apiKey.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {isSaving ? '保存中...' : '保存'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};