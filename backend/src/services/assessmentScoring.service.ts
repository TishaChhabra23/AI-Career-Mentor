import { IAssessmentQuestion } from '../models/AssessmentQuestion';

interface UserAnswer {
  questionId: any;
  selectedOption: string;
}

export const scoreAssessmentAttempt = (
  questions: IAssessmentQuestion[],
  answers: UserAnswer[]
) => {
  const sectionPoints: Record<string, { earned: number; max: number; name: string }> = {};

  // Build key-value map for quick lookup
  const questionMap = new Map<string, IAssessmentQuestion>();
  for (const q of questions) {
    questionMap.set(q._id.toString(), q);
  }

  // Pre-initialize section names/max points based on all questions loaded
  for (const q of questions) {
    if (!sectionPoints[q.sectionId]) {
      sectionPoints[q.sectionId] = {
        earned: 0,
        max: 0,
        name: q.sectionName
      };
    }
    // Compute max points
    if (q.questionType === 'mcq') {
      sectionPoints[q.sectionId].max += q.weightage;
    } else {
      // For non-MCQ (likert, self-rating), the maximum score is typically 5 (Strongly Agree) * weightage
      // Let's read the max score from scoringMetadata.optionScores map if possible, or fall back to 5.
      let maxOptVal = 5;
      if (q.scoringMetadata && q.scoringMetadata.optionScores) {
        const optScores = q.scoringMetadata.optionScores;
        let values: any[] = [];
        if (typeof (optScores as any).values === 'function') {
          values = Array.from((optScores as any).values());
        } else if (typeof (optScores as any).get === 'function') {
          // If Mongoose Map
          values = Array.from((optScores as any).values());
        } else if (typeof optScores === 'object') {
          values = Object.values(optScores);
        }
        if (values.length > 0) {
          const numberValues = values.map(v => Number(v)).filter(v => !isNaN(v));
          if (numberValues.length > 0) {
            maxOptVal = Math.max(...numberValues);
          }
        }
      }
      sectionPoints[q.sectionId].max += maxOptVal * q.weightage;
    }
  }

  // Evaluate each user answer
  for (const ans of answers) {
    const q = questionMap.get(ans.questionId.toString());
    if (!q) continue;

    let earned = 0;

    if (q.questionType === 'mcq') {
      // Check correctness
      if (q.correctAnswer && q.correctAnswer.trim().toLowerCase() === ans.selectedOption.trim().toLowerCase()) {
        earned = q.weightage;
      }
    } else {
      // Likert or self-rating
      let scoreVal = 0;
      if (q.scoringMetadata && q.scoringMetadata.optionScores) {
        // OptionScores is stored as a Map or simple object
        // Map in mongoose has a .get() method, otherwise check direct property
        const optScores = q.scoringMetadata.optionScores;
        if (typeof (optScores as any).get === 'function') {
          scoreVal = (optScores as any).get(ans.selectedOption) || 0;
        } else {
          scoreVal = (optScores as any)[ans.selectedOption] || 0;
        }
      }

      // Default Likert fallback
      if (scoreVal === 0) {
        const val = ans.selectedOption.trim().toLowerCase();
        if (val.includes('strongly disagree')) scoreVal = 1;
        else if (val.includes('strongly agree')) scoreVal = 5;
        else if (val.includes('disagree')) scoreVal = 2;
        else if (val.includes('agree')) scoreVal = 4;
        else if (val.includes('neutral') || val.includes('undecided')) scoreVal = 3;
        else {
          // If option is a number value represented as string
          const parsed = parseInt(val, 10);
          if (!isNaN(parsed)) scoreVal = parsed;
        }
      }

      earned = scoreVal * q.weightage;
    }

    sectionPoints[q.sectionId].earned += earned;
  }

  // Compute final percentages
  const sectionScores = new Map<string, number>();
  let totalPercentSum = 0;
  let sectionsCount = 0;

  for (const sectionId in sectionPoints) {
    const { earned, max, name } = sectionPoints[sectionId];
    // Avoid division by zero
    const pct = max > 0 ? Math.round((earned / max) * 100) : 0;
    sectionScores.set(name, pct);
    totalPercentSum += pct;
    sectionsCount++;
  }

  const overallScore = sectionsCount > 0 ? Math.round(totalPercentSum / sectionsCount) : 0;

  return {
    sectionScores,
    overallScore
  };
};
