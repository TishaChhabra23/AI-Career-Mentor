export interface AssessmentUserContext {
  educationLevel: string;
  stream?: string;
  course?: string;
  currentClassSemester?: string;
  boardUniversity?: string;
  schoolCollege?: string;
  favoriteSubjects?: string[];
  interests?: string[];
  strengths?: string[];
  skills?: string[];
  careerGoal?: string;
  careerObjective?: string;
}

export function getAssessmentGenerationPrompt(context: AssessmentUserContext): string {
  return `SYSTEM INSTRUCTIONS:
You are an expert psychometrician, academic diagnostician, and career guidance counselor.
Your task is to generate a personalized, high-quality career & academic diagnostic assessment of 8 to 10 questions tailored STRICTLY to the student's specific education level, current academic stream, and chosen course/field.

STUDENT PROFILE CONTEXT:
- Educational Level: ${context.educationLevel}
- Current Academic Stream: ${context.stream || 'General'}
- Current Course / Major: ${context.course || 'N/A'}
- Current Class / Semester: ${context.currentClassSemester || 'N/A'}
- Favorite Subjects: ${context.favoriteSubjects?.length ? context.favoriteSubjects.join(', ') : 'Not specified'}
- Key Interests: ${context.interests?.length ? context.interests.join(', ') : 'Not specified'}
- Core Strengths: ${context.strengths?.length ? context.strengths.join(', ') : 'Not specified'}
- Technical / Practical Skills: ${context.skills?.length ? context.skills.join(', ') : 'Not specified'}
- Long-term Career Goal: ${context.careerGoal || 'Career discovery'}
- Career Objective: ${context.careerObjective || 'explore_career'}

GENERATION REQUIREMENTS:
1. CURRICULUM & LEVEL ALIGNMENT:
   - For Class 10: Generate questions that evaluate aptitude across Science (PCM/PCB), Commerce, and Arts/Humanities to help the student determine their optimal Class 11 stream. Include numerical aptitude, scientific curiosity, commercial logic, verbal reasoning, and creative inclination.
   - For Class 11 / Class 12: Generate questions that test foundational concepts and aptitude in their specific stream (${context.stream || 'General'}). E.g., for Science (PCM): calculus/algebra logic, mechanics/physics intuition, computational thinking, and engineering interest. For Commerce: accounting principles, economics, business logic. For Arts: critical reading, socio-political analysis, ethics.
   - For UG / Diploma: Generate questions directly based on their course (${context.course || context.stream || 'Undergraduate discipline'}). Include core domain fundamentals (e.g. data structures/algorithms for CS/IT, financial ratios for B.Com/BBA), applied problem solving, realistic workplace scenarios, and career trajectory choices.
   - For PG: Generate advanced questions reflecting master-level depth (${context.course || 'Postgraduate discipline'}), architectural/strategic decisions, system design or management judgment, and research or industry leadership readiness.

2. STRUCTURE & SECTIONS:
   - Create exactly 8 to 10 questions organized into 4 or 5 cohesive sections, such as:
     a) "Domain Knowledge & Subject Aptitude" (MCQ with 1 clearly correct answer testing real conceptual understanding)
     b) "Applied Analytical & Problem Solving" (MCQ or scenario testing logical reasoning in their field)
     c) "Practical Scenario & Decision Making" (Scenario testing real-world trade-offs or workplace judgment)
     d) "Specialization & Skill Proficiency" (Likert or self-rating scale evaluating their confidence with key tools/concepts)
     e) "Career Direction & Future Alignment" (Likert or scenario testing career preferences, e.g. corporate vs research, specific tracks)

3. QUESTION FORMAT:
   - "mcq": Exactly 4 plausible options, with "correctAnswer" explicitly matching one of the options.
   - "scenario": A realistic 2-3 sentence situational dilemma, with 4 actionable options and scoringMetadata (optionScores giving 1 to 5 points based on effectiveness).
   - "likert": A statement assessing interest/confidence, with standard 5 options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"], and scoringMetadata optionScores 1 to 5.

4. CONSTRAINTS:
   - DO NOT generate generic/elementary questions (e.g., NO "What is 15% of 200?", NO "CAT=24 DOG=?", NO "Which logic gate returns TRUE when inputs are different?"). Questions MUST be meaningful and directly reflect ${context.educationLevel} ${context.stream || ''} ${context.course || ''}.
   - Provide a personalized "assessmentName" (e.g. "${context.educationLevel} (${context.stream || context.course || 'Academic'}) Career Aptitude Assessment").
   - Provide a clear, encouraging "description" (2-3 sentences explaining what skills and future guidance this assessment unlocks).
   - Return raw valid JSON conforming to the requested schema. Do NOT include markdown code blocks.
`;
}
