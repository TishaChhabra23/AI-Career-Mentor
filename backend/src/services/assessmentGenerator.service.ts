import { Types } from 'mongoose';
import { Assessment, IAssessment } from '../models/Assessment';
import { AssessmentQuestion } from '../models/AssessmentQuestion';
import { AssessmentProgress } from '../models/AssessmentProgress';
import { EducationDetails, IEducationDetails } from '../models/EducationDetails';
import { StudentProfile, IStudentProfile } from '../models/StudentProfile';
import { UserAICredential } from '../models/UserAICredential';
import { env } from '../config/env';
import { decryptKey } from '../utils/crypto';
import { callGeminiAPI } from './gemini.service';
import { assessmentGenerationSchema, AssessmentGenerationResult } from '../validators/ai/assessmentGeneration.schema';
import { getAssessmentGenerationPrompt, AssessmentUserContext } from '../prompts/assessmentGeneration.prompt';

interface QuestionDef {
  sectionId: string;
  sectionName: string;
  questionType: 'mcq' | 'likert' | 'scenario';
  question: string;
  options: string[];
  correctAnswer?: string;
  scoringMetadata?: {
    optionScores?: Record<string, number>;
  };
  weightage?: number;
}

// Built-in curriculum question sets categorized by Education Level and Academic Stream / Course
const getCurriculumQuestions = (
  educationLevel: string,
  stream: string = '',
  course: string = ''
): { name: string; description: string; questions: QuestionDef[] } => {
  const normStream = (stream || '').toLowerCase();
  const normCourse = (course || '').toLowerCase();

  // 1. CLASS 10 (Stream Decider: Science vs Commerce vs Arts)
  if (educationLevel === 'Class10') {
    return {
      name: 'Class 10 Stream Decider & Aptitude Assessment',
      description: 'Personalized diagnostic evaluating your mathematical intuition, scientific curiosity, commercial logic, and verbal reasoning to guide your optimal Class 11 stream selection.',
      questions: [
        {
          sectionId: 'numerical_aptitude',
          sectionName: 'Numerical & Mathematical Logic',
          questionType: 'mcq',
          question: 'A shopkeeper offers a 20% discount on an item and still earns a 20% profit. If the cost price is ₹500, what is the marked price?',
          options: ['₹650', '₹750', '₹800', '₹720'],
          correctAnswer: '₹750',
          weightage: 1
        },
        {
          sectionId: 'scientific_enquiry',
          sectionName: 'Scientific Curiosity & Analysis',
          questionType: 'mcq',
          question: 'When light passes from air into a glass prism, it bends towards the normal primarily because:',
          options: [
            'Its speed decreases in the denser medium',
            'Its frequency increases inside glass',
            'Glass absorbs light photons partially',
            'The wavelength remains strictly unchanged'
          ],
          correctAnswer: 'Its speed decreases in the denser medium',
          weightage: 1
        },
        {
          sectionId: 'commercial_reasoning',
          sectionName: 'Commerce & Economic Intuition',
          questionType: 'scenario',
          question: 'If the supply of fresh oranges suddenly drops drastically due to unexpected frost, but consumer demand remains steady, what economic outcome is most probable?',
          options: [
            'The market price will increase and equilibrium quantity will drop',
            'The market price and quantity will both remain unchanged',
            'The market price will drop to stimulate purchases',
            'Government will immediately take over all citrus production'
          ],
          scoringMetadata: {
            optionScores: {
              'The market price will increase and equilibrium quantity will drop': 5,
              'The market price and quantity will both remain unchanged': 1,
              'The market price will drop to stimulate purchases': 2,
              'Government will immediately take over all citrus production': 1
            }
          },
          weightage: 1
        },
        {
          sectionId: 'verbal_humanities',
          sectionName: 'Verbal Fluency & Critical Thinking',
          questionType: 'mcq',
          question: 'Identify the statement that best distinguishes a "Fact" from an "Opinion":',
          options: [
            'A fact can be objectively verified through empirical evidence or historical records',
            'A fact is any statement that the majority of people agree with',
            'An opinion is always false, whereas a fact is always morally good',
            'A fact never changes under any circumstances in history'
          ],
          correctAnswer: 'A fact can be objectively verified through empirical evidence or historical records',
          weightage: 1
        },
        {
          sectionId: 'practical_interests',
          sectionName: 'Hands-on & Experimental Interest',
          questionType: 'likert',
          question: 'I genuinely enjoy building physical models, conducting science lab experiments, or troubleshooting how gadgets work.',
          options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
          scoringMetadata: {
            optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 }
          },
          weightage: 1
        },
        {
          sectionId: 'commercial_interest',
          sectionName: 'Business & Financial Interest',
          questionType: 'likert',
          question: 'I find it fascinating to understand how companies make profits, stock markets operate, and new startups scale.',
          options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
          scoringMetadata: {
            optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 }
          },
          weightage: 1
        },
        {
          sectionId: 'humanities_interest',
          sectionName: 'Societal, Creative & Humanistic Interest',
          questionType: 'likert',
          question: 'I love reading literature, understanding world history, debating social policies, or creating artistic and written content.',
          options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
          scoringMetadata: {
            optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 }
          },
          weightage: 1
        },
        {
          sectionId: 'stream_preference',
          sectionName: 'Target Stream Alignment',
          questionType: 'scenario',
          question: 'Given an open-ended school project, which topic would you spontaneously choose to research and present?',
          options: [
            'Designing an automated solar-powered irrigation prototype (Science - Tech)',
            'Analyzing the business model and revenue strategy of a fast-fashion brand (Commerce)',
            'Investigating the clinical trials of genetic mRNA vaccines (Science - Medical)',
            'Writing a documentary essay on cultural movements in the 20th century (Humanities)'
          ],
          scoringMetadata: {
            optionScores: {
              'Designing an automated solar-powered irrigation prototype (Science - Tech)': 5,
              'Analyzing the business model and revenue strategy of a fast-fashion brand (Commerce)': 5,
              'Investigating the clinical trials of genetic mRNA vaccines (Science - Medical)': 5,
              'Writing a documentary essay on cultural movements in the 20th century (Humanities)': 5
            }
          },
          weightage: 1
        }
      ]
    };
  }

  // 2. CLASS 11 / 12 - SCIENCE (PCM / CS / Engineering Track)
  if (
    (educationLevel === 'Class11' || educationLevel === 'Class12') &&
    (normStream.includes('pcm') || normStream.includes('tech') || normStream.includes('cs') || (!normStream.includes('pcb') && !normStream.includes('bio') && !normStream.includes('comm') && !normStream.includes('art')))
  ) {
    return {
      name: `${educationLevel} (Science - PCM) Engineering & Tech Career Aptitude Assessment`,
      description: `Tailored for ${educationLevel} Science (PCM) students to evaluate mathematical analysis, physics foundations, computational logic, and technology degree pathways.`,
      questions: [
        {
          sectionId: 'mathematical_analysis',
          sectionName: 'Advanced Mathematical Analysis',
          questionType: 'mcq',
          question: 'If a function f(x) = x³ - 3x² + 4, what are the x-coordinates of its local stationary points?',
          options: ['x = 0 and x = 2', 'x = 1 and x = -1', 'x = 0 and x = 3', 'x = 2 and x = -2'],
          correctAnswer: 'x = 0 and x = 2',
          weightage: 1
        },
        {
          sectionId: 'physics_mechanics',
          sectionName: 'Physical Systems & Mechanics',
          questionType: 'mcq',
          question: 'A projectile is launched with velocity v at an angle θ with the horizontal. At the peak of its trajectory, what is its acceleration?',
          options: [
            'g acting downwards',
            'Zero, since vertical velocity is zero',
            'g cos(θ) along the trajectory',
            'g sin(θ) backwards'
          ],
          correctAnswer: 'g acting downwards',
          weightage: 1
        },
        {
          sectionId: 'computational_logic',
          sectionName: 'Algorithmic & Computational Thinking',
          questionType: 'mcq',
          question: 'In a binary search algorithm operating over an array of 1,024 sorted numbers, what is the maximum number of comparisons required to locate an element?',
          options: ['10 comparisons', '512 comparisons', '100 comparisons', '32 comparisons'],
          correctAnswer: '10 comparisons',
          weightage: 1
        },
        {
          sectionId: 'engineering_scenario',
          sectionName: 'Engineering Problem Solving',
          questionType: 'scenario',
          question: 'You are designing a bridge truss. Under unexpected traffic stress, a structural beam begins vibrating with a frequency close to wind resonance. What is the soundest engineering countermeasure?',
          options: [
            'Install tuned mass dampers and reinforce cross-bracing to alter resonance frequency',
            'Simply paint the bridge with water-resistant elastomer coatings',
            'Ignore the vibration as long as cars move at normal speed',
            'Double the bridge length to disperse vibrational energy'
          ],
          scoringMetadata: {
            optionScores: {
              'Install tuned mass dampers and reinforce cross-bracing to alter resonance frequency': 5,
              'Double the bridge length to disperse vibrational energy': 2,
              'Simply paint the bridge with water-resistant elastomer coatings': 1,
              'Ignore the vibration as long as cars move at normal speed': 1
            }
          },
          weightage: 1
        },
        {
          sectionId: 'tech_interests',
          sectionName: 'Software & Electronics Aptitude',
          questionType: 'likert',
          question: 'I feel deeply energized when writing code, debugging algorithms, or exploring computer architecture and machine learning.',
          options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
          scoringMetadata: {
            optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 }
          },
          weightage: 1
        },
        {
          sectionId: 'systems_thinking',
          sectionName: 'Applied Hardware & Physical Prototyping',
          questionType: 'likert',
          question: 'I enjoy understanding the mechanical components, thermodynamics, robotics, or aerodynamic properties of physical machinery.',
          options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
          scoringMetadata: {
            optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 }
          },
          weightage: 1
        },
        {
          sectionId: 'degree_pathway',
          sectionName: 'Undergraduate Degree Pathway',
          questionType: 'scenario',
          question: 'When considering your college education, which bachelor degree curriculum appeals most to your career vision?',
          options: [
            'BTech / BE in Computer Science or Artificial Intelligence',
            'BTech in Mechanical, Aerospace, or Robotics Engineering',
            'Integrated BSc / BS-MS in Pure Mathematics or Theoretical Physics',
            'BTech in Electronics & Communication / Semiconductor Design'
          ],
          scoringMetadata: {
            optionScores: {
              'BTech / BE in Computer Science or Artificial Intelligence': 5,
              'BTech in Mechanical, Aerospace, or Robotics Engineering': 5,
              'Integrated BSc / BS-MS in Pure Mathematics or Theoretical Physics': 5,
              'BTech in Electronics & Communication / Semiconductor Design': 5
            }
          },
          weightage: 1
        },
        {
          sectionId: 'work_style',
          sectionName: 'R&D and Innovation Work Style',
          questionType: 'likert',
          question: 'I prefer working on complex technical challenges that require rigorous mathematical proof or deep system architecture.',
          options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
          scoringMetadata: {
            optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 }
          },
          weightage: 1
        }
      ]
    };
  }

  // 3. CLASS 11 / 12 - SCIENCE (PCB / Medical / Life Sciences Track)
  if (
    (educationLevel === 'Class11' || educationLevel === 'Class12') &&
    (normStream.includes('pcb') || normStream.includes('bio') || normStream.includes('med'))
  ) {
    return {
      name: `${educationLevel} (Science - PCB) Medical & Life Sciences Aptitude Assessment`,
      description: `Tailored for ${educationLevel} PCB students to evaluate biological sciences aptitude, diagnostic reasoning, biochemical analysis, and healthcare degree pathways.`,
      questions: [
        {
          sectionId: 'biological_systems',
          sectionName: 'Genetics & Cellular Biology',
          questionType: 'mcq',
          question: 'In a cross between two heterozygous pea plants (Tt x Tt), what is the expected probability of obtaining a homozygous recessive (tt) offspring?',
          options: ['25% (1/4)', '50% (1/2)', '75% (3/4)', '0%'],
          correctAnswer: '25% (1/4)',
          weightage: 1
        },
        {
          sectionId: 'biochemistry',
          sectionName: 'Biochemistry & Physiological Reactions',
          questionType: 'mcq',
          question: 'During cellular respiration, which stage generates the majority of ATP molecules via oxidative phosphorylation?',
          options: [
            'Electron Transport Chain (ETC)',
            'Glycolysis in cytoplasm',
            'Krebs Cycle in mitochondrial matrix',
            'Lactic acid fermentation'
          ],
          correctAnswer: 'Electron Transport Chain (ETC)',
          weightage: 1
        },
        {
          sectionId: 'diagnostic_observation',
          sectionName: 'Scientific Observation & Diagnostic Reasoning',
          questionType: 'scenario',
          question: 'A blood sample reveals elevated levels of white blood cells (leukocytes) alongside increased neutrophil count. What is the most scientifically sound inference?',
          options: [
            'The body is mounting an active immune response, most likely against acute bacterial infection',
            'The individual is severely dehydrated with completely normal health',
            'Oxygen transport capacity is permanently damaged due to hemoglobin loss',
            'The patient has consumed excessive vitamins requiring immediate filtration'
          ],
          scoringMetadata: {
            optionScores: {
              'The body is mounting an active immune response, most likely against acute bacterial infection': 5,
              'The individual is severely dehydrated with completely normal health': 1,
              'Oxygen transport capacity is permanently damaged due to hemoglobin loss': 2,
              'The patient has consumed excessive vitamins requiring immediate filtration': 1
            }
          },
          weightage: 1
        },
        {
          sectionId: 'medical_ethics',
          sectionName: 'Clinical & Bioethical Judgment',
          questionType: 'scenario',
          question: 'During clinical drug trial analysis, an experimental antibiotic shows great bacterial eradication but slight liver enzyme elevation in 5% of patients. What is the ethical next step?',
          options: [
            'Halt trial expansion, document liver metrics rigorously, and conduct detailed dose-toxicity studies',
            'Ignore the liver enzymes since 95% of patients showed excellent bacterial cure',
            'Market the medicine immediately to beat competing pharmaceutical brands',
            'Discard all lab records and restart trial with only healthy volunteers'
          ],
          scoringMetadata: {
            optionScores: {
              'Halt trial expansion, document liver metrics rigorously, and conduct detailed dose-toxicity studies': 5,
              'Market the medicine immediately to beat competing pharmaceutical brands': 1,
              'Ignore the liver enzymes since 95% of patients showed excellent bacterial cure': 1,
              'Discard all lab records and restart trial with only healthy volunteers': 1
            }
          },
          weightage: 1
        },
        {
          sectionId: 'clinical_interest',
          sectionName: 'Patient Care & Clinical Medicine Aptitude',
          questionType: 'likert',
          question: 'I feel deeply motivated by direct patient diagnosis, hospital environments, surgery, and human anatomy.',
          options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
          scoringMetadata: {
            optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 }
          },
          weightage: 1
        },
        {
          sectionId: 'biotech_interest',
          sectionName: 'Biotechnology & Genetic Research Aptitude',
          questionType: 'likert',
          question: 'I am fascinated by laboratory research, CRISPR gene editing, microbiology, immunology, and pharmacology.',
          options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
          scoringMetadata: {
            optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 }
          },
          weightage: 1
        },
        {
          sectionId: 'healthcare_degrees',
          sectionName: 'Target Higher Education Pathway',
          questionType: 'scenario',
          question: 'Which undergraduate educational avenue matches your primary vocational aspiration?',
          options: [
            'MBBS / BDS (Clinical Medicine & Surgery)',
            'BPharm / PharmD (Pharmaceutical Research & Drug Development)',
            'BSc / BTech Biotechnology or Bioinformatics',
            'BAMS / BHMS / Allied Health Sciences (Physiotherapy, Radiology)'
          ],
          scoringMetadata: {
            optionScores: {
              'MBBS / BDS (Clinical Medicine & Surgery)': 5,
              'BPharm / PharmD (Pharmaceutical Research & Drug Development)': 5,
              'BSc / BTech Biotechnology or Bioinformatics': 5,
              'BAMS / BHMS / Allied Health Sciences (Physiotherapy, Radiology)': 5
            }
          },
          weightage: 1
        },
        {
          sectionId: 'scientific_dedication',
          sectionName: 'Curiosity & Investigative Persistence',
          questionType: 'likert',
          question: 'I am prepared for the intensive continuous study and high empathy required in medical and healthcare professions.',
          options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
          scoringMetadata: {
            optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 }
          },
          weightage: 1
        }
      ]
    };
  }

  // 4. CLASS 11 / 12 - COMMERCE
  if (
    (educationLevel === 'Class11' || educationLevel === 'Class12') &&
    normStream.includes('comm')
  ) {
    return {
      name: `${educationLevel} (Commerce) Business & Financial Aptitude Assessment`,
      description: `Tailored for ${educationLevel} Commerce students to evaluate accounting logic, microeconomics, corporate finance intuition, and business degree pathways.`,
      questions: [
        {
          sectionId: 'accounting_principles',
          sectionName: 'Financial Accounting Fundamentals',
          questionType: 'mcq',
          question: 'Under standard double-entry bookkeeping, if a company purchases office equipment for ₹80,000 in cash, how are accounts impacted?',
          options: [
            'Equipment account is debited, Cash account is credited',
            'Cash account is debited, Equipment account is credited',
            'Equipment account is credited, Capital account is credited',
            'Expense account is credited, Cash account is debited'
          ],
          correctAnswer: 'Equipment account is debited, Cash account is credited',
          weightage: 1
        },
        {
          sectionId: 'economic_analysis',
          sectionName: 'Economics & Market Mechanics',
          questionType: 'mcq',
          question: 'What happens to the price elasticity of demand for a commodity when close substitutes become readily available in the market?',
          options: [
            'Demand becomes significantly more elastic',
            'Demand becomes completely inelastic',
            'Price elasticity remains strictly zero',
            'Demand curve turns perfectly vertical'
          ],
          correctAnswer: 'Demand becomes significantly more elastic',
          weightage: 1
        },
        {
          sectionId: 'business_strategy',
          sectionName: 'Business Strategy & Financial Decisions',
          questionType: 'scenario',
          question: 'A retail startup with ₹20 Lakhs capital must choose between opening a second physical store or investing in digital marketing and e-commerce delivery. What metric should most guide this decision?',
          options: [
            'Projected Customer Acquisition Cost (CAC) and Return on Capital Employed (ROCE)',
            'The aesthetic look of the proposed store signboard',
            'Whichever decision requires zero bookkeeping records',
            'Choosing the option that spends all funds in under 10 days'
          ],
          scoringMetadata: {
            optionScores: {
              'Projected Customer Acquisition Cost (CAC) and Return on Capital Employed (ROCE)': 5,
              'Whichever decision requires zero bookkeeping records': 1,
              'The aesthetic look of the proposed store signboard': 1,
              'Choosing the option that spends all funds in under 10 days': 1
            }
          },
          weightage: 1
        },
        {
          sectionId: 'corporate_finance',
          sectionName: 'Corporate Finance & Valuation',
          questionType: 'mcq',
          question: 'Which financial statement summarizes a company’s financial position (assets, liabilities, and equity) at a specific point in time?',
          options: ['Balance Sheet', 'Income Statement', 'Cash Flow Statement', 'Bank Reconciliation Statement'],
          correctAnswer: 'Balance Sheet',
          weightage: 1
        },
        {
          sectionId: 'ca_finance_interest',
          sectionName: 'Accounting, Auditing & Taxation Interest',
          questionType: 'likert',
          question: 'I enjoy diving into balance sheets, tax codes, statutory auditing, and chartered accountancy challenges.',
          options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
          scoringMetadata: {
            optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 }
          },
          weightage: 1
        },
        {
          sectionId: 'management_interest',
          sectionName: 'Marketing, Operations & Management Aptitude',
          questionType: 'likert',
          question: 'I am drawn to leading teams, negotiating business deals, brand marketing, and managing startup operations.',
          options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
          scoringMetadata: {
            optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 }
          },
          weightage: 1
        },
        {
          sectionId: 'commerce_degrees',
          sectionName: 'Undergraduate Program Alignment',
          questionType: 'scenario',
          question: 'Which college degree and professional certification pathway aligns best with your 5-year ambition?',
          options: [
            'BCom (Hons) with Chartered Accountancy (CA / ACCA / CMA)',
            'BBA / BMS focusing on Marketing, Finance, or International Business',
            'BSc / BA Economics / FinTech and Investment Banking pathway',
            'Company Secretary (CS) with Corporate Law (BA LLB / BCom LLB)'
          ],
          scoringMetadata: {
            optionScores: {
              'BCom (Hons) with Chartered Accountancy (CA / ACCA / CMA)': 5,
              'BBA / BMS focusing on Marketing, Finance, or International Business': 5,
              'BSc / BA Economics / FinTech and Investment Banking pathway': 5,
              'Company Secretary (CS) with Corporate Law (BA LLB / BCom LLB)': 5
            }
          },
          weightage: 1
        },
        {
          sectionId: 'analytical_rigor',
          sectionName: 'Quantitative Data Interpretation',
          questionType: 'likert',
          question: 'I feel confident analyzing tabular spreadsheets, interpreting percentage profit margins, and spotting financial discrepancies.',
          options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
          scoringMetadata: {
            optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 }
          },
          weightage: 1
        }
      ]
    };
  }

  // 5. CLASS 11 / 12 - ARTS / HUMANITIES
  if (
    (educationLevel === 'Class11' || educationLevel === 'Class12') &&
    (normStream.includes('art') || normStream.includes('human'))
  ) {
    return {
      name: `${educationLevel} (Arts & Humanities) Aptitude Assessment`,
      description: `Tailored for ${educationLevel} Arts & Humanities students to evaluate critical analysis, sociopolitical awareness, persuasive communication, and future law, civil services, or media pathways.`,
      questions: [
        {
          sectionId: 'critical_analysis',
          sectionName: 'Critical Analysis & Argumentation',
          questionType: 'mcq',
          question: 'In an editorial arguing that automated AI journalism harms democracy, what constitutes the strongest counter-argument?',
          options: [
            'AI tools can democratize investigative analysis by surfacing vast financial corruption datasets quickly',
            'Computers consume electricity so they cannot understand human emotions',
            'Journalists usually write too slowly compared to search engines',
            'No readers care about politics anymore in modern society'
          ],
          correctAnswer: 'AI tools can democratize investigative analysis by surfacing vast financial corruption datasets quickly',
          weightage: 1
        },
        {
          sectionId: 'polity_society',
          sectionName: 'Sociopolitical Systems & Governance',
          questionType: 'mcq',
          question: 'Under constitutional governance, which doctrine prevents arbitrary centralization of power across legislature, executive, and judiciary?',
          options: ['Separation of Powers', 'Feudal Monarchy', 'Judicial Impunity', 'Direct Anarchy'],
          correctAnswer: 'Separation of Powers',
          weightage: 1
        },
        {
          sectionId: 'media_communication',
          sectionName: 'Media Ethics & Communication Scenarios',
          questionType: 'scenario',
          question: 'You are editor of a university newspaper. A leaked unverified memo accuses a professor of grade bias. What is the most ethical journalistic protocol?',
          options: [
            'Withhold immediate publication until allegations are corroborated with multiple records and the professor is given a right of response',
            'Publish the leak immediately with inflammatory headlines to gain social media clicks',
            'Sell the leak secretly to rival universities without verifying',
            'Delete the memo and pretend you never saw it'
          ],
          scoringMetadata: {
            optionScores: {
              'Withhold immediate publication until allegations are corroborated with multiple records and the professor is given a right of response': 5,
              'Publish the leak immediately with inflammatory headlines to gain social media clicks': 1,
              'Sell the leak secretly to rival universities without verifying': 1,
              'Delete the memo and pretend you never saw it': 2
            }
          },
          weightage: 1
        },
        {
          sectionId: 'legal_reasoning',
          sectionName: 'Legal & Analytical Reasoning',
          questionType: 'mcq',
          question: 'The legal maxim "Audi Alteram Partem" is an indispensable pillar of natural justice meaning:',
          options: [
            'Listen to the other side / No person should be condemned unheard',
            'The written law is always completely inflexible',
            'Only financial evidence can be considered in court',
            'The plaintiff always wins by default'
          ],
          correctAnswer: 'Listen to the other side / No person should be condemned unheard',
          weightage: 1
        },
        {
          sectionId: 'public_policy_interest',
          sectionName: 'Civil Services & Public Policy Interest',
          questionType: 'likert',
          question: 'I am deeply passionate about public policy reform, administrative governance, socioeconomic development, and civil services.',
          options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
          scoringMetadata: {
            optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 }
          },
          weightage: 1
        },
        {
          sectionId: 'creative_media_interest',
          sectionName: 'Journalism, Media & Content Design Aptitude',
          questionType: 'likert',
          question: 'I excel in creative writing, filmmaking, visual storytelling, or investigative journalism.',
          options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
          scoringMetadata: {
            optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 }
          },
          weightage: 1
        },
        {
          sectionId: 'humanities_degrees',
          sectionName: 'Undergraduate Program Alignment',
          questionType: 'scenario',
          question: 'Which undergraduate educational track resonates closest with your intellectual drive?',
          options: [
            'BA LLB / BBA LLB (Integrated Law & Jurisprudence)',
            'BA (Hons) in Political Science / International Relations (Civil Services track)',
            'BA in Journalism, Mass Media & Communication',
            'BA in Psychology / Sociology / Behavioral Sciences'
          ],
          scoringMetadata: {
            optionScores: {
              'BA LLB / BBA LLB (Integrated Law & Jurisprudence)': 5,
              'BA (Hons) in Political Science / International Relations (Civil Services track)': 5,
              'BA in Journalism, Mass Media & Communication': 5,
              'BA in Psychology / Sociology / Behavioral Sciences': 5
            }
          },
          weightage: 1
        },
        {
          sectionId: 'persuasive_communication',
          sectionName: 'Debating & Persuasive Communication',
          questionType: 'likert',
          question: 'I feel confident articulating persuasive viewpoints in structured debates or writing scholarly essays.',
          options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
          scoringMetadata: {
            optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 }
          },
          weightage: 1
        }
      ]
    };
  }

  // 6. UNDERGRADUATE (UG) & POSTGRADUATE (PG) - COMPUTER SCIENCE / IT / BCA / MCA / SOFTWARE
  if (
    normCourse.includes('cs') ||
    normCourse.includes('computer') ||
    normCourse.includes('bca') ||
    normCourse.includes('mca') ||
    normCourse.includes('software') ||
    normCourse.includes('data') ||
    normCourse.includes('it') ||
    normStream.includes('computer') ||
    normStream.includes('it')
  ) {
    const isPG = educationLevel === 'PG';
    return {
      name: `${educationLevel} (${course || 'Computer Science'}) Software Engineering Readiness Assessment`,
      description: `Tailored for ${educationLevel} computer science students to evaluate data structures, algorithms, system design principles, debugging capability, and software career tracks.`,
      questions: [
        {
          sectionId: 'data_structures_algo',
          sectionName: 'Data Structures & Algorithmic Complexity',
          questionType: 'mcq',
          question: 'What is the average time complexity of searching for a key in a well-balanced Hash Map, and what is the worst-case complexity under heavy hash collisions?',
          options: [
            'Average O(1), Worst-case O(N)',
            'Average O(log N), Worst-case O(N²)',
            'Average O(N), Worst-case O(1)',
            'Average O(1), Worst-case O(log N)'
          ],
          correctAnswer: 'Average O(1), Worst-case O(N)',
          weightage: 1
        },
        {
          sectionId: 'software_architecture',
          sectionName: 'Software Engineering & System Architecture',
          questionType: 'mcq',
          question: 'In modern backend development, which design principle is primarily upheld by utilizing dependency injection and interface abstractions?',
          options: [
            'Inversion of Control and Loose Coupling',
            'Direct memory caching without garbage collection',
            'Forcing all functions to execute synchronously',
            'Eliminating database transaction logs'
          ],
          correctAnswer: 'Inversion of Control and Loose Coupling',
          weightage: 1
        },
        {
          sectionId: 'debugging_scenario',
          sectionName: 'System Performance & Debugging Scenario',
          questionType: 'scenario',
          question: 'A production REST API endpoint suffers latency spikes from 50ms to 4,500ms during peak hours. Database CPU usage reaches 98%. What is the most effective initial remediation step?',
          options: [
            'Analyze slow query logs, verify missing database indexes, and implement an in-memory Redis cache for frequently read data',
            'Immediately reboot the production database server and delete user accounts',
            'Rewrite the entire application in Assembly language over the weekend',
            'Increase client-side timeout to 60 seconds and do nothing on backend'
          ],
          scoringMetadata: {
            optionScores: {
              'Analyze slow query logs, verify missing database indexes, and implement an in-memory Redis cache for frequently read data': 5,
              'Increase client-side timeout to 60 seconds and do nothing on backend': 1,
              'Rewrite the entire application in Assembly language over the weekend': 1,
              'Immediately reboot the production database server and delete user accounts': 1
            }
          },
          weightage: 1
        },
        {
          sectionId: 'database_systems',
          sectionName: 'Database Management & Data Modeling',
          questionType: 'mcq',
          question: 'Which ACID property guarantees that all operations within a database transaction either execute completely or roll back entirely in case of failure?',
          options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
          correctAnswer: 'Atomicity',
          weightage: 1
        },
        {
          sectionId: 'tech_stack_proficiency',
          sectionName: 'Full-Stack & Cloud Fluency',
          questionType: 'likert',
          question: 'I am comfortable building end-to-end full stack web applications, designing REST/GraphQL APIs, and deploying on Docker or Cloud platforms.',
          options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
          scoringMetadata: {
            optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 }
          },
          weightage: 1
        },
        {
          sectionId: 'data_ai_interest',
          sectionName: 'AI, Machine Learning & Data Engineering',
          questionType: 'likert',
          question: 'I actively experiment with deep learning, data analysis pipelines, LLM APIs, or predictive modeling.',
          options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
          scoringMetadata: {
            optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 }
          },
          weightage: 1
        },
        {
          sectionId: 'career_pathway',
          sectionName: 'Target Tech Role Alignment',
          questionType: 'scenario',
          question: 'Given an opportunity to lead a major tech initiative, which engineering focus aligns closest with your career goals?',
          options: [
            'Full Stack / Backend Software Engineer (Building high-scale distributed systems)',
            'AI / ML Engineer (Training models and productionizing intelligent agents)',
            'DevOps / Cloud Platform Engineer (Kubernetes, CI/CD, cloud infrastructure)',
            'Product Manager / Tech Lead (Translating business needs to architecture)'
          ],
          scoringMetadata: {
            optionScores: {
              'Full Stack / Backend Software Engineer (Building high-scale distributed systems)': 5,
              'AI / ML Engineer (Training models and productionizing intelligent agents)': 5,
              'DevOps / Cloud Platform Engineer (Kubernetes, CI/CD, cloud infrastructure)': 5,
              'Product Manager / Tech Lead (Translating business needs to architecture)': 5
            }
          },
          weightage: 1
        },
        {
          sectionId: 'code_quality',
          sectionName: 'Code Quality & Professional Practices',
          questionType: 'likert',
          question: 'I consistently practice automated unit testing, version control (Git PRs), and clean architecture standards.',
          options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
          scoringMetadata: {
            optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 }
          },
          weightage: 1
        }
      ]
    };
  }

  // 7. UNDERGRADUATE (UG) & POSTGRADUATE (PG) - BUSINESS / MANAGEMENT / BBA / MBA / COMMERCE
  if (
    normCourse.includes('bba') ||
    normCourse.includes('mba') ||
    normCourse.includes('management') ||
    normCourse.includes('b.com') ||
    normCourse.includes('m.com') ||
    normCourse.includes('finance') ||
    normCourse.includes('marketing')
  ) {
    return {
      name: `${educationLevel} (${course || 'Management & Business'}) Leadership & Career Aptitude Assessment`,
      description: `Tailored for ${educationLevel} business and management students to evaluate strategic decision making, financial acumen, team leadership, and corporate career pathways.`,
      questions: [
        {
          sectionId: 'strategic_management',
          sectionName: 'Strategic Decision Making',
          questionType: 'mcq',
          question: 'In Porter’s Five Forces Framework, when supplier concentration is high and switching costs to substitute materials are steep, what is the impact on industry profitability?',
          options: [
            'Supplier bargaining power is strong, reducing overall industry profitability',
            'Buyer bargaining power increases, boosting retail margins',
            'Threat of new entrants automatically rises to maximum',
            'Competitive rivalry drops completely to zero'
          ],
          correctAnswer: 'Supplier bargaining power is strong, reducing overall industry profitability',
          weightage: 1
        },
        {
          sectionId: 'financial_metrics',
          sectionName: 'Corporate Finance & Valuation',
          questionType: 'mcq',
          question: 'Which capital budgeting metric represents the discount rate at which the Net Present Value (NPV) of a project becomes exactly zero?',
          options: ['Internal Rate of Return (IRR)', 'Payback Period', 'Accounting Rate of Return', 'Weighted Average Cost of Capital (WACC)'],
          correctAnswer: 'Internal Rate of Return (IRR)',
          weightage: 1
        },
        {
          sectionId: 'leadership_scenario',
          sectionName: 'Operational Conflict & Crisis Leadership',
          questionType: 'scenario',
          question: 'Your cross-functional project team is two weeks behind schedule due to disagreements between marketing and product engineering. Deliverable deadline is in 10 days. How do you resolve this?',
          options: [
            'Convene a focused alignment workshop, re-prioritize MVP scope to critical deliverables, and establish clear single-owner accountability',
            'Publicly blame the engineering team and demand they work 24/7 without review',
            'Cancel the project entirely and inform executive leadership that the team failed',
            'Ignore the disagreement and hope both teams magically finish simultaneously'
          ],
          scoringMetadata: {
            optionScores: {
              'Convene a focused alignment workshop, re-prioritize MVP scope to critical deliverables, and establish clear single-owner accountability': 5,
              'Convene a focused alignment workshop': 4,
              'Ignore the disagreement and hope both teams magically finish simultaneously': 1,
              'Publicly blame the engineering team and demand they work 24/7 without review': 1
            }
          },
          weightage: 1
        },
        {
          sectionId: 'marketing_data',
          sectionName: 'Market Dynamics & Customer Analytics',
          questionType: 'mcq',
          question: 'If a SaaS product has a Customer Acquisition Cost (CAC) of $300 and a Customer Lifetime Value (LTV) of $1,200, what is the LTV:CAC ratio and its strategic implication?',
          options: [
            '4:1, representing a healthy, highly scalable unit economics profile',
            '1:4, indicating urgent losses and immediate shutdown needed',
            '0.25, indicating that CAC is 4 times larger than customer spend',
            '1:1, representing break-even with zero growth capacity'
          ],
          correctAnswer: '4:1, representing a healthy, highly scalable unit economics profile',
          weightage: 1
        },
        {
          sectionId: 'financial_analyst_interest',
          sectionName: 'Investment Banking & Financial Modeling',
          questionType: 'likert',
          question: 'I enjoy DCF valuation models, equity research, venture capital cap tables, and corporate treasury management.',
          options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
          scoringMetadata: {
            optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 }
          },
          weightage: 1
        },
        {
          sectionId: 'consulting_product_interest',
          sectionName: 'Management Consulting & Product Strategy',
          questionType: 'likert',
          question: 'I excel in structuring ambiguous business problems, creating executive frameworks, and presenting growth strategies.',
          options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
          scoringMetadata: {
            optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 }
          },
          weightage: 1
        },
        {
          sectionId: 'management_career_track',
          sectionName: 'Target Career Direction',
          questionType: 'scenario',
          question: 'Which post-graduation professional domain represents your target leadership trajectory?',
          options: [
            'Management Consulting & Corporate Strategy (McKinsey, BCG, Big 4)',
            'Investment Banking & Private Equity / FinTech',
            'Product Management & Technology Commercialization',
            'Entrepreneurship & Venture Building (Founding or scaling a venture)'
          ],
          scoringMetadata: {
            optionScores: {
              'Management Consulting & Corporate Strategy (McKinsey, BCG, Big 4)': 5,
              'Investment Banking & Private Equity / FinTech': 5,
              'Product Management & Technology Commercialization': 5,
              'Entrepreneurship & Venture Building (Founding or scaling a venture)': 5
            }
          },
          weightage: 1
        },
        {
          sectionId: 'team_leadership',
          sectionName: 'Interpersonal Leadership & Negotiation',
          questionType: 'likert',
          question: 'I feel natural when managing stakeholders, negotiating terms, and motivating diverse team members under pressure.',
          options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
          scoringMetadata: {
            optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 }
          },
          weightage: 1
        }
      ]
    };
  }

  // 8. DIPLOMA / OTHER UG / PG GENERAL
  return {
    name: `${educationLevel} (${course || stream || 'Professional'}) Career Aptitude & Readiness Assessment`,
    description: `Tailored diagnostic evaluating foundational competence, analytical problem solving, workplace decision making, and career readiness in ${course || stream || 'your chosen academic discipline'}.`,
    questions: [
      {
        sectionId: 'domain_fundamentals',
        sectionName: 'Domain Principles & Analytical Concepts',
        questionType: 'mcq',
        question: `In professional practice within ${course || stream || 'your field'}, what principle best ensures long-term operational quality and reproducibility?`,
        options: [
          'Adhering to standardized documentation, systematic peer review, and quality benchmarks',
          'Relying purely on ad-hoc intuition without verifying recorded data',
          'Skipping all testing phases to deliver results ahead of schedule',
          'Eliminating team communication to avoid differing opinions'
        ],
        correctAnswer: 'Adhering to standardized documentation, systematic peer review, and quality benchmarks',
        weightage: 1
      },
      {
        sectionId: 'analytical_reasoning',
        sectionName: 'Applied Problem Solving & Optimization',
        questionType: 'mcq',
        question: 'When diagnosing why a project metric falls short of expected performance benchmarks, what analytical approach is most rigorous?',
        options: [
          'Root cause analysis (RCA) isolating variables systematically against control baselines',
          'Guessing randomly and changing ten unrelated parameters at the same time',
          'Accepting lower standards and redefining the benchmark downwards',
          'Blaming external factors without inspecting internal metrics'
        ],
        correctAnswer: 'Root cause analysis (RCA) isolating variables systematically against control baselines',
        weightage: 1
      },
      {
        sectionId: 'workplace_scenario',
        sectionName: 'Professional Scenario & Crisis Management',
        questionType: 'scenario',
        question: 'A critical client deliverable contains conflicting technical requirements provided by two senior department heads. How do you proceed professionally?',
        options: [
          'Document the specific trade-offs, prepare a comparative analysis, and facilitate an alignment session to clarify the authoritative requirement',
          'Pick one requirement at random without informing anyone',
          'Stop working completely and wait until someone notices the project stalled',
          'Deliver both conflicting implementations into the same report'
        ],
        scoringMetadata: {
          optionScores: {
            'Document the specific trade-offs, prepare a comparative analysis, and facilitate an alignment session to clarify the authoritative requirement': 5,
            'Pick one requirement at random without informing anyone': 1,
            'Stop working completely and wait until someone notices the project stalled': 1,
            'Deliver both conflicting implementations into the same report': 2
          }
        },
        weightage: 1
      },
      {
        sectionId: 'communication_fluency',
        sectionName: 'Professional Communication & Stakeholder Reporting',
        questionType: 'likert',
        question: 'I can synthesize complex technical or domain findings into succinct executive summaries suitable for diverse audiences.',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        scoringMetadata: {
          optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 }
        },
        weightage: 1
      },
      {
        sectionId: 'industry_tools',
        sectionName: 'Modern Tooling & Methodological Fluency',
        questionType: 'likert',
        question: `I actively maintain proficiency with current industry tools, methodologies, and digital technologies in ${course || stream || 'my domain'}.`,
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        scoringMetadata: {
          optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 }
        },
        weightage: 1
      },
      {
        sectionId: 'collaboration',
        sectionName: 'Cross-functional Collaboration & Adaptability',
        questionType: 'likert',
        question: 'I thrive in multidisciplinary teams where high-velocity learning and adaptability to changing constraints are required.',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        scoringMetadata: {
          optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 }
        },
        weightage: 1
      },
      {
        sectionId: 'career_trajectory',
        sectionName: 'Target Career & Specialization Vision',
        questionType: 'scenario',
        question: 'Looking forward to the next 3 to 5 years, which career pathway represents your primary vocational objective?',
        options: [
          'Direct core industry employment in corporate/engineering organizations',
          'Higher academic degrees and specialized research (Masters / PhD)',
          'Entrepreneurship, technology commercialization, or independent consulting',
          'Public sector, governmental civil service, or policy institutions'
        ],
        scoringMetadata: {
          optionScores: {
            'Direct core industry employment in corporate/engineering organizations': 5,
            'Higher academic degrees and specialized research (Masters / PhD)': 5,
            'Entrepreneurship, technology commercialization, or independent consulting': 5,
            'Public sector, governmental civil service, or policy institutions': 5
          }
        },
        weightage: 1
      },
      {
        sectionId: 'growth_mindset',
        sectionName: 'Continuous Learning & Self-Direction',
        questionType: 'likert',
        question: 'I actively self-direct my learning through certifications, industry literature, and hands-on portfolio projects outside classroom hours.',
        options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
        scoringMetadata: {
          optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 }
        },
        weightage: 1
      }
    ]
  };
};

/**
 * Main service method: Gets existing personalized assessment or generates fresh tailored questions
 * based on the student's exact education level and educational details.
 */
export const getOrGeneratePersonalizedAssessment = async (
  userId: string,
  forceRegenerate: boolean = false
): Promise<IAssessment> => {
  const education = await EducationDetails.findOne({ userId });
  if (!education) {
    throw new Error('Please complete your Education details first.');
  }

  const profile = await StudentProfile.findOne({ userId });
  const careerObjective = profile?.careerObjective || 'explore_career';
  const educationLevel = education.educationLevel;
  const stream = education.stream || '';
  const course = education.course || '';

  const personalizedType = `personalized_${userId}_${educationLevel.toLowerCase()}`;

  // 1. Check if user already has an active personalized assessment for this education level
  if (!forceRegenerate) {
    const existing = await Assessment.findOne({
      userId: new Types.ObjectId(userId),
      educationLevels: educationLevel,
      isActive: true
    }).sort({ createdAt: -1 });

    if (existing) {
      // Ensure it has questions
      const questionCount = await AssessmentQuestion.countDocuments({
        assessmentId: existing._id,
        assessmentVersion: existing.version
      });

      if (questionCount > 0) {
        return existing;
      }
    }
  }

  // 2. We need to generate a tailored assessment!
  let assessmentName = '';
  let description = '';
  let questions: QuestionDef[] = [];
  let generatedBy: 'ai' | 'curriculum' = 'curriculum';

  // 2.A. Attempt Dynamic AI Generation if Gemini credentials exist
  const credential = await UserAICredential.findOne({ userId, provider: 'google_gemini' }).lean();
  let decryptedApiKey = '';
  if (credential) {
    try {
      decryptedApiKey = decryptKey(credential.encryptedApiKey);
    } catch {}
  } else if (env.GEMINI_API_KEY) {
    decryptedApiKey = env.GEMINI_API_KEY;
  }

  if (decryptedApiKey) {
    try {
      console.log(`[AssessmentGenerator] Generating AI assessment via Gemini for user ${userId} (${educationLevel}, ${stream}, ${course})...`);
      const context: AssessmentUserContext = {
        educationLevel,
        stream,
        course,
        currentClassSemester: education.currentClassSemester,
        boardUniversity: education.boardUniversity,
        schoolCollege: education.schoolCollege,
        favoriteSubjects: profile?.favoriteSubjects,
        interests: profile?.interests,
        strengths: profile?.strengths,
        skills: profile?.skills,
        careerGoal: profile?.careerGoal,
        careerObjective
      };

      const prompt = getAssessmentGenerationPrompt(context);
      const aiResponse: AssessmentGenerationResult = await callGeminiAPI({
        prompt,
        schema: assessmentGenerationSchema,
        apiKey: decryptedApiKey
      });

      if (aiResponse && Array.isArray(aiResponse.questions) && aiResponse.questions.length >= 6) {
        assessmentName = aiResponse.assessmentName;
        description = aiResponse.description;
        questions = aiResponse.questions.map((q: any) => ({
          sectionId: q.sectionId,
          sectionName: q.sectionName,
          questionType: q.questionType,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          scoringMetadata: q.scoringMetadata,
          weightage: q.weightage || 1
        }));
        generatedBy = 'ai';
        console.log(`[AssessmentGenerator] Successfully generated ${questions.length} AI questions.`);
      }
    } catch (err: any) {
      console.warn('[AssessmentGenerator] Gemini generation failed or skipped, falling back to curriculum engine:', err?.message);
    }
  }

  // 2.B. Fallback to specialized curriculum engine
  if (questions.length === 0) {
    console.log(`[AssessmentGenerator] Using high-fidelity curriculum engine for ${educationLevel} (${stream}, ${course})...`);
    const curriculumData = getCurriculumQuestions(educationLevel, stream, course);
    assessmentName = curriculumData.name;
    description = curriculumData.description;
    questions = curriculumData.questions;
    generatedBy = 'curriculum';
  }

  // 3. Mark previous uncompleted attempts as abandoned if force regenerating
  if (forceRegenerate) {
    await AssessmentProgress.updateMany(
      { userId: new Types.ObjectId(userId), status: 'in_progress' },
      { status: 'abandoned' }
    );
    // Deactivate previous personalized assessments for this user
    await Assessment.updateMany(
      { userId: new Types.ObjectId(userId) },
      { isActive: false }
    );
  }

  // 4. Create new Assessment document
  const uniqueSections = Array.from(new Set(questions.map(q => q.sectionId)));
  const version = forceRegenerate ? Date.now() : 1;

  const newAssessment = await Assessment.create({
    assessmentName,
    type: `${personalizedType}_${Date.now()}`,
    educationLevels: [educationLevel],
    careerObjectives: [careerObjective],
    description,
    duration: 25, // 25 minutes
    totalQuestions: questions.length,
    totalSections: uniqueSections.length,
    isActive: true,
    version,
    userId: new Types.ObjectId(userId),
    isPersonalized: true,
    stream,
    course,
    generatedBy
  });

  // 5. Bulk insert questions (clean any dots in optionScores keys)
  const cleanOptionScores = (scores?: Record<string, number>): Record<string, number> | undefined => {
    if (!scores || typeof scores !== 'object') return undefined;
    const clean: Record<string, number> = {};
    for (const [k, v] of Object.entries(scores)) {
      clean[k.replace(/\./g, '')] = v;
    }
    return clean;
  };

  await AssessmentQuestion.insertMany(
    questions.map((q, idx) => ({
      assessmentId: newAssessment._id,
      assessmentVersion: version,
      sectionId: q.sectionId,
      sectionName: q.sectionName,
      questionType: q.questionType,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      scoringMetadata: q.scoringMetadata?.optionScores
        ? { optionScores: cleanOptionScores(q.scoringMetadata.optionScores) }
        : q.scoringMetadata,
      weightage: q.weightage || 1,
      order: idx + 1
    }))
  );

  console.log(`[AssessmentGenerator] Created assessment "${assessmentName}" (ID: ${newAssessment._id}) with ${questions.length} questions.`);
  return newAssessment;
};
