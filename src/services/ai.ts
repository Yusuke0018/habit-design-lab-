/**
 * @file AI分析サービス
 * @description OpenAI APIを使用した習慣分析・アドバイス機能
 */

import type { Project, HabitElement, CheckHistory } from '../types';

interface AIAnalysisRequest {
  project: Project;
  habitElements: HabitElement[];
  checkHistory: CheckHistory;
}

interface AIAdvice {
  summary: string;
  strengths: string[];
  improvements: string[];
  nextActions: string[];
  motivationalMessage: string;
}

class AIService {
  private apiKey: string | null = null;
  private baseURL = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
  }

  /**
   * APIキーを設定
   */
  setApiKey(key: string) {
    this.apiKey = key;
    // ローカルストレージに保存（暗号化推奨）
    localStorage.setItem('openai_api_key', key);
  }

  /**
   * APIキーを取得
   */
  getApiKey(): string | null {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem('openai_api_key');
    }
    return this.apiKey;
  }

  /**
   * APIキーが設定されているか確認
   */
  hasApiKey(): boolean {
    return !!this.getApiKey();
  }

  /**
   * 振り返りデータを分析してAIアドバイスを生成
   */
  async analyzeCheckHistory(data: AIAnalysisRequest): Promise<AIAdvice> {
    if (!this.hasApiKey()) {
      throw new Error('OpenAI APIキーが設定されていません');
    }

    const prompt = this.buildAnalysisPrompt(data);
    
    try {
      const response = await fetch(`${this.baseURL}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'o3',
          input: [
            {
              role: 'system',
              content: `あなたは習慣形成の専門家です。BJ Foggの行動モデル（B=MAP）と習慣デザインの原則に基づいて、
              ユーザーの振り返りを分析し、建設的で実践的なアドバイスを提供してください。
              アドバイスは具体的で、実行可能で、励みになるものにしてください。`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          text: {
            format: {
              type: 'text'
            }
          },
          reasoning: {
            effort: 'medium',
            summary: 'auto'
          },
          tools: [],
          store: true
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'AI分析に失敗しました');
      }

      const result = await response.json();
      const advice = JSON.parse(result.output || result.content || '{}');

      return {
        summary: advice.summary || '',
        strengths: advice.strengths || [],
        improvements: advice.improvements || [],
        nextActions: advice.nextActions || [],
        motivationalMessage: advice.motivationalMessage || ''
      };
    } catch (error) {
      console.error('AI analysis error:', error);
      throw error;
    }
  }

  /**
   * 分析用のプロンプトを構築
   */
  private buildAnalysisPrompt(data: AIAnalysisRequest): string {
    const { project, habitElements, checkHistory } = data;

    const habitInfo = habitElements.map(element => {
      const design = element.habitDesign || { minimalAction: '', ifThenRules: [], rewards: [] };
      const ifThenRules = design.ifThenRules?.map(rule => 
        `  - ${rule.trigger}`
      ).join('\n') || '未設定';
      const rewards = design.rewards?.map(reward => 
        `  - 条件: ${reward.condition} → 報酬: ${reward.celebration}`
      ).join('\n') || '未設定';
      
      return `
習慣要素: ${element.elementName}
インパクト: ${element.impact}/10
実現可能性: ${element.feasibility}/10
極小化（最低限すべき習慣）:
  ${design.minimalAction || '未設定'}
If-Thenルール（トリガー）:
${ifThenRules}
祝福（報酬）:
${rewards}`;
    }).join('\n\n');

    return `
以下の習慣プロジェクトの振り返りを分析して、JSONフォーマットでアドバイスを提供してください。

## プロジェクト情報
- プロジェクト名: ${project.projectName}
- 願望: ${project.aspiration}
- 得たい感情: ${project.feeling}

## 習慣要素
${habitInfo}

## 今回の振り返り
- うまくいった点: ${checkHistory.wellDone}
- 難しかった点: ${checkHistory.difficult}
- 次に試したいこと: ${checkHistory.nextTry}
- 自由記述: ${checkHistory.freeText || 'なし'}

以下のJSON構造でレスポンスしてください：
{
  "summary": "全体的な分析サマリー（100文字程度）",
  "strengths": ["強み1", "強み2", "強み3"],
  "improvements": ["改善ポイント1", "改善ポイント2", "改善ポイント3"],
  "nextActions": ["具体的なアクション1", "具体的なアクション2", "具体的なアクション3"],
  "motivationalMessage": "励みになるメッセージ（50文字程度）"
}`;
  }
}

export const aiService = new AIService();
export type { AIAdvice };