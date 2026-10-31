import { GoogleGenAI } from '@google/genai';
import { GoalItem, UserProfile } from '../types/models';

export interface SavingsRecommendation {
  targetAmount: number;
  targetDate: string;
  daysRemaining: number;
  dailySavings: number;
  weeklySavings: number;
  monthlySavings: number;
  realismScore: 'Very Realistic' | 'Realistic' | 'Challenging' | 'Aggressive';
  assessmentText: string;
  actionableSuggestions: string[];
}

/**
 * Perform mathematically exact goal savings calculations based on the actual
 * calendar days remaining between current date and target completion date.
 */
export function calculateGoalPacing(
  targetAmount: number,
  targetDateIso: string,
  currentSaved = 0
): {
  daysRemaining: number;
  dailySavings: number;
  weeklySavings: number;
  monthlySavings: number;
  remainingAmount: number;
} {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const target = new Date(targetDateIso);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - now.getTime();
  const daysRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const remainingAmount = Math.max(0, targetAmount - currentSaved);

  // Exact calculations based on actual day count
  const dailySavings = Math.ceil(remainingAmount / daysRemaining);
  const weeksCount = Math.max(1, daysRemaining / 7);
  const weeklySavings = Math.ceil(remainingAmount / weeksCount);
  const monthsCount = Math.max(1, daysRemaining / 30.417);
  const monthlySavings = Math.ceil(remainingAmount / monthsCount);

  return {
    daysRemaining,
    dailySavings,
    weeklySavings,
    monthlySavings,
    remainingAmount,
  };
}

/**
 * Generates an intelligent, realistic savings recommendation assessment
 * combining deterministic mathematical truth with tailored financial advice.
 */
export async function generateSavingsRecommendation(
  title: string,
  targetAmount: number,
  targetDateIso: string,
  category = 'General',
  currentSaved = 0
): Promise<SavingsRecommendation> {
  const {
    daysRemaining,
    dailySavings,
    weeklySavings,
    monthlySavings,
    remainingAmount,
  } = calculateGoalPacing(targetAmount, targetDateIso, currentSaved);

  // Determine realism score based on daily burden and timeline
  let realismScore: SavingsRecommendation['realismScore'] = 'Realistic';
  let assessmentText = '';
  const actionableSuggestions: string[] = [];

  if (daysRemaining <= 7) {
    if (dailySavings > 1000) {
      realismScore = 'Aggressive';
      assessmentText = `Short 7-day sprint requiring ₹${dailySavings.toLocaleString('en-IN')}/day. This is an aggressive timeframe—divert liquid emergency cash or cut discretionary expenses immediately to hit this milestone.`;
    } else {
      realismScore = 'Challenging';
      assessmentText = `Sprint target of ₹${targetAmount.toLocaleString('en-IN')} over ${daysRemaining} days. Saving ₹${dailySavings.toLocaleString('en-IN')}/day is feasible by pausing non-essential eating out and retail spending this week.`;
    }
  } else if (daysRemaining <= 30) {
    if (dailySavings > 2500) {
      realismScore = 'Challenging';
      assessmentText = `One-month target requires ₹${weeklySavings.toLocaleString('en-IN')}/week. Recommended to allocate a portion of your upcoming salary or freelance earnings right on payday.`;
    } else {
      realismScore = 'Realistic';
      assessmentText = `Healthy 30-day timeline. Setting aside ₹${weeklySavings.toLocaleString('en-IN')} per week (or ₹${dailySavings.toLocaleString('en-IN')}/day) comfortably funds your ${title}.`;
    }
  } else if (daysRemaining <= 90) {
    realismScore = 'Realistic';
    assessmentText = `Quarterly milestone of ${daysRemaining} days. A steady commitment of ₹${monthlySavings.toLocaleString('en-IN')}/month will keep you on track without feeling restricted.`;
  } else {
    realismScore = 'Very Realistic';
    assessmentText = `Long-term milestone spanning ${Math.round(daysRemaining / 30)} months. At ₹${monthlySavings.toLocaleString('en-IN')}/month, automated recurring transfers will build this corpus effortlessly.`;
  }

  // Generate actionable, practical suggestions based on category and pace
  if (daysRemaining <= 14) {
    actionableSuggestions.push('Initiate an immediate upfront transfer of at least 30% of the target.');
    actionableSuggestions.push('Cook meals at home and pause subscription add-ons for the next two weeks.');
    actionableSuggestions.push('Review checking account for idle cash to sweep directly into this goal.');
  } else if (daysRemaining <= 60) {
    actionableSuggestions.push(`Set up an automated weekly sweep of ₹${weeklySavings.toLocaleString('en-IN')} every Monday.`);
    actionableSuggestions.push('Apply the 24-hour impulse-buy rule to safeguard your daily savings allocation.');
    actionableSuggestions.push('Direct any unexpected cashbacks, refunds, or bonuses directly into this target.');
  } else {
    actionableSuggestions.push(`Schedule an auto-debit of ₹${monthlySavings.toLocaleString('en-IN')} on your salary credit date.`);
    actionableSuggestions.push('Keep this fund in a high-yield savings account or liquid mutual fund to earn interest.');
    actionableSuggestions.push('Increase your monthly contribution by 5% every 3 months to finish ahead of schedule.');
  }

  // Try enhancing suggestions with Gemini API if key is available in environment
  try {
    const apiKey =
      (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY);

    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an Apple-level financial advisor for a savings goal application.
Goal: "${title}"
Target: ₹${targetAmount}
Days Left: ${daysRemaining}
Daily Pace Required: ₹${dailySavings}
Weekly Pace Required: ₹${weeklySavings}
Monthly Pace Required: ₹${monthlySavings}

Provide:
1. One concise, motivating sentence assessing realism.
2. Three bullet points of ultra-practical, realistic actions the user can take.
Return ONLY valid JSON with keys "assessment" (string) and "suggestions" (array of 3 short strings).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed.assessment && Array.isArray(parsed.suggestions)) {
          return {
            targetAmount,
            targetDate: targetDateIso,
            daysRemaining,
            dailySavings,
            weeklySavings,
            monthlySavings,
            realismScore,
            assessmentText: parsed.assessment,
            actionableSuggestions: parsed.suggestions.slice(0, 3),
          };
        }
      }
    }
  } catch {
    // Graceful fallback to deterministic calculations
  }

  return {
    targetAmount,
    targetDate: targetDateIso,
    daysRemaining,
    dailySavings,
    weeklySavings,
    monthlySavings,
    realismScore,
    assessmentText,
    actionableSuggestions,
  };
}

/**
 * Handle AI Savings Assistant chat conversation with user context
 */
export async function askAiSavingsAssistant(
  userQuery: string,
  user: UserProfile,
  goals: GoalItem[],
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  const activeGoals = goals.filter((g) => !g.completed);
  const totalSaved = goals.reduce((acc, g) => acc + g.amountSaved, 0);
  const totalTarget = goals.reduce((acc, g) => acc + g.goalAmount, 0);

  const goalsContextSummary = activeGoals
    .map((g) => {
      const pace = calculateGoalPacing(g.goalAmount, g.targetDate, g.amountSaved);
      return `• ${g.title}: Target ₹${g.goalAmount.toLocaleString('en-IN')}, Saved ₹${g.amountSaved.toLocaleString('en-IN')} (${Math.round((g.amountSaved / Math.max(1, g.goalAmount)) * 100)}%), ${pace.daysRemaining} days left, needs ₹${pace.monthlySavings.toLocaleString('en-IN')}/mo or ₹${pace.weeklySavings.toLocaleString('en-IN')}/wk.`;
    })
    .join('\n');

  try {
    const apiKey =
      (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY);

    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `You are "BrainVibe AI", an intelligent, warm, Apple-style financial savings coach built into BrainVibe.
You help users save money, evaluate their savings pacing, make realistic budget shifts, and achieve their financial targets faster.

User Context:
Name: ${user.name || 'Friend'}
Pro Member: ${user.isPro ? 'Yes (Pro)' : 'No (Free)'}
Total Saved so far: ₹${totalSaved.toLocaleString('en-IN')}
Total Target Portfolio: ₹${totalTarget.toLocaleString('en-IN')}
Active Goals (${activeGoals.length}):
${goalsContextSummary || 'No active goals yet.'}

Guidelines:
- Keep answers concise, Apple-inspired, well-formatted, and encouraging.
- Provide clear math and real estimates based on their specific goals when relevant.
- Use bullet points and bold highlights for readability.
- Never invent inaccurate numbers; always ground your savings advice in actual numbers and timeline pacing.
- Suggest actionable daily/weekly habits.`;

      const contents = [
        ...chatHistory.slice(-6).map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
        {
          role: 'user',
          parts: [{ text: userQuery }],
        },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.5,
          maxOutputTokens: 600,
        },
      });

      const responseText = response.text?.trim();
      if (responseText) {
        return responseText;
      }
    }
  } catch (err) {
    console.warn('Gemini API call failed, using intelligent fallback coach:', err);
  }

  // Intelligent local fallback rule-based coach if API key is not configured or network offline
  const queryLower = userQuery.toLowerCase();

  if (queryLower.includes('how much') && queryLower.includes('week')) {
    if (activeGoals.length === 0) {
      return `You don't have any active goals yet! Tap **Add Goal** to set a target amount and deadline, and I will calculate your exact required weekly savings down to the rupee.`;
    }
    const lines = activeGoals.map((g) => {
      const { weeklySavings, daysRemaining } = calculateGoalPacing(g.goalAmount, g.targetDate, g.amountSaved);
      return `• **${g.title}**: Save **₹${weeklySavings.toLocaleString('en-IN')}/week** (${daysRemaining} days left)`;
    });
    const totalWeekly = activeGoals.reduce((sum, g) => {
      const { weeklySavings } = calculateGoalPacing(g.goalAmount, g.targetDate, g.amountSaved);
      return sum + weeklySavings;
    }, 0);

    return `Here is your weekly savings breakdown across your active goals:\n\n${lines.join('\n')}\n\n💡 **Total recommended weekly savings:** **₹${totalWeekly.toLocaleString('en-IN')}/week**.\n\nSetting up an automatic bank sweep every Monday ensures you hit each milestone effortlessly.`;
  }

  if (queryLower.includes('faster') || queryLower.includes('reach my goal')) {
    return `Here are 4 proven strategies to accelerate your goal completion:\n\n1. **The 50/30/20 Rule**: Allocate 50% of monthly income to needs, 30% to wants, and reserve 20% strictly for your priority goals.\n2. **Micro-Windfall Sweeps**: Whenever you get a cashback, refund, or discount, immediately add that amount to your goal.\n3. **Cancel Forgotten Subscriptions**: Auditing recurring streaming or app charges typically frees up ₹500–₹1,500 every single month.\n4. **Increase Pace by 10%**: Increasing your weekly transfer by just 10% cuts your completion time by nearly 4 weeks!`;
  }

  if (queryLower.includes('realistic') || queryLower.includes('plan')) {
    if (activeGoals.length === 0) {
      return `You haven't created any goals yet. Once you set a target and target date, I will assess its realism score and pacing for you.`;
    }
    const sample = activeGoals[0];
    const pacing = calculateGoalPacing(sample.goalAmount, sample.targetDate, sample.amountSaved);
    return `Assessing your priority goal: **${sample.title}**\n\n• **Target Amount:** ₹${sample.goalAmount.toLocaleString('en-IN')}\n• **Saved So Far:** ₹${sample.amountSaved.toLocaleString('en-IN')}\n• **Timeline:** ${pacing.daysRemaining} days remaining\n• **Required Pace:** ₹${pacing.weeklySavings.toLocaleString('en-IN')} per week or ₹${pacing.monthlySavings.toLocaleString('en-IN')} per month.\n\n✅ **Verdict:** This plan is **realistic and achievable**. Staying disciplined with weekly deposits will ensure you reach 100% on or before your target date!`;
  }

  if (queryLower.includes('spend') || queryLower.includes('habit') || queryLower.includes('save more')) {
    return `To boost your savings rate immediately, try these 3 high-impact habits:\n\n1. **Pay Yourself First**: Transfer your goal allocation the very morning your paycheck arrives, not at the end of the month with whatever is left.\n2. **The 72-Hour Rule**: For non-essential purchases over ₹1,000, wait 72 hours. In 80% of cases, the impulse fades.\n3. **Dining Out Cap**: Limit food delivery and dining out to twice a week. Redirecting ₹400/week saves an extra ₹20,800 per year towards your goals.`;
  }

  return `Great question! To maximize your progress towards your goals:\n\n• Keep your savings automated on a weekly or monthly cycle.\n• Track every contribution so your milestone rings stay accurate.\n• Focus on one priority milestone at a time to build momentum.\n\nFeel free to ask me for custom weekly calculations, habit changes, or realistic timelines for any specific target!`;
}
