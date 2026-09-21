import React, { useEffect, useState } from 'react';
import { fetchHealth, type HealthResponse, api } from '../services/api';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getEducationApi,
  saveEducationApi,
  getProfileApi,
  saveProfileApi,
  getDashboardSummaryApi,
  getAvailableAssessmentApi,
  startAssessmentApi,
  getAttemptApi,
  saveProgressApi,
  submitAssessmentApi,
  getResultsHistoryApi,
  getResultApi,
  getAIRecommendationByTypeApi,
  generateAIRecommendationApi,
  regenerateAIRecommendationApi,
  createResumeApi,
  listResumesApi,
  updateResumeApi,
  deleteResumeApi,
  exportResumeApi,
  getAISettingsApi,
  saveGeminiKeyApi,
  removeGeminiKeyApi,
  updateMeApi
} from '../services/auth';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { SearchableSelect } from '../components/ui/SearchableSelect';
import { MultiSearchableSelect } from '../components/ui/MultiSearchableSelect';
import { Textarea } from '../components/ui/Textarea';
import { Progress } from '../components/ui/Progress';
import { PublicLayout } from '../components/layout/PublicLayout';
import { AppLayout } from '../components/layout/AppLayout';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { toast, Toaster } from 'sonner';
import {
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  Sparkles,
  Map,
  FileText,
  ChevronRight,
  GraduationCap,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
  Trash2,
  Download,
  Edit2,
  ArrowLeft,
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  Shield
} from 'lucide-react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

// ==========================================
// SHARED FIELD OPTION LISTS
// ==========================================
const boardOptions = [
  'CBSE', 'ICSE', 'ISC', 'State Board',
  'IB (International Baccalaureate)', 'Cambridge (IGCSE)',
  'NIOS', 'UP Board', 'Bihar Board', 'Maharashtra Board',
  'Tamil Nadu Board', 'Karnataka Board (PUE)', 'Kerala Board',
  'West Bengal Board', 'Rajasthan Board', 'MP Board',
  'Gujarat Board', 'AP Board', 'Telangana Board', 'Punjab Board',
  'Haryana Board', 'Odisha Board', 'Jharkhand Board', 'Chhattisgarh Board',
  'Anna University', 'Mumbai University', 'Delhi University',
  'MAKAUT', 'AKTU', 'VTU', 'JNTU', 'Pune University',
  'Calcutta University', 'Osmania University', 'GTU',
  'RGPV', 'Calicut University', 'Amity University',
  'BITS Pilani', 'Manipal University', 'SRM University',
  'VIT University', 'LPU', 'Chandigarh University',
  'Christ University', 'Symbiosis University', 'Jadavpur University',
  'BHU', 'AMU', 'JMI', 'JNU', 'IIT', 'NIT', 'IIIT',
];

const courseOptions = [
  // UG courses
  'B.Tech Computer Science', 'B.Tech IT', 'B.Tech ECE',
  'B.Tech EEE', 'B.Tech Mechanical', 'B.Tech Civil',
  'B.Tech Chemical', 'B.Tech Biotech', 'B.Tech AI & ML',
  'B.Tech Data Science', 'B.Tech Aerospace',
  'BCA', 'BBA', 'B.Com', 'B.Com (Hons)', 'BA (Hons)',
  'BA Economics', 'BA English', 'BA Psychology', 'BA Political Science',
  'B.Sc Computer Science', 'B.Sc IT', 'B.Sc Mathematics',
  'B.Sc Physics', 'B.Sc Chemistry', 'B.Sc Biology',
  'B.Sc Data Science', 'B.Sc Statistics',
  'B.Des', 'BFA', 'BMS', 'BBS', 'BJMC', 'BHM',
  'B.Arch', 'B.Pharm', 'MBBS', 'BDS', 'BAMS', 'BHMS',
  'BA LLB', 'BBA LLB', 'B.Com LLB', 'LLB',
  // PG courses
  'M.Tech Computer Science', 'M.Tech AI & ML', 'M.Tech Data Science',
  'M.Tech Software Engineering', 'M.Tech Cybersecurity',
  'MCA', 'MBA', 'M.Com', 'MA Economics', 'MA English',
  'MA Psychology', 'MA Political Science',
  'M.Sc Computer Science', 'M.Sc IT', 'M.Sc Mathematics',
  'M.Sc Physics', 'M.Sc Data Science', 'M.Sc Statistics',
  'M.Des', 'MFA', 'MJMC', 'MPH',
  'M.Arch', 'M.Pharm', 'MD', 'MS (Medical)', 'LLM',
  // Diploma courses
  'Diploma in Computer Engineering', 'Diploma in IT',
  'Diploma in Electronics', 'Diploma in Mechanical Engineering',
  'Diploma in Civil Engineering', 'Diploma in Electrical Engineering',
  'Diploma in Automobile Engineering', 'Diploma in Chemical Engineering',
  'Diploma in Architecture', 'Diploma in Pharmacy',
  'Diploma in Hotel Management', 'Diploma in Fashion Design',
  'Diploma in Graphic Design', 'Diploma in Web Development',
  'Diploma in Animation & Multimedia',
];

const semesterYearOptions = [
  '1st Semester', '2nd Semester', '3rd Semester', '4th Semester',
  '5th Semester', '6th Semester', '7th Semester', '8th Semester',
  '9th Semester', '10th Semester',
  '1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year',
];

const interestOptions = [
  'Artificial Intelligence', 'Machine Learning', 'Data Science', 'Web Development',
  'Mobile Development', 'Cloud Computing', 'Cybersecurity', 'Blockchain',
  'IoT', 'Robotics', 'Game Development', 'AR/VR', 'DevOps',
  'Computer Networks', 'Database Systems', 'Software Engineering',
  'Digital Marketing', 'Finance', 'Economics', 'Management',
  'Psychology', 'Literature', 'History', 'Political Science',
  'Physics', 'Mathematics', 'Biology', 'Chemistry', 'Astronomy',
  'Biotechnology', 'Environmental Science', 'Nanotechnology',
  'Graphic Design', 'UI/UX Design', 'Photography', 'Music',
  'Creative Writing', 'Journalism', 'Entrepreneurship',
  'Cryptography', 'Quantum Computing', 'Natural Language Processing',
  'Computer Vision', 'Deep Learning', 'Big Data', 'Analytics',
];

const skillOptions = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C', 'C#',
  'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Dart',
  'React', 'Angular', 'Vue.js', 'Next.js', 'Node.js', 'Express.js',
  'Django', 'Flask', 'Spring Boot', 'Laravel', 'ASP.NET',
  'Flutter', 'React Native', 'Android', 'iOS',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
  'Git', 'Linux', 'Bash', 'CI/CD', 'Jenkins',
  'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy',
  'HTML', 'CSS', 'Sass', 'Tailwind CSS', 'Bootstrap',
  'GraphQL', 'REST API', 'Microservices', 'System Design',
  'Data Structures', 'Algorithms', 'OOP', 'DBMS', 'OS',
  'Figma', 'Adobe XD', 'Photoshop', 'Canva',
  'Excel', 'Power BI', 'Tableau', 'MATLAB', 'R',
];

const careerGoalOptions = [
  'Software Engineer', 'Full Stack Developer', 'Frontend Developer',
  'Backend Developer', 'Mobile App Developer', 'DevOps Engineer',
  'Cloud Engineer', 'Data Scientist', 'Data Analyst', 'Data Engineer',
  'Machine Learning Engineer', 'AI Researcher', 'AI Engineer',
  'Cybersecurity Analyst', 'Security Engineer', 'Network Engineer',
  'System Administrator', 'Database Administrator',
  'Product Manager', 'Project Manager', 'Business Analyst',
  'UI/UX Designer', 'Graphic Designer', 'Game Developer',
  'Blockchain Developer', 'IoT Engineer', 'Embedded Systems Engineer',
  'Research Scientist', 'Professor / Academic',
  'Entrepreneur', 'Consultant', 'Technical Writer',
  'Quality Assurance Engineer', 'Site Reliability Engineer',
  'Solutions Architect', 'CTO', 'Engineering Manager',
];

const degreeOptions = [
  // UG
  'B.Tech Computer Science', 'B.Tech IT', 'B.Tech ECE', 'B.Tech EEE',
  'B.Tech Mechanical', 'B.Tech Civil', 'B.Tech AI & ML', 'B.Tech Data Science',
  'BCA', 'BBA', 'B.Com', 'B.Com (Hons)', 'B.Sc Computer Science',
  'B.Sc IT', 'B.Sc Mathematics', 'B.Sc Physics', 'B.Sc Data Science',
  'BA Economics', 'BA English', 'BA Psychology', 'BA LLB', 'LLB',
  // PG
  'M.Tech Computer Science', 'M.Tech AI & ML', 'M.Tech Data Science',
  'M.Tech Software Engineering', 'M.Tech Cybersecurity',
  'M.Tech VLSI', 'M.Tech Embedded Systems', 'M.Tech Signal Processing',
  'MCA', 'MBA', 'MBA (Finance)', 'MBA (Marketing)', 'MBA (HR)',
  'M.Com', 'MA Economics', 'MA English', 'MA Psychology',
  'M.Sc Computer Science', 'M.Sc IT', 'M.Sc Mathematics',
  'M.Sc Physics', 'M.Sc Data Science', 'M.Sc Statistics',
  'M.Sc Artificial Intelligence', 'M.Sc Machine Learning',
  'MS Computer Science', 'MS Data Science', 'MS AI',
  'M.Des', 'M.Arch', 'M.Pharm', 'MD', 'LLM',
  'PhD Computer Science', 'PhD Mathematics', 'PhD Physics',
];

const streamOptions = [
  'Science', 'Commerce', 'Arts', 'Science (PCM)', 'Science (PCB)', 'Vocational'
];

// ==========================================
// UNAUTHENTICATED PAGES (PublicLayout)
// ==========================================

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchHealth()
      .then((data) => {
        setHealth(data);
        setHealthLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setHealthLoading(false);
      });
  }, []);

  const features = [
    {
      title: 'Career Assessment',
      description: 'Discover your strengths, interest fields, and readiness levels with diagnostic aptitude tests.',
      icon: <Award style={{ color: 'var(--primary)' }} />,
    },
    {
      title: 'AI Recommendations',
      description: 'Receive personalized suggestions for streams, degrees, or skill gaps using Google Gemini models.',
      icon: <Sparkles style={{ color: '#a78bfa' }} />,
    },
    {
      title: 'Career Roadmaps',
      description: 'Follow organized paths divided into short, medium, and long-term milestones for clear objectives.',
      icon: <Map style={{ color: 'var(--secondary)' }} />,
    },
    {
      title: 'Learning Roadmaps',
      description: 'Acquire required skills with structured, prioritized week-by-week learning goals and resource guides.',
      icon: <Calendar style={{ color: '#60a5fa' }} />,
    },
    {
      title: 'Resume Builder',
      description: 'Construct, modify, and preview professional resumes mapped dynamically to your profile and export to PDF.',
      icon: <FileText style={{ color: 'var(--primary)' }} />,
    },
    {
      title: 'Jobs & Internships',
      description: 'Search matched listings, evaluate compatible scores deterministically, and log application stages.',
      icon: <Briefcase style={{ color: '#60a5fa' }} />,
    }
  ];

  const steps = [
    { num: '01', title: 'Build Profile', desc: 'Onboard academic details and goals' },
    { num: '02', title: 'Take Assessment', desc: 'Assess baseline skills and aptitudes' },
    { num: '03', title: 'AI Insights', desc: 'Compile custom domain recommendations' },
    { num: '04', title: 'Follow Roadmap', desc: 'Review learning steps and timelines' },
    { num: '05', title: 'Build Resume', desc: 'Draft and format custom CV templates' },
    { num: '06', title: 'Find Placements', desc: 'Submit and track target applications' },
  ];

  const journeySteps = [
    { title: 'Education Onboarding', desc: 'Set Academic State' },
    { title: 'Aptitude Assessment', desc: 'Evaluate Aptitude Profile' },
    { title: 'AI Recommendation', desc: 'Get Stream/Degree Matches' },
    { title: 'Actionable Roadmaps', desc: 'Milestones & Tasks' },
    { title: 'Resume Generator', desc: 'Build Custom Template' },
    { title: 'Jobs & Placement Feed', desc: 'Track external listings' }
  ];

  return (
    <PublicLayout>
      <Toaster position="top-right" theme="dark" />
      
      {/* Hero Section */}
      <section style={{ padding: '90px 24px 70px 24px', textAlign: 'center', background: 'radial-gradient(ellipse at center, rgba(123, 44, 191, 0.08) 0%, transparent 70%)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(157, 78, 221, 0.12)',
            color: '#c084fc',
            border: '1px solid rgba(157, 78, 221, 0.25)',
            borderRadius: '100px',
            padding: '6px 16px',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '28px'
          }}>
            <Sparkles size={14} /> Powered by Google Gemini AI
          </span>
          <h1 style={{ fontSize: 'var(--font-size-xxl)', fontWeight: 800, lineHeight: 1.2, marginBottom: '24px', letterSpacing: '-0.02em' }}>
            AI-Powered Career Guidance <br />
            <span style={{ background: 'var(--accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              From Education to Employment
            </span>
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: 1.6, maxWidth: '680px', margin: '0 auto 40px auto' }}>
            A unified career mentorship platform offering custom career assessments, AI recommenders, milestones mapping, PDF resume editors, and opportunity matchers.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Button onClick={() => navigate('/register')} style={{ padding: '12px 28px', fontSize: '15px' }}>
              Get Started Free <ChevronRight size={16} />
            </Button>
            <Button variant="secondary" onClick={() => navigate('/login')} style={{ padding: '12px 28px', fontSize: '15px' }}>
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid var(--border-glass)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, textAlign: 'center', marginBottom: '12px', letterSpacing: '-0.01em' }}>
            Everything You Need to Navigate Your Career
          </h2>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '60px', fontSize: '16px', maxWidth: '600px', margin: '0 auto 60px auto' }}>
            Explore our comprehensive suite of student guidance tools designed to bridge academic paths and active employment.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {features.map((feat, idx) => (
              <Card key={idx} style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  {feat.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{feat.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                    {feat.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Connection health check (Internal diagnostics fallback at the bottom of the page in small text) */}
      <section style={{ padding: '24px 24px', borderTop: '1px solid rgba(255,255,255,0.03)', background: 'rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Diagnostics Platform Check: Connected</span>
          {healthLoading ? (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Checking connection...</span>
          ) : health ? (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Server API: v1.0.0 | Status: {health.status} | DB: {health.database}
            </span>
          ) : (
            <span style={{ fontSize: '11px', color: 'var(--error)' }}>Offline</span>
          )}
        </div>
      </section>

      {/* How it Works Section */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-glass)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, textAlign: 'center', marginBottom: '12px', letterSpacing: '-0.01em' }}>
            How It Works
          </h2>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '60px', fontSize: '16px', maxWidth: '500px', margin: '0 auto 60px auto' }}>
            Our dynamic sequential process takes you from profile setup directly to placement matching.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {steps.map((st, idx) => (
              <Card key={idx} style={{ padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{
                  fontSize: '44px', fontWeight: 800,
                  background: 'linear-gradient(135deg, rgba(157,78,221,0.2) 0%, rgba(58,134,200,0.1) 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  lineHeight: 1, userSelect: 'none'
                }}>
                  {st.num}
                </span>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>{st.title}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{st.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Career Journey Visual Section */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.01em' }}>
            One Connected Career Journey
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '60px', fontSize: '16px', maxWidth: '600px', margin: '0 auto 60px auto' }}>
            Instead of fragmented tools, Mentor.AI offers a structured timeline tracking your progression.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '600px', margin: '0 auto' }}>
            {journeySteps.map((js, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '16px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-glass)'
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 800, color: '#fff'
                  }}>{idx + 1}</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>{js.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{js.desc}</div>
                  </div>
                </div>
                {idx < journeySteps.length - 1 && (
                  <div style={{
                    width: '2px', height: '24px',
                    background: 'linear-gradient(to bottom, rgba(157,78,221,0.5), rgba(58,134,200,0.5))'
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Block */}
      <section style={{ padding: '80px 24px', textAlign: 'center', background: 'linear-gradient(180deg, transparent 0%, rgba(123,44,191,0.05) 100%)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>Ready to Begin Your Placement Prep?</h2>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            Connect with Mentor.AI to assess strengths, generate resume formats, and unlock recommended listings.
          </p>
          <Button onClick={() => navigate('/register')} style={{ padding: '14px 32px', fontSize: '16px' }}>
            Get Started Free
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
};

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await login({ email, password });
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed. Please verify credentials.');
    }
  };

  return (
    <PublicLayout>
      <Toaster position="top-right" theme="dark" />
      <div style={{ maxWidth: '480px', width: '100%', margin: '80px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        <Card style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1.2, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: '0 0 32px 0', lineHeight: 1.5 }}>
            Enter credentials to access your career center.
          </p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
            <Input id="email" name="email" label="Email Address" type="email" placeholder="you@example.com" required defaultValue="alex.mercer@gmail.com" />
            
            <div className="form-group">
              <label htmlFor="password" className="label">Password</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  defaultValue="Password@123"
                  className="input"
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  aria-label="Toggle Password Visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '24px' }}>
              <span 
                onClick={() => navigate('/forgot-password')} 
                style={{ fontSize: '13px', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, transition: 'color var(--transition-fast)' }}
              >
                Forgot Password?
              </span>
            </div>

            <Button type="submit" style={{ width: '100%', height: '48px', fontSize: '15px' }}>Sign In</Button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)', marginTop: '24px', margin: '24px 0 0 0' }}>
            Don't have an account?{' '}
            <span onClick={() => navigate('/register')} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
              Register
            </span>
          </p>
        </Card>
      </div>
    </PublicLayout>
  );
};

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const mobileNumber = formData.get('mobileNumber') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    try {
      await register({ fullName, email, mobileNumber, password, confirmPassword });
      toast.success('Account created successfully!');
      navigate('/education');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <PublicLayout>
      <Toaster position="top-right" theme="dark" />
      <div style={{ maxWidth: '480px', width: '100%', margin: '80px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        <Card style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1.2, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: '0 0 32px 0', lineHeight: 1.5 }}>
            Get personalized roadmap guidance.
          </p>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column' }}>
            <Input id="fullName" name="fullName" label="Full Name" type="text" placeholder="John Doe" required />
            <Input id="email" name="email" label="Email Address" type="email" placeholder="john@example.com" required />
            <Input id="mobileNumber" name="mobileNumber" label="Mobile Number" type="tel" placeholder="9876543210" required />
            
            <div className="form-group">
              <label htmlFor="password" className="label">Password</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  className="input"
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  aria-label="Toggle Password Visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="label">Confirm Password</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  className="input"
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  aria-label="Toggle Confirm Password Visibility"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <Button type="submit" style={{ width: '100%', height: '48px', fontSize: '15px', marginTop: '12px' }}>Create Account</Button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)', marginTop: '24px', margin: '24px 0 0 0' }}>
            Already registered?{' '}
            <span onClick={() => navigate('/login')} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
              Sign In
            </span>
          </p>
        </Card>
      </div>
    </PublicLayout>
  );
};

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const handleForgot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      const msg = await forgotPassword(email);
      toast.success(msg);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Password reset request failed.');
    }
  };

  return (
    <PublicLayout>
      <Toaster position="top-right" theme="dark" />
      <div style={{ maxWidth: '480px', width: '100%', margin: '80px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        <Card style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1.2, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Reset Password</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: '0 0 32px 0', lineHeight: 1.5 }}>
            Enter your email to receive a password reset token.
          </p>

          <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column' }}>
            <Input id="email" name="email" label="Email Address" type="email" placeholder="john@example.com" required />
            <Button type="submit" style={{ width: '100%', height: '48px', fontSize: '15px', marginTop: '12px' }}>Send Reset Link</Button>
          </form>
          
          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)', marginTop: '24px', margin: '24px 0 0 0' }}>
            Remember credentials?{' '}
            <span onClick={() => navigate('/login')} style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
              Sign In
            </span>
          </p>
        </Card>
      </div>
    </PublicLayout>
  );
};

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { resetPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    try {
      const msg = await resetPassword({ token, newPassword, confirmPassword });
      toast.success(msg);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Password reset failed.');
    }
  };

  return (
    <PublicLayout>
      <Toaster position="top-right" theme="dark" />
      <div style={{ maxWidth: '480px', width: '100%', margin: '80px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        <Card style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1.2, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>New Password</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: '0 0 32px 0', lineHeight: 1.5 }}>
            Enter your new secure password.
          </p>

          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="form-group">
              <label htmlFor="newPassword" className="label">New Password</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  className="input"
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  aria-label="Toggle Password Visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="label">Confirm Password</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  className="input"
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  aria-label="Toggle Confirm Password Visibility"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <Button type="submit" style={{ width: '100%', height: '48px', fontSize: '15px', marginTop: '12px' }}>Update Password</Button>
          </form>
        </Card>
      </div>
    </PublicLayout>
  );
};

export const Education: React.FC = () => {
  const navigate = useNavigate();
  const [level, setLevel] = useState('UG');
  const [objective, setObjective] = useState('find_internship');
  const [schoolCollege, setSchoolCollege] = useState('');
  const [boardUniversity, setBoardUniversity] = useState('');
  const [currentClassSemester, setCurrentClassSemester] = useState('');
  const [stream, setStream] = useState('');
  const [course, setCourse] = useState('');
  const [percentageCGPA, setPercentageCGPA] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const levels = [
    { value: 'Class10', label: 'Class 10 Student' },
    { value: 'Class11', label: 'Class 11 Student' },
    { value: 'Class12', label: 'Class 12 Student' },
    { value: 'Diploma', label: 'Diploma Student' },
    { value: 'UG', label: 'Undergraduate Student (UG)' },
    { value: 'PG', label: 'Postgraduate Student (PG)' },
  ];

  const objectives = [
    { value: 'explore_stream', label: 'Explore Streams', desc: 'Discover subjects and streams matching interests (Class 10/11)', icon: BookOpen },
    { value: 'explore_degree', label: 'Explore Degrees', desc: 'Identify optimal undergraduate pathways (Class 12)', icon: GraduationCap },
    { value: 'explore_career', label: 'Explore Careers', desc: 'Research future career roles and skill gaps', icon: Sparkles },
    { value: 'find_internship', label: 'Find Internship', desc: 'Prepare and apply for active internships', icon: Award },
    { value: 'find_job', label: 'Find Job', desc: 'Get matched to employment opportunities', icon: Briefcase },
    { value: 'higher_studies', label: 'Plan Higher Studies', desc: 'Research masters or higher qualification paths', icon: TrendingUp },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const edu = await getEducationApi();
        if (edu.data) {
          // Keep strict enum values, fallback to UG if loaded value is invalid/lowercase
          const loadedLevel = edu.data.educationLevel;
          const VALID_LEVELS = ['Class10', 'Class11', 'Class12', 'Diploma', 'UG', 'PG'];
          if (VALID_LEVELS.includes(loadedLevel)) {
            setLevel(loadedLevel);
          } else if (loadedLevel && VALID_LEVELS.includes(loadedLevel.toUpperCase())) {
            setLevel(loadedLevel.toUpperCase());
          } else {
            setLevel('UG');
          }

          setSchoolCollege(edu.data.schoolCollege || '');
          setBoardUniversity(edu.data.boardUniversity || '');
          setCurrentClassSemester(edu.data.currentClassSemester || '');
          setStream(edu.data.stream || '');
          setCourse(edu.data.course || '');
          setPercentageCGPA(edu.data.percentageCGPA ? edu.data.percentageCGPA.toString() : '');
        }
        const prof = await getProfileApi();
        if (prof.data?.profile) {
          setObjective(prof.data.profile.careerObjective || 'find_internship');
        }
      } catch (err) {
        console.error('Failed to load pre-existing onboarding details', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return; // Prevent duplicate submissions
    
    setSaveError('');

    // Frontend validation checklist
    const VALID_EDUCATION_LEVELS = [
      "Class10",
      "Class11",
      "Class12",
      "Diploma",
      "UG",
      "PG"
    ] as const;

    if (!VALID_EDUCATION_LEVELS.includes(level as any)) {
      const msg = `Invalid education level selection: "${level}". Expected one of: Class10, Class11, Class12, Diploma, UG, PG.`;
      toast.error(msg);
      setSaveError(msg);
      return;
    }

    const payload = {
      educationLevel: level,
      schoolCollege: schoolCollege || undefined,
      boardUniversity: boardUniversity || undefined,
      currentClassSemester: currentClassSemester || undefined,
      stream: stream || undefined,
      course: course || undefined,
      percentageCGPA: percentageCGPA ? parseFloat(percentageCGPA) : undefined,
    };

    const profilePayload = {
      careerObjective: objective,
    };

    console.log("ONBOARDING PAYLOAD", {
      education: payload,
      profile: profilePayload
    });

    setIsSaving(true);
    try {
      // Save Step 1: Education details
      await saveEducationApi(payload);

      // Save Step 2: Objective
      await saveProfileApi(profilePayload);

      toast.success('Education & career goal saved! Proceeding to Student Profile...');
      navigate('/onboarding/profile');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Unable to save your education details. Please check the information and try again.';
      toast.error(errorMsg);
      setSaveError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Loading />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <Toaster position="top-right" theme="dark" />
      <div style={{ maxWidth: '640px', margin: '40px auto', padding: '0 20px' }}>
        
        {/* Onboarding Steps Indicators */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ flex: 1, borderBottom: '3px solid var(--primary)', paddingBottom: '8px', color: 'var(--primary)', fontWeight: 600, fontSize: '13px' }}>1. Education &amp; Career Goal</div>
          <div style={{ flex: 1, borderBottom: '3px solid rgba(255,255,255,0.05)', paddingBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'right' }}>2. Student Profile</div>
        </div>

        <Card style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Education & Career Goal</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
            Tell us about your educational background and primary aspirations.
          </p>

          <form onSubmit={handleNext}>
            {/* Step 1: Education Level Selector */}
            <Select 
              id="educationLevel" 
              label="What is your current education level?" 
              options={levels} 
              value={level}
              onChange={(e) => setLevel(e.target.value)} 
            />

            {/* Dynamic Academic inputs */}
            <div style={{ margin: '24px 0', padding: '20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>Academic Details</h4>
              
              <Input 
                id="schoolCollege" 
                label="School / College Name" 
                placeholder="e.g. Stanford University"
                value={schoolCollege}
                onChange={(e) => setSchoolCollege(e.target.value)}
              />

              <SearchableSelect 
                id="boardUniversity" 
                label="Board / University" 
                placeholder="e.g. CBSE / State Board"
                value={boardUniversity}
                onChange={(val) => setBoardUniversity(val)}
                options={boardOptions}
              />

              {level === 'Class10' && (
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  No stream selection is required for Class 10.
                </p>
              )}

              {(level === 'Class11' || level === 'Class12') && (
                <SearchableSelect 
                  id="stream" 
                  label="Academic Stream (Science / Commerce / Arts)" 
                  placeholder="e.g. Science"
                  required
                  value={stream}
                  onChange={(val) => setStream(val)}
                  options={streamOptions}
                />
              )}

              {level === 'Diploma' && (
                <>
                  <SearchableSelect 
                    id="course" 
                    label="Diploma Course" 
                    placeholder="e.g. Diploma in Computer Engineering" 
                    required
                    value={course}
                    onChange={(val) => setCourse(val)}
                    options={courseOptions.filter(c => c.startsWith('Diploma'))}
                  />
                  <SearchableSelect 
                    id="currentClassSemester" 
                    label="Current Year / Sem" 
                    placeholder="e.g. 3rd Year" 
                    required
                    value={currentClassSemester}
                    onChange={(val) => setCurrentClassSemester(val)}
                    options={semesterYearOptions}
                  />
                </>
              )}

              {(level === 'UG' || level === 'PG') && (
                <>
                  <SearchableSelect 
                    id="course" 
                    label="Degree Course" 
                    placeholder="e.g. B.Tech Computer Science" 
                    required
                    value={course}
                    onChange={(val) => setCourse(val)}
                    options={courseOptions}
                  />
                  <SearchableSelect 
                    id="currentClassSemester" 
                    label="Current Semester / Year" 
                    placeholder="e.g. 5th Semester" 
                    required
                    value={currentClassSemester}
                    onChange={(val) => setCurrentClassSemester(val)}
                    options={semesterYearOptions}
                  />
                  <Input 
                    id="percentageCGPA" 
                    label="Current CGPA / Percentage" 
                    placeholder="e.g. 8.5 or 85%" 
                    required
                    value={percentageCGPA}
                    onChange={(e) => setPercentageCGPA(e.target.value)}
                  />
                </>
              )}
            </div>

            {/* Step 2: Objectives Selection Cards */}
            <div style={{ marginBottom: '32px' }}>
              <label className="label">What is your primary objective?</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                {objectives.map((obj) => {
                  const Icon = obj.icon;
                  const isSelected = objective === obj.value;
                  return (
                    <div
                      key={obj.value}
                      onClick={() => setObjective(obj.value)}
                      style={{
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected 
                          ? '2px solid var(--primary)' 
                          : '1px solid rgba(255,255,255,0.05)',
                        background: isSelected 
                          ? 'rgba(123, 44, 191, 0.08)' 
                          : 'rgba(255,255,255,0.01)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                        <Icon size={18} />
                        <span style={{ fontSize: '14px', fontWeight: 700 }}>{obj.label}</span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{obj.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {saveError && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                fontSize: '13px',
                marginBottom: '16px',
              }}>
                {saveError}
              </div>
            )}

            <Button type="submit" disabled={isSaving} style={{ width: '100%', opacity: isSaving ? 0.7 : 1 }}>
              {isSaving ? 'Saving...' : 'Continue to Profile Details'}
            </Button>
          </form>
        </Card>
      </div>
    </PublicLayout>
  );
};

export const ProfileOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [level, setLevel] = useState('UG');
  const [objective, setObjective] = useState('find_internship');
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);

  // Profile Form States
  const [interests, setInterests] = useState('');
  const [favoriteSubjects, setFavoriteSubjects] = useState('');
  const [strengths, setStrengths] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [skills, setSkills] = useState('');
  const [projects, setProjects] = useState('');
  const [certifications, setCertifications] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [preferredDegree, setPreferredDegree] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [github, setGithub] = useState('');
  const [learningStyle, setLearningStyle] = useState('');
  const [experienceText, setExperienceText] = useState('');

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setIsLoading(true);
        // Load education details to check level
        const edu = await getEducationApi();
        if (edu.data) {
          setLevel(edu.data.educationLevel);
        }
        
        // Load profile details
        const prof = await getProfileApi();
        if (prof.data?.profile) {
          const p = prof.data.profile;
          setObjective(p.careerObjective || 'find_internship');
          setInterests(p.interests ? p.interests.join(', ') : '');
          setFavoriteSubjects(p.favoriteSubjects ? p.favoriteSubjects.join(', ') : '');
          setStrengths(p.strengths ? p.strengths.join(', ') : '');
          setHobbies(p.hobbies ? p.hobbies.join(', ') : '');
          setSkills(p.skills ? p.skills.join(', ') : '');
          setProjects(p.projects ? p.projects.join(', ') : '');
          setCertifications(p.certifications ? p.certifications.join(', ') : '');
          setCareerGoal(p.careerGoal || '');
          setPreferredDegree(p.preferredDegree || '');
          setLinkedIn(p.linkedIn || '');
          setGithub(p.github || '');
          setLearningStyle(p.learningStyle || '');
          
          if (p.experience && p.experience.length > 0) {
            // Simplify nested structures for user presentation in dynamic form
            const expList = p.experience.map((e: any) => `${e.role} at ${e.company}`);
            setExperienceText(expList.join(', '));
          }
        }
      } catch (err) {
        console.error('Failed to load profile details', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfileData();
  }, []);

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parseCommaArray = (str: string) => 
        str.split(',').map((item) => item.trim()).filter(Boolean);

      // Construct nested experience structures if provided
      const experience = experienceText 
        ? experienceText.split(',').map((expStr) => {
            const parts = expStr.trim().split(' at ');
            return {
              role: parts[0] || 'Contributor',
              company: parts[1] || 'Freelancer',
            };
          })
        : [];

      const payload: any = {
        careerObjective: objective,
        interests: parseCommaArray(interests),
        favoriteSubjects: parseCommaArray(favoriteSubjects),
        strengths: parseCommaArray(strengths),
        hobbies: parseCommaArray(hobbies),
        skills: parseCommaArray(skills),
        projects: parseCommaArray(projects),
        certifications: parseCommaArray(certifications),
        careerGoal: careerGoal || undefined,
        preferredDegree: preferredDegree || undefined,
        linkedIn: linkedIn || undefined,
        github: github || undefined,
        learningStyle: learningStyle || undefined,
        experience,
      };

      const res = await saveProfileApi(payload);
      setMetrics(res.data.metrics);
      setOnboardingComplete(true);
      toast.success('Profile saved successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save student profile details.');
    }
  };

  const completeOnboardingFlow = async () => {
    await refreshUser();
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Loading />
        </div>
      </PublicLayout>
    );
  }

  // Step 4: Visual State representing "Onboarding Completed"
  if (onboardingComplete) {
    return (
      <PublicLayout>
        <div style={{ maxWidth: '580px', margin: '60px auto', padding: '0 20px' }}>
          <Card style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: 'rgba(123, 44, 191, 0.1)', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              margin: '0 auto 24px',
              color: 'var(--primary)',
              border: '2px dashed var(--primary)'
            }}>
              <Sparkles size={36} />
            </div>

            <h2 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '8px' }}>Onboarding Complete!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
              Your personalized AI study portal is configured.
            </p>

            {/* Profile Checklist Metrics */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)', marginBottom: '32px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Completeness Profile Check</span>
                <Badge color="purple">{metrics?.completionPercentage}%</Badge>
              </div>
              <Progress value={metrics?.completionPercentage || 0} style={{ marginBottom: '24px' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.5px', marginBottom: '10px' }}>Completed ({metrics?.completedFields?.length || 0})</h4>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {metrics?.completedFields?.map((f: string) => (
                      <li key={f} style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--primary)' }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px', marginBottom: '10px' }}>Remaining ({metrics?.remainingFields?.length || 0})</h4>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {metrics?.remainingFields?.length > 0 ? (
                      metrics.remainingFields.map((f: string) => (
                        <li key={f} style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <span style={{ color: '#ef4444' }}>•</span> {f}
                        </li>
                      ))
                    ) : (
                      <li style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>None! Profile fully optimized.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <Button onClick={completeOnboardingFlow} style={{ width: '100%', padding: '14px' }}>
              Launch Career Dashboard
            </Button>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <Toaster position="top-right" theme="dark" />
      <div style={{ maxWidth: '640px', margin: '40px auto', padding: '0 20px' }}>
        
        {/* Onboarding Steps Indicators */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ flex: 1, borderBottom: '3px solid var(--primary)', paddingBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>1. Education &amp; Career Goal</div>
          <div style={{ flex: 1, borderBottom: '3px solid var(--primary)', paddingBottom: '8px', color: 'var(--primary)', fontWeight: 600, fontSize: '13px', textAlign: 'right' }}>2. Student Profile</div>
        </div>

        <Card style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Personal Profile details</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px' }}>
            Customize your profiles. Showing dynamic fields for: <strong>{level}</strong> studying seeking <strong>{objective.replace('_', ' ')}</strong>.
          </p>

          <form onSubmit={handleFinish}>
            {/* Class 10 Fields */}
            {level === 'Class10' && (
              <>
                <MultiSearchableSelect 
                  id="interests" 
                  label="What are your academic / career interests?" 
                  placeholder="e.g. Science, Computing, Astronomy"
                  required
                  value={interests}
                  onChange={(val) => setInterests(val)}
                  options={interestOptions}
                />
                <Textarea 
                  id="favoriteSubjects" 
                  label="Favorite Subjects" 
                  placeholder="e.g. Mathematics, English (separated by commas)"
                  required
                  value={favoriteSubjects}
                  onChange={(e) => setFavoriteSubjects(e.target.value)}
                />
                <Textarea 
                  id="strengths" 
                  label="Your Key Strengths" 
                  placeholder="e.g. Logical Reasoning, Writing (separated by commas)"
                  required
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                />
                <Textarea 
                  id="hobbies" 
                  label="Hobbies & Leisure Activities" 
                  placeholder="e.g. Football, Painting (separated by commas)"
                  required
                  value={hobbies}
                  onChange={(e) => setHobbies(e.target.value)}
                />
                <SearchableSelect 
                  id="careerGoal" 
                  label="Primary Career Aspiration" 
                  placeholder="e.g. Software Engineer"
                  value={careerGoal}
                  onChange={(val) => setCareerGoal(val)}
                  options={careerGoalOptions}
                />
              </>
            )}

            {/* Class 11 & Class 12 Fields */}
            {(level === 'Class11' || level === 'Class12') && (
              <>
                <MultiSearchableSelect 
                  id="interests" 
                  label="Interests" 
                  placeholder="e.g. Tech, Finance"
                  required
                  value={interests}
                  onChange={(val) => setInterests(val)}
                  options={interestOptions}
                />
                <Textarea 
                  id="favoriteSubjects" 
                  label="Favorite Stream Subjects" 
                  placeholder="e.g. Physics, Chemistry, Computer Science (separated by commas)"
                  required
                  value={favoriteSubjects}
                  onChange={(e) => setFavoriteSubjects(e.target.value)}
                />
                <Textarea 
                  id="strengths" 
                  label="Your Strengths" 
                  placeholder="e.g. Analytical Thinking (separated by commas)"
                  required
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                />
                <Textarea 
                  id="hobbies" 
                  label="Hobbies" 
                  placeholder="e.g. Coding (separated by commas)"
                  required
                  value={hobbies}
                  onChange={(e) => setHobbies(e.target.value)}
                />
                <SearchableSelect 
                  id="careerGoal" 
                  label="Future Career Goal" 
                  placeholder="e.g. Cloud Engineer"
                  value={careerGoal}
                  onChange={(val) => setCareerGoal(val)}
                  options={careerGoalOptions}
                />
                <SearchableSelect 
                  id="preferredDegree" 
                  label="Preferred Undergraduate Degree / Course" 
                  placeholder="e.g. B.Tech Computer Science"
                  value={preferredDegree}
                  onChange={(val) => setPreferredDegree(val)}
                  options={degreeOptions}
                />
                <Input 
                  id="learningStyle" 
                  label="Preferred Learning Style" 
                  placeholder="e.g. Practical/Visual"
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value)}
                />
              </>
            )}

            {/* Diploma, UG & PG Careers Focused Profiles */}
            {(level === 'Diploma' || level === 'UG' || level === 'PG') && (objective === 'find_internship' || objective === 'find_job') && (
              <>
                <MultiSearchableSelect 
                  id="skills" 
                  label="Technical Skills" 
                  placeholder="e.g. Javascript, Python, React, MongoDB"
                  required
                  value={skills}
                  onChange={(val) => setSkills(val)}
                  options={skillOptions}
                />
                <Textarea 
                  id="projects" 
                  label="Key Academic/Personal Projects" 
                  placeholder="e.g. E-Commerce Web App, Portfolio Page (separated by commas)"
                  required
                  value={projects}
                  onChange={(e) => setProjects(e.target.value)}
                />
                <Textarea 
                  id="certifications" 
                  label="Certifications & Badges" 
                  placeholder="e.g. AWS Cloud Practitioner (separated by commas)"
                  required
                  value={certifications}
                  onChange={(e) => setCertifications(e.target.value)}
                />
                <SearchableSelect 
                  id="careerGoal" 
                  label="Preferred Job / Internship Role" 
                  placeholder="e.g. Full Stack Developer"
                  value={careerGoal}
                  onChange={(val) => setCareerGoal(val)}
                  options={careerGoalOptions}
                />
                <Input 
                  id="linkedIn" 
                  label="LinkedIn Profile URL" 
                  placeholder="https://linkedin.com/in/username"
                  value={linkedIn}
                  onChange={(e) => setLinkedIn(e.target.value)}
                />
                <Input 
                  id="github" 
                  label="GitHub Profile URL" 
                  placeholder="https://github.com/username"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                />

                {level === 'PG' && (
                  <Textarea 
                    id="experience" 
                    label="Previous Work Experience (Role at Company)" 
                    placeholder="e.g. Frontend Intern at Google, Tutor at College (separated by commas)"
                    required
                    value={experienceText}
                    onChange={(e) => setExperienceText(e.target.value)}
                  />
                )}
              </>
            )}

            {/* Exploring or Higher Studies path for UG/PG/Diploma */}
            {(level === 'Diploma' || level === 'UG' || level === 'PG') && !(objective === 'find_internship' || objective === 'find_job') && (
              <>
                <MultiSearchableSelect 
                  id="interests" 
                  label="Academic Interests" 
                  placeholder="e.g. Cryptography, Machine Learning"
                  required
                  value={interests}
                  onChange={(val) => setInterests(val)}
                  options={interestOptions}
                />
                <MultiSearchableSelect 
                  id="skills" 
                  label="Technical Skills" 
                  placeholder="e.g. C++, Java, Linux"
                  required
                  value={skills}
                  onChange={(val) => setSkills(val)}
                  options={skillOptions}
                />
                <SearchableSelect 
                  id="careerGoal" 
                  label="Future Career Goal" 
                  placeholder="e.g. AI Researcher"
                  value={careerGoal}
                  onChange={(val) => setCareerGoal(val)}
                  options={careerGoalOptions}
                />
                <SearchableSelect 
                  id="preferredDegree" 
                  label="Preferred Master / Higher Studies Program" 
                  placeholder="e.g. M.Tech in Artificial Intelligence"
                  value={preferredDegree}
                  onChange={(val) => setPreferredDegree(val)}
                  options={degreeOptions}
                />
                <Input 
                  id="linkedIn" 
                  label="LinkedIn Profile URL" 
                  placeholder="https://linkedin.com/in/username"
                  value={linkedIn}
                  onChange={(e) => setLinkedIn(e.target.value)}
                />
              </>
            )}

            <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
              <Button type="button" variant="secondary" onClick={() => navigate('/education')} style={{ flex: 1 }}>Back</Button>
              <Button type="submit" style={{ flex: 2 }}>Save & Complete Profile</Button>
            </div>
          </form>
        </Card>
      </div>
    </PublicLayout>
  );
};

export const ProfileManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile Completeness Metrics State
  const [metrics, setMetrics] = useState<any>(null);
  const [viewingContext, setViewingContext] = useState<string>(() => {
    return localStorage.getItem('opportunity_context') || 'UG';
  });

  // Editable Form States (Personal Info)
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  // Editable Form States (Education Details)
  const [educationLevel, setEducationLevel] = useState('UG');
  const [schoolCollege, setSchoolCollege] = useState('');
  const [boardUniversity, setBoardUniversity] = useState('');
  const [currentClassSemester, setCurrentClassSemester] = useState('');
  const [stream, setStream] = useState('');
  const [course, setCourse] = useState('');
  const [percentageCGPA, setPercentageCGPA] = useState('');

  // Editable Form States (Student Profile details)
  const [careerObjective, setCareerObjective] = useState('find_internship');
  const [interests, setInterests] = useState('');
  const [favoriteSubjects, setFavoriteSubjects] = useState('');
  const [strengths, setStrengths] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [skills, setSkills] = useState('');
  const [projects, setProjects] = useState('');
  const [certifications, setCertifications] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [preferredDegree, setPreferredDegree] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [github, setGithub] = useState('');
  const [learningStyle, setLearningStyle] = useState('');
  const [experienceText, setExperienceText] = useState('');

  const loadProfileDetails = async () => {
    try {
      setLoading(true);
      
      // Load user details
      if (user) {
        setFullName(user.fullName || '');
        setMobileNumber(user.mobileNumber || '');
      }

      // Load education details
      const edu = await getEducationApi();
      if (edu?.data) {
        const d = edu.data;
        const levelVal = d.educationLevel || 'UG';
        setEducationLevel(levelVal);
        if (!localStorage.getItem('opportunity_context')) {
          setViewingContext(levelVal);
          localStorage.setItem('opportunity_context', levelVal);
        }
        setSchoolCollege(d.schoolCollege || '');
        setBoardUniversity(d.boardUniversity || '');
        setCurrentClassSemester(d.currentClassSemester || '');
        setStream(d.stream || '');
        setCourse(d.course || '');
        setPercentageCGPA(d.percentageCGPA ? d.percentageCGPA.toString() : '');
      }

      // Load profile details
      const prof = await getProfileApi();
      if (prof?.data) {
        const p = prof.data.profile || {};
        setCareerObjective(p.careerObjective || 'find_internship');
        setInterests(p.interests ? p.interests.join(', ') : '');
        setFavoriteSubjects(p.favoriteSubjects ? p.favoriteSubjects.join(', ') : '');
        setStrengths(p.strengths ? p.strengths.join(', ') : '');
        setHobbies(p.hobbies ? p.hobbies.join(', ') : '');
        setSkills(p.skills ? p.skills.join(', ') : '');
        setProjects(p.projects ? p.projects.join(', ') : '');
        setCertifications(p.certifications ? p.certifications.join(', ') : '');
        setCareerGoal(p.careerGoal || '');
        setPreferredDegree(p.preferredDegree || '');
        setLinkedIn(p.linkedIn || '');
        setGithub(p.github || '');
        setLearningStyle(p.learningStyle || '');
        
        if (p.experience && p.experience.length > 0) {
          const expList = p.experience.map((e: any) => `${e.role} at ${e.company}`);
          setExperienceText(expList.join(', '));
        } else {
          setExperienceText('');
        }

        // Save completeness metrics
        setMetrics(prof.data.metrics || null);
      }
    } catch (err) {
      console.error('Failed to load profile details in management dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileDetails();
  }, [user?.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const VALID_EDUCATION_LEVELS = ["Class10", "Class11", "Class12", "Diploma", "UG", "PG"];
    if (!VALID_EDUCATION_LEVELS.includes(educationLevel)) {
      toast.error('Invalid Education Level selection.');
      return;
    }

    try {
      setSaving(true);

      // 1. Update personal details
      await updateMeApi({
        fullName,
        mobileNumber
      });

      // 2. Update education details
      await saveEducationApi({
        educationLevel,
        schoolCollege: schoolCollege || undefined,
        boardUniversity: boardUniversity || undefined,
        currentClassSemester: currentClassSemester || undefined,
        stream: stream || undefined,
        course: course || undefined,
        percentageCGPA: percentageCGPA ? parseFloat(percentageCGPA) : undefined,
      });

      // 3. Update student profile details
      const parseCommaArray = (str: string) => 
        str.split(',').map((item) => item.trim()).filter(Boolean);

      const experience = experienceText 
        ? experienceText.split(',').map((expStr) => {
            const parts = expStr.trim().split(' at ');
            return {
              role: parts[0] || 'Contributor',
              company: parts[1] || 'Company',
            };
          })
        : [];

      const normalizeUrl = (urlStr: string) => {
        const trimmed = urlStr.trim();
        if (!trimmed) return undefined;
        if (!/^https?:\/\//i.test(trimmed)) {
          return `https://${trimmed}`;
        }
        return trimmed;
      };

      await saveProfileApi({
        careerObjective,
        interests: parseCommaArray(interests),
        favoriteSubjects: parseCommaArray(favoriteSubjects),
        strengths: parseCommaArray(strengths),
        hobbies: parseCommaArray(hobbies),
        skills: parseCommaArray(skills),
        projects: parseCommaArray(projects),
        certifications: parseCommaArray(certifications),
        careerGoal: careerGoal || undefined,
        preferredDegree: preferredDegree || undefined,
        linkedIn: normalizeUrl(linkedIn),
        github: normalizeUrl(github),
        learningStyle: learningStyle || undefined,
        experience,
      });

      toast.success('Profile changes saved successfully!');
      
      // Refresh Auth Context and local view states
      await refreshUser();
      await loadProfileDetails();
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    loadProfileDetails();
    setIsEditing(false);
  };

  if (loading) {
    return (
      <AppLayout>
        <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ height: '32px', width: '200px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: '16px', width: '350px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s infinite' }} />
          <Card style={{ padding: '32px', height: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ height: '24px', width: '150px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
            <div style={{ height: '40px', width: '100%', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', animation: 'pulse 1.5s infinite' }} />
            <div style={{ height: '40px', width: '100%', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', animation: 'pulse 1.5s infinite' }} />
            <div style={{ height: '40px', width: '100%', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', animation: 'pulse 1.5s infinite' }} />
          </Card>
        </div>
      </AppLayout>
    );
  }

  const completionPercentage = metrics?.completionPercentage || 0;
  const isProfileIncomplete = completionPercentage < 100;

  const mapEduLevel: Record<string, string> = {
    Class10: 'Class 10 Student',
    Class11: 'Class 11 Student',
    Class12: 'Class 12 Student',
    Diploma: 'Diploma Student',
    UG: 'Undergraduate (UG)',
    PG: 'Postgraduate (PG)'
  };

  const mapObjective: Record<string, string> = {
    explore_stream: 'Explore Streams',
    explore_degree: 'Explore Degrees',
    explore_career: 'Explore Careers',
    find_internship: 'Find Internship',
    find_job: 'Find Job',
    plan_higher_studies: 'Plan Higher Studies'
  };

  return (
    <AppLayout>
      <Toaster position="top-right" theme="dark" />
      
      <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <PageHeader 
          title="Profile Settings" 
          description="Manage your personal verification, academic background, and career search parameters."
          actions={
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                Opportunity Context
              </span>
              <select
                id="opportunity-context-profile"
                className="select"
                value={viewingContext}
                onChange={(e) => {
                  const val = e.target.value;
                  setViewingContext(val);
                  localStorage.setItem('opportunity_context', val);
                }}
                style={{ height: '42px', padding: '0 12px', minWidth: '180px', fontSize: '13px' }}
              >
                <option value="Class11">Class 11 Student</option>
                <option value="Class12">Class 12 Student</option>
                <option value="Diploma">Diploma Student</option>
                <option value="UG">Undergraduate (UG)</option>
                <option value="PG">Postgraduate (PG)</option>
              </select>
            </div>
          }
        />

        {/* Profile Completeness Checklist Panel */}
        {isProfileIncomplete && (
          <Card style={{ padding: '24px', border: '1px solid rgba(123, 44, 191, 0.25)', background: 'rgba(123, 44, 191, 0.02)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0' }}>Optimize Your Career Profile</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                  Complete remaining fields to receive hyper-personalized internship matching and AI recommendations.
                </p>
              </div>
              <Badge color="purple">{completionPercentage}% Complete</Badge>
            </div>
            
            <Progress value={completionPercentage} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Missing parameters: {metrics?.remainingFields?.join(', ') || 'None'}
              </span>
              <Button onClick={() => navigate('/education')} style={{ fontSize: '12px', padding: '8px 16px' }}>
                Continue Setup
              </Button>
            </div>
          </Card>
        )}

        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Section 1: Personal Info */}
            <Card style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '12px', margin: 0 }}>
                Personal Information
              </h3>
              
              {isEditing ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <Input id="fullName" label="Full Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  <Input id="mobileNumber" label="Mobile Number" required value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="label">Email Address (Read-only)</label>
                    <input className="input" value={user?.email || ''} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Full Name</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{fullName || 'User'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Mobile Number</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{mobileNumber || 'Not provided'}</span>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Email Address</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{user?.email || 'N/A'}</span>
                  </div>
                </div>
              )}
            </Card>

            {/* Section 2: Education background */}
            <Card style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '12px', margin: 0 }}>
                Educational Details
              </h3>

              {isEditing ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label htmlFor="educationLevel" className="label">Education Level</label>
                    <select
                      id="educationLevel"
                      className="select"
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                    >
                      <option value="Class10">Class 10 Student</option>
                      <option value="Class11">Class 11 Student</option>
                      <option value="Class12">Class 12 Student</option>
                      <option value="Diploma">Diploma Student</option>
                      <option value="PG">Postgraduate (PG)</option>
                    </select>
                  </div>
                  <Input id="schoolCollege" label="School / College" value={schoolCollege} onChange={(e) => setSchoolCollege(e.target.value)} />
                  <SearchableSelect 
                    id="boardUniversity" 
                    label="Board / University" 
                    value={boardUniversity} 
                    onChange={(val) => setBoardUniversity(val)} 
                    options={boardOptions}
                  />
                  <SearchableSelect 
                    id="currentClassSemester" 
                    label="Current Class / Semester" 
                    placeholder="e.g. 3rd Year / 6th Sem" 
                    value={currentClassSemester} 
                    onChange={(val) => setCurrentClassSemester(val)} 
                    options={semesterYearOptions}
                  />
                  <SearchableSelect 
                    id="course" 
                    label="Course / Degree Name" 
                    placeholder="e.g. B.Tech Computer Science" 
                    value={course} 
                    onChange={(val) => setCourse(val)} 
                    options={courseOptions}
                  />
                  <SearchableSelect 
                    id="stream" 
                    label="Academic Stream" 
                    placeholder="e.g. Science / Commerce" 
                    value={stream} 
                    onChange={(val) => setStream(val)} 
                    options={streamOptions}
                  />
                  <Input id="percentageCGPA" label="Grades (CGPA or %)" placeholder="e.g. 8.5" value={percentageCGPA} onChange={(e) => setPercentageCGPA(e.target.value)} />
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Education Level</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{mapEduLevel[educationLevel] || educationLevel || 'Student'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>School / College</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{schoolCollege || 'Not Set'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Board / University</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{boardUniversity || 'Not Set'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Class / Semester</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{currentClassSemester || 'Not Set'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Course / Degree</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{course || 'Not Set'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Stream</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{stream || 'Not Set'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Grades</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{percentageCGPA ? `${percentageCGPA}` : 'Not Set'}</span>
                  </div>
                </div>
              )}
            </Card>

            {/* Section 3: Career Objective */}
            <Card style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '12px', margin: 0 }}>
                Career Objective
              </h3>

              {isEditing ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label htmlFor="careerObjective" className="label">Primary Career Objective</label>
                    <select
                      id="careerObjective"
                      className="select"
                      value={careerObjective}
                      onChange={(e) => setCareerObjective(e.target.value)}
                    >
                      <option value="explore_stream">Explore Streams (Class 10/11)</option>
                      <option value="explore_degree">Explore Degrees (Class 12)</option>
                      <option value="explore_career">Explore Careers</option>
                      <option value="find_internship">Find Internship</option>
                      <option value="find_job">Find Job</option>
                      <option value="plan_higher_studies">Plan Higher Studies</option>
                    </select>
                  </div>
                  <SearchableSelect 
                    id="careerGoal" 
                    label="Future Career Goal" 
                    placeholder="e.g. Full Stack Engineer" 
                    value={careerGoal} 
                    onChange={(val) => setCareerGoal(val)} 
                    options={careerGoalOptions}
                  />
                  <SearchableSelect 
                    id="preferredDegree" 
                    label="Preferred Degree / Studies" 
                    placeholder="e.g. Master of Science" 
                    value={preferredDegree} 
                    onChange={(val) => setPreferredDegree(val)} 
                    options={degreeOptions}
                  />
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Objective</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{mapObjective[careerObjective] || careerObjective || 'Not Set'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Future Career Goal</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{careerGoal || 'Not Set'}</span>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Preferred Postgrad / Degree Studies</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{preferredDegree || 'Not Set'}</span>
                  </div>
                </div>
              )}
            </Card>

            {/* Section 4: Student profile parameters */}
            <Card style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '12px', margin: 0 }}>
                Student Profile details
              </h3>

              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <MultiSearchableSelect 
                    id="interests" 
                    label="Academic / Career Interests" 
                    placeholder="e.g. Cloud, Web, AI" 
                    value={interests} 
                    onChange={(val) => setInterests(val)} 
                    options={interestOptions}
                  />
                  <MultiSearchableSelect 
                    id="skills" 
                    label="Technical Skills / Tools" 
                    placeholder="e.g. Javascript, SQL, Git" 
                    value={skills} 
                    onChange={(val) => setSkills(val)} 
                    options={skillOptions}
                  />
                  <Textarea id="favoriteSubjects" label="Favorite Core Subjects" placeholder="e.g. Calculus, Database Management (separated by commas)" value={favoriteSubjects} onChange={(e) => setFavoriteSubjects(e.target.value)} />
                  <Textarea id="strengths" label="Your Strengths" placeholder="e.g. Logic, Problem Solving (separated by commas)" value={strengths} onChange={(e) => setStrengths(e.target.value)} />
                  <Textarea id="hobbies" label="Hobbies" placeholder="e.g. Chess, Reading (separated by commas)" value={hobbies} onChange={(e) => setHobbies(e.target.value)} />
                  <Textarea id="projects" label="Recent Project Titles" placeholder="e.g. E-Commerce API, Chat Application (separated by commas)" value={projects} onChange={(e) => setProjects(e.target.value)} />
                  <Textarea id="certifications" label="Professional Certifications" placeholder="e.g. AWS Cloud Practitioner (separated by commas)" value={certifications} onChange={(e) => setCertifications(e.target.value)} />
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <Input id="learningStyle" label="Preferred Learning Style" placeholder="e.g. Practical" value={learningStyle} onChange={(e) => setLearningStyle(e.target.value)} />
                    <Input id="experienceText" label="Professional Experience" placeholder="e.g. Intern at Google, Freelancer at Upwork (separated by commas)" value={experienceText} onChange={(e) => setExperienceText(e.target.value)} />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Interests</span>
                    <span style={{ fontSize: '14px', lineHeight: 1.5 }}>{interests || 'Not Set'}</span>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Technical Skills</span>
                    <span style={{ fontSize: '14px', lineHeight: 1.5 }}>{skills || 'Not Set'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Favorite Subjects</span>
                    <span style={{ fontSize: '14px' }}>{favoriteSubjects || 'Not Set'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Strengths</span>
                    <span style={{ fontSize: '14px' }}>{strengths || 'Not Set'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Hobbies</span>
                    <span style={{ fontSize: '14px' }}>{hobbies || 'Not Set'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Learning Style</span>
                    <span style={{ fontSize: '14px' }}>{learningStyle || 'Not Set'}</span>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Projects completed</span>
                    <span style={{ fontSize: '14px', lineHeight: 1.5 }}>{projects || 'Not Set'}</span>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Certifications</span>
                    <span style={{ fontSize: '14px', lineHeight: 1.5 }}>{certifications || 'Not Set'}</span>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Experience</span>
                    <span style={{ fontSize: '14px', lineHeight: 1.5 }}>{experienceText || 'None registered'}</span>
                  </div>
                </div>
              )}
            </Card>

            {/* Profile Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
              {isEditing ? (
                <>
                  <Button type="button" variant="secondary" onClick={handleCancel} disabled={saving}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button type="button" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>

          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const { deleteAccount } = useAuth();
  const [summaryData, setSummaryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setError(false);
      const res = await getDashboardSummaryApi();
      setSummaryData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard summary', err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <AppLayout>
        <div style={{ padding: '32px' }}>
          {/* Welcome header skeleton */}
          <div style={{ height: '120px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '32px', animation: 'pulse 1.5s infinite' }} />
          {/* Widgets grid skeleton */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '32px' }}>
            <div style={{ height: '150px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
            <div style={{ height: '150px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
            <div style={{ height: '150px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
          </div>
          {/* Bottom grid skeleton */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ height: '220px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
            <div style={{ height: '220px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <ErrorState 
            message="We encountered an issue fetching your personalized dashboard metrics."
            onRetry={fetchDashboard}
          />
        </div>
      </AppLayout>
    );
  }

  const {
    user,
    education,
    careerObjective,
    profileCompletion,
    nextStep,
    careerJourney,
    assessment,
    activity,
    quickActions
  } = summaryData;

  const completionPercent = profileCompletion?.completionPercentage || 0;
  const isComplete = completionPercent === 100;

  return (
    <AppLayout>
      <Toaster position="top-right" theme="dark" />
      
      {/* Top Banner section */}
      <div 
        style={{ 
          padding: '32px', 
          background: 'linear-gradient(135deg, rgba(123, 44, 191, 0.15) 0%, rgba(58, 134, 200, 0.08) 100%)', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid var(--border-glass)',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Welcome back, {user?.fullName || 'Student'}! 👋</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '600px', lineHeight: 1.5 }}>
          Your profile matches <strong>{education?.educationLevel || 'Not Set'}</strong> {education?.course ? `studying ${education.course}` : ''} seeking <strong>{careerObjective?.label || 'Not Set'}</strong>.
        </p>
      </div>

      {/* Grid of Key Info Widgets */}
      <div className="grid grid-cols-3" style={{ marginBottom: '32px' }}>
        
        {/* Profile Completion widget */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Profile Completeness</span>
            <Badge color="purple">{completionPercent}%</Badge>
          </div>
          <Progress value={completionPercent} style={{ marginBottom: '16px' }} />
          
          {isComplete ? (
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              ✓ Your student profile details are complete. Proceed to assessment tests.
            </p>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#ef4444' }}>{profileCompletion?.remainingFields?.length} items missing</span>
              <span onClick={() => navigate('/profile')} style={{ fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Complete Profile</span>
            </div>
          )}
        </Card>

        {/* Current status info widget */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--primary)' }}>
            <Award size={20} />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Active Objective</span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{careerObjective?.label || 'Not Set'}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Status: {assessment?.status === 'completed' ? 'Assessment Checked' : 'Assessment Pending'}
          </div>
        </Card>

        {/* Action center widget */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--secondary)' }}>
            <Sparkles size={20} />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Next Recommended Step</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '12px' }}>
            {nextStep?.title}
          </p>
          <Button style={{ padding: '8px 16px', fontSize: '12px' }} onClick={() => navigate(nextStep?.actionLink)}>
            {nextStep?.actionText}
          </Button>
        </Card>

      </div>

      {/* Career Journey Timeline Map */}
      <Card style={{ marginBottom: '32px', padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}>My Career Journey Pathway</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', overflowX: 'auto', padding: '10px 0' }}>
          
          {/* Connector bar behind timeline */}
          <div style={{ position: 'absolute', top: '24px', left: '40px', right: '40px', height: '3px', background: 'rgba(255,255,255,0.05)', zIndex: 1 }} />

          {careerJourney?.map((step: any, idx: number) => {
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';
            const isLocked = step.status === 'locked';

            let dotBg = 'rgba(255,255,255,0.05)';
            let dotBorder = '1px solid rgba(255,255,255,0.1)';
            let titleColor = 'var(--text-secondary)';

            if (isCompleted) {
              dotBg = 'var(--primary)';
              dotBorder = '1px solid var(--primary)';
              titleColor = 'var(--text-primary)';
            } else if (isCurrent) {
              dotBg = 'rgba(123, 44, 191, 0.2)';
              dotBorder = '2px solid var(--primary)';
              titleColor = 'var(--primary)';
            }

            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 2, minWidth: '100px', cursor: 'default' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: dotBg, 
                  border: dotBorder, 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  fontWeight: 700,
                  fontSize: '12px',
                  color: isCompleted ? '#ffffff' : (isCurrent ? 'var(--primary)' : 'var(--text-muted)'),
                  marginBottom: '10px',
                  boxShadow: isCurrent ? '0 0 12px var(--primary)' : 'none'
                }}>
                  {isCompleted ? '✓' : (isLocked ? '🔒' : idx + 1)}
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: titleColor, textAlign: 'center' }}>{step.name}</span>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginTop: '4px' }}>{step.status}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Grid Bottom: Recent activity vs quick actions */}
      <div className="grid grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Recent Platform Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activity && activity.length > 0 ? (
              activity.map((act: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{act.text}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Category: {act.type}</div>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{act.time}</span>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '14px' }}>No recent activity</p>
                <p style={{ fontSize: '11px', marginTop: '4px' }}>Your activity logs will populate here as you complete advisor recommendations.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions Panel */}
        <Card>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Quick Career Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {quickActions?.map((act: any, idx: number) => (
              <Button key={idx} variant="secondary" onClick={() => navigate(act.link)}>
                {act.name}
              </Button>
            ))}
            <Button variant="secondary" onClick={() => setModalOpen(true)}>Wipe Account</Button>
          </div>
        </Card>
      </div>

      {/* Account Deletion Confirmation */}
      <ConfirmDialog 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onConfirm={async () => {
          try {
            await deleteAccount();
            toast.success("Account deleted successfully.");
            navigate('/');
          } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to delete account.");
          }
        }} 
        title="Delete Account Confirmation" 
        message="Are you sure you want to delete your profile? This deletes all recommendations and parsed PDF resume attachments. This cannot be undone."
        confirmText="Yes, delete account"
        cancelText="Cancel"
        isDangerous={true}
      />
    </AppLayout>
  );
};

export const Assessment: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'loading' | 'unavailable' | 'intro' | 'resume' | 'questions' | 'review' | 'submitting' | 'completed'>('loading');
  const [assessmentMeta, setAssessmentMeta] = useState<any>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [unavailableReason, setUnavailableReason] = useState('');
  const [loadError, setLoadError] = useState(false);
  const [existingScore, setExistingScore] = useState<number | undefined>(undefined);
  const [resultData, setResultData] = useState<any>(null);

  // Load availability on mount
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAvailableAssessmentApi();
        const d = res.data;
        if (!d.available) {
          setUnavailableReason(d.reason || 'Assessment not available for your education level.');
          setPhase('unavailable');
          return;
        }
        setAssessmentMeta(d.assessment);
        if (d.attemptStatus === 'completed') {
          setExistingScore(d.overallScore);
          setPhase('completed');
        } else if (d.attemptStatus === 'in_progress' && d.attemptId) {
          setAttemptId(d.attemptId);
          setPhase('resume');
        } else {
          setPhase('intro');
        }
      } catch {
        setLoadError(true);
        setPhase('loading');
      }
    };
    load();
  }, []);

  // Start or resume assessment
  const handleStart = async () => {
    try {
      let aId = attemptId;
      if (!aId) {
        const res = await startAssessmentApi(assessmentMeta._id);
        aId = res.data._id;
        setAttemptId(aId!);
      }
      const attemptRes = await getAttemptApi(aId!);
      const ad = attemptRes.data;
      if (ad.isExpired || ad.attempt.status === 'completed') {
        setPhase('completed');
        return;
      }
      setQuestions(ad.questions);
      setRemainingSeconds(ad.remainingSeconds);
      setCurrentIdx(ad.attempt.currentQuestionIndex || 0);
      // Restore saved answers
      const restored: Record<string, string> = {};
      for (const a of ad.attempt.answers || []) {
        restored[a.questionId] = a.selectedOption;
      }
      setAnswers(restored);
      setPhase('questions');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to start assessment');
    }
  };

  // Timer countdown
  useEffect(() => {
    if (phase !== 'questions' || remainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const handleAutoSubmit = async () => {
    if (!attemptId) return;
    try {
      const ansArr = Object.entries(answers).map(([qId, opt]) => ({ questionId: qId, selectedOption: opt }));
      const res = await submitAssessmentApi(attemptId, { answers: ansArr });
      setResultData(res.data);
      setPhase('completed');
      toast.info('Time expired — assessment auto-submitted.');
    } catch {
      toast.error('Auto-submit failed. Your progress is saved.');
    }
  };

  // Autosave on answer selection
  const selectAnswer = async (questionId: string, option: string) => {
    const updated = { ...answers, [questionId]: option };
    setAnswers(updated);
    if (!attemptId) return;
    try {
      await saveProgressApi(attemptId, {
        currentQuestionIndex: currentIdx,
        answers: [{ questionId, selectedOption: option }]
      });
    } catch {
      // Silently retry next time
    }
  };

  const goNext = async () => {
    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      if (attemptId) {
        try { await saveProgressApi(attemptId, { currentQuestionIndex: nextIdx }); } catch {}
      }
    }
  };

  const goPrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  const handleSubmit = async () => {
    if (!attemptId) return;
    setPhase('submitting');
    try {
      const ansArr = Object.entries(answers).map(([qId, opt]) => ({ questionId: qId, selectedOption: opt }));
      const res = await submitAssessmentApi(attemptId, { answers: ansArr });
      setResultData(res.data);
      setPhase('completed');
      toast.success('Assessment submitted successfully!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Submission failed.');
      setPhase('review');
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // LOADING STATE
  if (phase === 'loading' && !loadError) {
    return (
      <AppLayout>
        <div style={{ padding: '32px' }}>
          <div style={{ height: '80px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '24px', animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: '200px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
        </div>
      </AppLayout>
    );
  }

  if (loadError) {
    return (
      <AppLayout>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <ErrorState message="Unable to load assessment information." onRetry={() => window.location.reload()} />
        </div>
      </AppLayout>
    );
  }

  // UNAVAILABLE (Class 10 / Diploma explore)
  if (phase === 'unavailable') {
    return (
      <AppLayout>
        <PageHeader title="Career Assessment" description="Aptitude and readiness evaluations." />
        <EmptyState
          title="Assessment Not Available"
          description={unavailableReason}
          icon={<BookOpen />}
          action={<Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>}
        />
      </AppLayout>
    );
  }

  // INTRO
  if (phase === 'intro' || phase === 'resume') {
    return (
      <AppLayout>
        <Toaster position="top-right" theme="dark" />
        <div style={{ maxWidth: '640px', margin: '40px auto', padding: '0 20px' }}>
          <Card style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(123,44,191,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 24px', color: 'var(--primary)' }}>
              <BookOpen size={28} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>{assessmentMeta?.assessmentName}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
              {assessmentMeta?.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '28px' }}>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>{assessmentMeta?.totalSections}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Sections</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>{assessmentMeta?.totalQuestions}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Questions</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>{assessmentMeta?.duration}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Minutes</div>
              </div>
            </div>

            <div style={{ textAlign: 'left', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', marginBottom: '28px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>Instructions</h4>
              <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <li>Your answers are saved automatically after each selection.</li>
                <li>You can navigate between questions freely.</li>
                <li>Time limit: <strong>{assessmentMeta?.duration} minutes</strong>. Assessment auto-submits when time expires.</li>
                <li>Review all answers before final submission.</li>
                <li>Results provide insight for personalized career guidance.</li>
              </ul>
            </div>

            {phase === 'resume' ? (
              <Button onClick={handleStart} style={{ width: '100%', padding: '14px' }}>Continue Assessment</Button>
            ) : (
              <Button onClick={handleStart} style={{ width: '100%', padding: '14px' }}>Start Assessment</Button>
            )}
          </Card>
        </div>
      </AppLayout>
    );
  }

  // SUBMITTING
  if (phase === 'submitting') {
    return (
      <AppLayout>
        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
          <Loading fullScreen={false} />
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Submitting your assessment...</p>
        </div>
      </AppLayout>
    );
  }

  // COMPLETED / RESULT
  if (phase === 'completed') {
    const scores = resultData?.sectionScores;
    const overall = resultData?.overallScore ?? existingScore;

    const getLabel = (v: number) => v >= 80 ? 'Strong' : v >= 60 ? 'Good' : v >= 40 ? 'Developing' : 'Needs Improvement';
    const getLabelColor = (v: number) => v >= 80 ? '#22c55e' : v >= 60 ? '#3b82f6' : v >= 40 ? '#f59e0b' : '#ef4444';

    return (
      <AppLayout>
        <Toaster position="top-right" theme="dark" />
        <div style={{ maxWidth: '640px', margin: '40px auto', padding: '0 20px' }}>
          <Card style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 24px', color: '#22c55e' }}>
              <CheckCircle size={28} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Assessment Completed</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
              {assessmentMeta?.assessmentName || 'Your assessment'}
            </p>

            {overall !== undefined && (
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '48px', fontWeight: 800, color: getLabelColor(overall) }}>{overall}</div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Overall Score / 100</div>
                <Badge color="purple" style={{ marginTop: '8px' }}>{getLabel(overall)}</Badge>
              </div>
            )}

            {scores && (
              <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>Section Performance</h4>
                {Object.entries(scores).map(([name, score]: [string, any]) => (
                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: getLabelColor(score) }}>{score}%</span>
                      <span style={{ fontSize: '10px', color: getLabelColor(score) }}>{getLabel(score)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="secondary" onClick={() => navigate('/assessment/history')} style={{ flex: 1 }}>View History</Button>
              <Button onClick={() => navigate('/dashboard')} style={{ flex: 1 }}>Dashboard</Button>
            </div>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // REVIEW
  if (phase === 'review') {
    const answered = questions.filter(q => answers[q._id]).length;
    const unanswered = questions.length - answered;

    return (
      <AppLayout>
        <Toaster position="top-right" theme="dark" />
        <div style={{ maxWidth: '640px', margin: '40px auto', padding: '0 20px' }}>
          <Card style={{ padding: '40px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>Review Your Assessment</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', textAlign: 'center' }}>
              Review your progress before final submission.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', background: 'rgba(34,197,94,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(34,197,94,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#22c55e' }}>{answered}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Answered</div>
              </div>
              <div style={{ padding: '16px', background: unanswered > 0 ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: unanswered > 0 ? '1px solid rgba(239,68,68,0.15)' : '1px solid var(--border-glass)', textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 800, color: unanswered > 0 ? '#ef4444' : 'var(--text-primary)' }}>{unanswered}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Unanswered</div>
              </div>
            </div>

            {unanswered > 0 && (
              <p style={{ fontSize: '12px', color: '#f59e0b', marginBottom: '16px', textAlign: 'center' }}>
                ⚠ You have {unanswered} unanswered question{unanswered > 1 ? 's' : ''}.
              </p>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="secondary" onClick={() => setPhase('questions')} style={{ flex: 1 }}>Return to Questions</Button>
              <Button onClick={handleSubmit} style={{ flex: 1 }}>Submit Assessment</Button>
            </div>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // QUESTIONS VIEW
  const currentQ = questions[currentIdx];
  const currentSection = currentQ?.sectionName || 'Section';
  const isAnswered = (qId: string) => !!answers[qId];

  // Collect unique sections for section nav
  const sectionList = questions.reduce((acc: { id: string; name: string; done: boolean }[], q: any) => {
    if (!acc.find(s => s.id === q.sectionId)) {
      const sectionQs = questions.filter((qq: any) => qq.sectionId === q.sectionId);
      const allDone = sectionQs.every((qq: any) => answers[qq._id]);
      acc.push({ id: q.sectionId, name: q.sectionName, done: allDone });
    }
    return acc;
  }, []);

  return (
    <AppLayout>
      <Toaster position="top-right" theme="dark" />

      {/* Timer + Progress Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Question <strong>{currentIdx + 1}</strong> of <strong>{questions.length}</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: remainingSeconds < 120 ? '#ef4444' : 'var(--text-secondary)' }}>
          <Clock size={14} />
          <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'monospace' }}>{formatTime(remainingSeconds)}</span>
        </div>
      </div>

      {/* Section Navigation */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px', padding: '4px 0' }}>
        {sectionList.map((sec) => {
          const isCurrent = sec.id === currentQ?.sectionId;
          return (
            <div key={sec.id} style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              background: isCurrent ? 'var(--primary)' : sec.done ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
              color: isCurrent ? '#fff' : sec.done ? '#22c55e' : 'var(--text-secondary)',
              border: isCurrent ? '1px solid var(--primary)' : '1px solid var(--border-glass)'
            }}>
              {sec.done ? '✓ ' : ''}{sec.name}
            </div>
          );
        })}
      </div>

      {/* Question Card */}
      <Card style={{ padding: '32px', marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{currentSection}</div>
        <h3 style={{ fontSize: '16px', fontWeight: 600, lineHeight: 1.5, marginBottom: '24px', color: 'var(--text-primary)' }}>
          {currentQ?.question}
        </h3>

        {/* Options Renderer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {currentQ?.options?.map((opt: string, idx: number) => {
            const selected = answers[currentQ._id] === opt;
            return (
              <label
                key={idx}
                htmlFor={`q-opt-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: selected ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)',
                  background: selected ? 'rgba(123,44,191,0.08)' : 'rgba(255,255,255,0.01)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <input
                  type="radio"
                  id={`q-opt-${idx}`}
                  name={`question-${currentQ._id}`}
                  value={opt}
                  checked={selected}
                  onChange={() => selectAnswer(currentQ._id, opt)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <span style={{ fontSize: '14px', color: selected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{opt}</span>
              </label>
            );
          })}
        </div>
      </Card>

      {/* Question Navigation Dots */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: '20px' }}>
        {questions.map((q: any, idx: number) => (
          <div
            key={q._id}
            onClick={() => setCurrentIdx(idx)}
            style={{
              width: '28px', height: '28px', borderRadius: '50%',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              fontSize: '10px', fontWeight: 700, cursor: 'pointer',
              background: idx === currentIdx ? 'var(--primary)' : isAnswered(q._id) ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.03)',
              color: idx === currentIdx ? '#fff' : isAnswered(q._id) ? '#22c55e' : 'var(--text-muted)',
              border: idx === currentIdx ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)'
            }}
            title={`Question ${idx + 1}${isAnswered(q._id) ? ' (Answered)' : ''}`}
          >
            {idx + 1}
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <Button variant="secondary" onClick={goPrev} disabled={currentIdx === 0} style={{ flex: 1 }}>Previous</Button>
        {currentIdx === questions.length - 1 ? (
          <Button onClick={() => setPhase('review')} style={{ flex: 1 }}>Review & Submit</Button>
        ) : (
          <Button onClick={goNext} style={{ flex: 1 }}>Next</Button>
        )}
      </div>
    </AppLayout>
  );
};

// Assessment History Page
export const AssessmentHistory: React.FC = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getResultsHistoryApi();
        setResults(res.data || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <PageHeader title="Assessment History" description="Your completed assessments." />
        <div style={{ height: '200px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader title="Assessment History" description="Your completed assessments and score breakdowns." />
      {results.length === 0 ? (
        <EmptyState
          title="No assessment history yet"
          description="Complete your first assessment to see your results here."
          icon={<BookOpen />}
          action={<Button onClick={() => navigate('/assessment')}>Start Assessment</Button>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {results.map((r: any) => (
            <Card key={r._id} style={{ padding: '20px', cursor: 'pointer' }} onClick={() => navigate(`/assessment/result/${r._id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>{r.assessmentId?.assessmentName || 'Assessment'}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Completed: {r.completedAt ? new Date(r.completedAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>{r.overallScore}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>/ 100</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

// Assessment Result Detail Page
export const AssessmentResultDetail: React.FC = () => {
  const navigate = useNavigate();
  const { resultId } = useParams<{ resultId: string }>();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [detailError, setDetailError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        if (!resultId) return;
        const res = await getResultApi(resultId);
        setResult(res.data);
      } catch {
        setDetailError(true);
      }
      setLoading(false);
    };
    load();
  }, [resultId]);

  if (loading) {
    return (
      <AppLayout>
        <div style={{ height: '300px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', animation: 'pulse 1.5s infinite', margin: '32px' }} />
      </AppLayout>
    );
  }

  if (detailError || !result) {
    return (
      <AppLayout>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <ErrorState message="Unable to load assessment result." onRetry={() => window.location.reload()} />
        </div>
      </AppLayout>
    );
  }

  const getLabel = (v: number) => v >= 80 ? 'Strong' : v >= 60 ? 'Good' : v >= 40 ? 'Developing' : 'Needs Improvement';
  const getLabelColor = (v: number) => v >= 80 ? '#22c55e' : v >= 60 ? '#3b82f6' : v >= 40 ? '#f59e0b' : '#ef4444';

  const scores = result.sectionScores || {};

  return (
    <AppLayout>
      <div style={{ maxWidth: '640px', margin: '40px auto', padding: '0 20px' }}>
        <Card style={{ padding: '40px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>{result.assessmentId?.assessmentName || 'Assessment Result'}</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Completed: {result.completedAt ? new Date(result.completedAt).toLocaleDateString() : ''}
            {' · '}Version {result.assessmentVersion}
          </p>

          <div style={{ fontSize: '52px', fontWeight: 800, color: getLabelColor(result.overallScore) }}>{result.overallScore}</div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Overall Score / 100</div>
          <Badge color="purple">{getLabel(result.overallScore)}</Badge>

          <div style={{ textAlign: 'left', marginTop: '32px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>Section Breakdown</h4>
            {Object.entries(scores).map(([name, score]: [string, any]) => (
              <div key={name} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{name}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: getLabelColor(score) }}>{score}% — {getLabel(score)}</span>
                </div>
                <Progress value={score} />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <Button variant="secondary" onClick={() => navigate('/assessment/history')} style={{ flex: 1 }}>History</Button>
            <Button onClick={() => navigate('/dashboard')} style={{ flex: 1 }}>Dashboard</Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export const Recommendations: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [recType, setRecType] = useState<string>('');
  const [data, setData] = useState<any>(null);
  
  // Dependency states
  const [profileComplete, setProfileComplete] = useState(true);
  const [assessmentComplete, setAssessmentComplete] = useState(true);
  const [isClass10, setIsClass10] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const loadData = async () => {
    try {
      const sumRes = await getDashboardSummaryApi();
      const edu = sumRes.data?.education;
      const prof = sumRes.data?.careerObjective;
      const comp = sumRes.data?.profileCompletion?.completionPercentage || 0;
      const assessStatus = sumRes.data?.assessment?.status || 'not_started';

      if (!edu || comp < 100) {
        setProfileComplete(false);
        setLoading(false);
        return;
      }

      const level = edu.educationLevel;
      const obj = prof?.value || '';

      if (level === 'Class10') {
        setIsClass10(true);
        setLoading(false);
        return;
      }

      if (assessStatus !== 'completed') {
        setAssessmentComplete(false);
        setLoading(false);
        return;
      }

      let type = 'career_recommendation';
      if (level === 'Class11') {
        type = 'stream_recommendation';
      } else if (level === 'Class12') {
        type = 'degree_recommendation';
      } else if (obj === 'find_internship' || obj === 'find_job') {
        type = 'skill_gap_analysis';
      }

      setRecType(type);

      // Fetch existing recommendation (cache check)
      const rec = await getAIRecommendationByTypeApi(type);
      if (rec.data) {
        setData(rec.data.result);
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to resolve recommendations status.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerate = async (force: boolean = false) => {
    if (!recType) return;
    setGenerating(true);
    setErrorMsg('');
    try {
      const res = force 
        ? await regenerateAIRecommendationApi(recType)
        : await generateAIRecommendationApi(recType);
      setData(res.data.result);
      toast.success(force ? 'Insights regenerated successfully!' : 'Insights compiled successfully!');
    } catch (err: any) {
      const msg = err?.response?.data?.message || "We couldn't generate your insights right now. Please check configurations and try again.";
      setErrorMsg(msg);
      toast.error('AI generation failed.');
    }
    setGenerating(false);
  };

  const getFitLabel = (score: number) => {
    if (score >= 80) return { text: 'Strong Fit', color: 'purple' as const };
    if (score >= 60) return { text: 'Good Fit', color: 'blue' as const };
    if (score >= 40) return { text: 'Moderate Fit', color: 'blue' as const };
    return { text: 'Explore Further', color: 'blue' as const };
  };

  if (loading) {
    return (
      <AppLayout>
        <PageHeader title="Your Career Insights" description="Personalized guidance based on your profile and assessment." />
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ height: '50px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: '180px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
        </div>
      </AppLayout>
    );
  }

  // Enforce Class 10 prohibition
  if (isClass10) {
    return (
      <AppLayout>
        <PageHeader title="Your Career Insights" description="Personalized guidance based on your profile." />
        <EmptyState 
          title="No recommendations available" 
          description="Class 10 students do not receive formal AI recommendations. Explore stream options via roadmaps."
          action={<Button onClick={() => navigate('/roadmap')}>View Roadmaps</Button>}
          icon={<Map />}
        />
      </AppLayout>
    );
  }

  // Dependency States Empty States
  if (!profileComplete) {
    return (
      <AppLayout>
        <PageHeader title="Your Career Insights" description="Personalized guidance based on your profile and assessment." />
        <EmptyState 
          title="Complete your profile first" 
          description="Complete your student profile details and educational parameters to unlock personalized recommendations."
          action={<Button onClick={() => navigate('/profile')}>Complete Profile</Button>}
          icon={<FileText />}
        />
      </AppLayout>
    );
  }

  if (!assessmentComplete) {
    return (
      <AppLayout>
        <PageHeader title="Your Career Insights" description="Personalized guidance based on your profile and assessment." />
        <EmptyState 
          title="Complete your assessment first" 
          description="You must complete the career diagnostic assessment test to receive personalized stream or career recommendations."
          action={<Button onClick={() => navigate('/assessment')}>Take Assessment</Button>}
          icon={<Award />}
        />
      </AppLayout>
    );
  }

  if (errorMsg && !data) {
    const isKeyMissing = errorMsg.includes('Gemini AI is not connected') || errorMsg.includes('API key');
    return (
      <AppLayout>
        <PageHeader title="Your Career Insights" description="Personalized guidance based on your profile and assessment." />
        <Card style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          {isKeyMissing ? (
            <>
              <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Gemini AI is not connected.</h4>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', maxWidth: '400px', margin: 0 }}>
                Add your Google AI Studio API key in Settings to use personalized AI recommendations and roadmaps.
              </p>
              <Button onClick={() => navigate('/settings')} style={{ marginTop: '8px' }}>
                Configure Gemini
              </Button>
            </>
          ) : (
            <>
              <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '20px', margin: 0 }}>{errorMsg}</p>
              <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
            </>
          )}
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Toaster position="top-right" theme="dark" />
      <PageHeader 
        title="Your Career Insights" 
        description="Personalized guidance based on your profile and assessment results." 
      />

      {data ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* AI Disclaimer */}
          <div style={{ padding: '16px', background: 'rgba(123,44,191,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(123,44,191,0.2)', display: 'flex', gap: '12px' }}>
            <Sparkles size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h5 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>AI-Generated Fit Score Insight</h5>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {recType === 'stream_recommendation'
                  ? 'This recommendation is AI-generated guidance. Your final stream choice should also consider your interests, academic performance, and guidance from teachers/parents/counsellors.'
                  : 'AI-generated insight: This recommendation is intended to support your career decision-making and should not be treated as a guaranteed outcome.'}
              </p>
            </div>
          </div>

          {/* Renderers depending on selection level */}
          {recType === 'stream_recommendation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Stream Comparison Matrix</h4>
              
              {/* Highlight best match card first */}
              {(() => {
                const sorted = [...(data.recommendations || [])].sort((a, b) => b.fitScore - a.fitScore);
                const best = sorted[0];
                if (!best) return null;
                const fit = getFitLabel(best.fitScore);
                return (
                  <Card style={{ padding: '28px', border: '2px solid var(--primary)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-12px', left: '20px', background: 'var(--primary)', color: '#fff', padding: '2px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                      Recommended Stream
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <h3 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>{best.stream}</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: 0 }}>AI-generated fit score</p>
                      </div>
                      <Badge color={fit.color}>{best.fitScore}% - {fit.text}</Badge>
                    </div>
                    <h5 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Key Reasons:</h5>
                    <ul style={{ margin: '0 0 16px 0', paddingLeft: '16px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {best.reasons?.map((reason: string, idx: number) => <li key={idx}>{reason}</li>)}
                    </ul>
                  </Card>
                );
              })()}

              <div className="grid grid-cols-2" style={{ gap: '16px' }}>
                {(() => {
                  const sorted = [...(data.recommendations || [])].sort((a, b) => b.fitScore - a.fitScore);
                  const remaining = sorted.slice(1);
                  return remaining.map((r: any, idx: number) => {
                    const fit = getFitLabel(r.fitScore);
                    return (
                      <Card key={idx} style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontSize: '16px', fontWeight: 700 }}>{r.stream}</span>
                          <Badge color={fit.color}>{r.fitScore}%</Badge>
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '-6px 0 12px 0' }}>AI-generated fit score</p>
                        <h5 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Key Reasons:</h5>
                        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {r.reasons?.map((reason: string, rIdx: number) => <li key={rIdx}>{reason}</li>)}
                        </ul>
                      </Card>
                    );
                  });
                })()}
              </div>

              {data.considerations && (
                <Card style={{ padding: '20px' }}>
                  <h5 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>Important Considerations:</h5>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {data.considerations?.map((c: string, idx: number) => <li key={idx}>{c}</li>)}
                  </ul>
                </Card>
              )}
            </div>
          )}

          {recType === 'degree_recommendation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Recommended College Programs</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {data.recommendations?.map((r: any, idx: number) => {
                  const fit = getFitLabel(r.fitScore);
                  return (
                    <Card key={idx} style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{r.degree}</span>
                        <Badge color={fit.color}>{r.fitScore}% - {fit.text}</Badge>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '-4px 0 12px 0' }}>AI-generated fit score</p>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>{r.explanation || r.reason}</p>
                      {r.reasons && (
                        <>
                          <h5 style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px' }}>Strengths Supporting This Option:</h5>
                          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            {r.reasons?.map((reason: string, rIdx: number) => <li key={rIdx}>{reason}</li>)}
                          </ul>
                        </>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {recType === 'career_recommendation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Matching Career Paths</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {data.recommendations?.map((r: any, idx: number) => {
                  const fit = getFitLabel(r.fitScore);
                  return (
                    <Card key={idx} style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{r.career}</span>
                        <Badge color={fit.color}>{r.fitScore}% - {fit.text}</Badge>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '-4px 0 12px 0' }}>AI-generated fit score</p>
                      
                      <div style={{ marginTop: '12px' }}>
                        <h5 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Why this matches you:</h5>
                        <ul style={{ margin: '0 0 12px 0', paddingLeft: '16px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {r.reasons?.map((reason: string, rIdx: number) => <li key={rIdx}>{reason}</li>)}
                        </ul>
                      </div>

                      {r.requiredSkills && (
                        <div style={{ marginTop: '12px' }}>
                          <h5 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Required Skills:</h5>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {r.requiredSkills?.map((s: string, sIdx: number) => <Badge key={sIdx} color="blue">{s}</Badge>)}
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>

              {/* Action Navigation Blocks */}
              <Card style={{ padding: '24px', background: 'rgba(255,255,255,0.01)' }}>
                <h5 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Next Action Steps</h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  <Button variant="secondary" onClick={() => navigate('/roadmap')}>View Career Roadmap</Button>
                  <Button variant="secondary" onClick={() => navigate('/learning')}>View Learning Plan</Button>
                  <Button variant="secondary" onClick={() => navigate('/assessment')}>Retake Assessment</Button>
                </div>
              </Card>
            </div>
          )}

          {recType === 'skill_gap_analysis' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Skill Gap Analysis</h4>
              <Card style={{ padding: '24px' }}>
                <h5 style={{ fontSize: '13px', fontWeight: 700, color: '#22c55e', marginBottom: '12px' }}>✓ Identified Strengths</h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
                  {data.existingStrengths?.map((s: string, idx: number) => <Badge key={idx} color="blue">{s}</Badge>)}
                </div>

                <h5 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px' }}>⚠ Missing Skills Gap</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {data.missingSkills?.map((m: any, idx: number) => (
                    <div key={idx} style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px' }}>{m.skill}</span>
                        <Badge color={m.priority === 'high' ? 'purple' : 'blue'}>
                          {m.priority.toUpperCase()} PRIORITY
                        </Badge>
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{m.reason}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {generating ? (
            <Button disabled style={{ width: '100%', padding: '14px' }}>Re-compiling insights...</Button>
          ) : (
            <Button variant="secondary" onClick={() => handleGenerate(true)} style={{ width: '100%', padding: '14px' }}>
              Regenerate Recommendation
            </Button>
          )}
        </div>
      ) : (
        <EmptyState 
          title="You don't have a recommendation yet" 
          description="Your profile and assessment results are loaded! Click generate to compile personalized recommendations from Gemini." 
          action={
            generating ? (
              <Button disabled>Generating Insights...</Button>
            ) : (
              <Button onClick={() => handleGenerate(false)}>Generate Insights</Button>
            )
          }
          icon={<Sparkles />}
        />
      )}
    </AppLayout>
  );
};

export const Roadmap: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [data, setData] = useState<any>(null);
  
  // Dependency states
  const [profileComplete, setProfileComplete] = useState(true);
  const [assessmentComplete, setAssessmentComplete] = useState(true);
  const [recommendationComplete, setRecommendationComplete] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const loadData = async () => {
    try {
      const sumRes = await getDashboardSummaryApi();
      const edu = sumRes.data?.education;
      const prof = sumRes.data?.careerObjective;
      const comp = sumRes.data?.profileCompletion?.completionPercentage || 0;
      const assessStatus = sumRes.data?.assessment?.status || 'not_started';

      if (!edu || comp < 100) {
        setProfileComplete(false);
        setLoading(false);
        return;
      }

      if (assessStatus !== 'completed' && edu.educationLevel !== 'Class10') {
        setAssessmentComplete(false);
        setLoading(false);
        return;
      }

      // Check if primary recommendation exists
      const level = edu.educationLevel;
      const obj = prof?.value || '';
      let primaryType = 'career_recommendation';
      if (level === 'Class11') {
        primaryType = 'stream_recommendation';
      } else if (level === 'Class12') {
        primaryType = 'degree_recommendation';
      } else if (obj === 'find_internship' || obj === 'find_job') {
        primaryType = 'skill_gap_analysis';
      }

      const primaryRec = await getAIRecommendationByTypeApi(primaryType);
      if (!primaryRec.data) {
        setRecommendationComplete(false);
        setLoading(false);
        return;
      }

      const rec = await getAIRecommendationByTypeApi('career_roadmap');
      if (rec.data) {
        setData(rec.data.result);
      }
    } catch {
      setErrorMsg('Failed to check roadmap status.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerate = async (force: boolean = false) => {
    setGenerating(true);
    setErrorMsg('');
    try {
      const res = force 
        ? await regenerateAIRecommendationApi('career_roadmap')
        : await generateAIRecommendationApi('career_roadmap');
      setData(res.data.result);
      toast.success('Career Roadmap compiled successfully!');
    } catch (err: any) {
      const msg = err?.response?.data?.message || "We couldn't generate your roadmap right now. Please try again.";
      setErrorMsg(msg);
      toast.error('AI generation failed.');
    }
    setGenerating(false);
  };

  if (loading) {
    return (
      <AppLayout>
        <PageHeader title="Career Roadmap" description="Loading roadmap steps..." />
        <div style={{ padding: '20px' }}>
          <div style={{ height: '200px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
        </div>
      </AppLayout>
    );
  }

  if (!profileComplete) {
    return (
      <AppLayout>
        <PageHeader title="My Career Roadmap" description="Structured milestones suggestions for your target career goals." />
        <EmptyState 
          title="Complete your profile first" 
          description="Complete your student profile details and educational parameters to unlock your customized roadmap."
          action={<Button onClick={() => navigate('/profile')}>Complete Profile</Button>}
          icon={<FileText />}
        />
      </AppLayout>
    );
  }

  if (!assessmentComplete) {
    return (
      <AppLayout>
        <PageHeader title="My Career Roadmap" description="Structured milestones suggestions for your target career goals." />
        <EmptyState 
          title="Complete your assessment first" 
          description="You must complete the career diagnostic assessment test to receive your milestone roadmap guidance."
          action={<Button onClick={() => navigate('/assessment')}>Take Assessment</Button>}
          icon={<Award />}
        />
      </AppLayout>
    );
  }

  if (!recommendationComplete) {
    return (
      <AppLayout>
        <PageHeader title="My Career Roadmap" description="Structured milestones suggestions for your target career goals." />
        <EmptyState 
          title="Generate your career recommendation first" 
          description="You must generate your primary career insight recommendations before compiling your target roadmaps."
          action={<Button onClick={() => navigate('/recommendations')}>Generate Recommendations</Button>}
          icon={<Sparkles />}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Toaster position="top-right" theme="dark" />
      <PageHeader 
        title="My Career Roadmap" 
        description="Structured milestones suggestions for your target career goals." 
      />

      {data ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* AI Disclaimer */}
          <div style={{ padding: '16px', background: 'rgba(123,44,191,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(123,44,191,0.2)', display: 'flex', gap: '12px' }}>
            <Sparkles size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <div>
              <h5 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>AI Disclaimer</h5>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                AI-generated roadmap: This plan is intended to support your career and learning decisions and should be adapted based on your progress, preferences, and guidance from qualified professionals.
              </p>
            </div>
          </div>

          <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Target Goal: {data.goal}</h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.stages?.map((stage: any, idx: number) => (
              <Card key={idx} style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Stage {idx + 1}: {stage.title}</span>
                  <Badge color="purple">{stage.duration}</Badge>
                </div>
                <h5 style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px' }}>Objectives:</h5>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
                  {stage.objectives?.map((obj: string, oIdx: number) => <li key={oIdx}>{obj}</li>)}
                </ul>
                <h5 style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px' }}>Focus Skills:</h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {stage.skills?.map((s: string, sIdx: number) => <Badge key={sIdx} color="blue">{s}</Badge>)}
                </div>
              </Card>
            ))}
          </div>

          {generating ? (
            <Button disabled style={{ width: '100%', padding: '14px' }}>Re-compiling roadmap...</Button>
          ) : (
            <Button variant="secondary" onClick={() => handleGenerate(true)} style={{ width: '100%', padding: '14px' }}>
              Regenerate Roadmap
            </Button>
          )}
        </div>
      ) : (
        errorMsg.includes('Gemini AI is not connected') ? (
          <EmptyState 
            title="Gemini AI is not connected" 
            description="Add your Google AI Studio API key in Settings to use personalized AI recommendations and roadmaps."
            action={
              <Button onClick={() => navigate('/settings')}>Configure Gemini</Button>
            }
            icon={<Key />}
          />
        ) : (
          <EmptyState 
            title="You don't have a roadmap yet" 
            description={errorMsg || "Build your milestone path. Click generate to construct roadmap stages."}
            action={
              generating ? (
                <Button disabled>Generating Roadmap...</Button>
              ) : (
                <Button onClick={() => handleGenerate(false)}>Generate Roadmap</Button>
              )
            }
            icon={<Map />}
          />
        )
      )}
    </AppLayout>
  );
};

export const Learning: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [data, setData] = useState<any>(null);

  // Dependency states
  const [profileComplete, setProfileComplete] = useState(true);
  const [assessmentComplete, setAssessmentComplete] = useState(true);
  const [recommendationComplete, setRecommendationComplete] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const loadData = async () => {
    try {
      const sumRes = await getDashboardSummaryApi();
      const edu = sumRes.data?.education;
      const prof = sumRes.data?.careerObjective;
      const comp = sumRes.data?.profileCompletion?.completionPercentage || 0;
      const assessStatus = sumRes.data?.assessment?.status || 'not_started';

      if (!edu || comp < 100) {
        setProfileComplete(false);
        setLoading(false);
        return;
      }

      if (assessStatus !== 'completed' && edu.educationLevel !== 'Class10') {
        setAssessmentComplete(false);
        setLoading(false);
        return;
      }

      // Check if primary recommendation exists
      const level = edu.educationLevel;
      const obj = prof?.value || '';
      let primaryType = 'career_recommendation';
      if (level === 'Class11') {
        primaryType = 'stream_recommendation';
      } else if (level === 'Class12') {
        primaryType = 'degree_recommendation';
      } else if (obj === 'find_internship' || obj === 'find_job') {
        primaryType = 'skill_gap_analysis';
      }

      const primaryRec = await getAIRecommendationByTypeApi(primaryType);
      if (!primaryRec.data) {
        setRecommendationComplete(false);
        setLoading(false);
        return;
      }

      const rec = await getAIRecommendationByTypeApi('learning_roadmap');
      if (rec.data) {
        setData(rec.data.result);
      }
    } catch {
      setErrorMsg('Failed to check learning roadmap status.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerate = async (force: boolean = false) => {
    setGenerating(true);
    setErrorMsg('');
    try {
      const res = force 
        ? await regenerateAIRecommendationApi('learning_roadmap')
        : await generateAIRecommendationApi('learning_roadmap');
      setData(res.data.result);
      toast.success('Learning Plan compiled successfully!');
    } catch (err: any) {
      const msg = err?.response?.data?.message || "We couldn't generate your learning plan right now. Please try again.";
      setErrorMsg(msg);
      toast.error('AI generation failed.');
    }
    setGenerating(false);
  };

  if (loading) {
    return (
      <AppLayout>
        <PageHeader title="Learning Plan" description="Loading weekly pathway..." />
        <div style={{ padding: '20px' }}>
          <div style={{ height: '200px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
        </div>
      </AppLayout>
    );
  }

  if (!profileComplete) {
    return (
      <AppLayout>
        <PageHeader title="Weekly Learning Plan" description="AI-generated topics and open-source learning pathways." />
        <EmptyState 
          title="Complete your profile first" 
          description="Complete your student profile details and educational parameters to unlock your customized learning plan."
          action={<Button onClick={() => navigate('/profile')}>Complete Profile</Button>}
          icon={<FileText />}
        />
      </AppLayout>
    );
  }

  if (!assessmentComplete) {
    return (
      <AppLayout>
        <PageHeader title="Weekly Learning Plan" description="AI-generated topics and open-source learning pathways." />
        <EmptyState 
          title="Complete your assessment first" 
          description="You must complete the career diagnostic assessment test to receive your customized learning plan."
          action={<Button onClick={() => navigate('/assessment')}>Take Assessment</Button>}
          icon={<Award />}
        />
      </AppLayout>
    );
  }

  if (!recommendationComplete) {
    return (
      <AppLayout>
        <PageHeader title="Weekly Learning Plan" description="AI-generated topics and open-source learning pathways." />
        <EmptyState 
          title="Generate your career recommendation first" 
          description="You must generate your primary career insight recommendations before compiling your target learning plans."
          action={<Button onClick={() => navigate('/recommendations')}>Generate Recommendations</Button>}
          icon={<Sparkles />}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Toaster position="top-right" theme="dark" />
      <PageHeader 
        title="Weekly Learning Plan" 
        description="AI-generated topics and open-source learning pathways." 
      />

      {data ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* AI Disclaimer */}
          <div style={{ padding: '16px', background: 'rgba(123,44,191,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(123,44,191,0.2)', display: 'flex', gap: '12px' }}>
            <Sparkles size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <div>
              <h5 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>AI Disclaimer</h5>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                AI-generated roadmap: This plan is intended to support your career and learning decisions and should be adapted based on your progress, preferences, and guidance from qualified professionals.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.learningGoals?.map((goal: any, idx: number) => (
              <Card key={idx} style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{goal.skill}</span>
                  <Badge color={goal.priority === 'high' ? 'purple' : 'blue'}>
                    {goal.priority.toUpperCase()} PRIORITY
                  </Badge>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Estimated Duration: <strong>{goal.estimatedDuration}</strong>
                </div>
                <h5 style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px' }}>Topics to Study:</h5>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
                  {goal.topics?.map((topic: string, tIdx: number) => <li key={tIdx}>{topic}</li>)}
                </ul>
                <h5 style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px' }}>Suggested Learning Resources:</h5>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {goal.recommendedResources?.map((res: string, rIdx: number) => <li key={rIdx}>{res}</li>)}
                </ul>
              </Card>
            ))}
          </div>

          {generating ? (
            <Button disabled style={{ width: '100%', padding: '14px' }}>Re-compiling learning plan...</Button>
          ) : (
            <Button variant="secondary" onClick={() => handleGenerate(true)} style={{ width: '100%', padding: '14px' }}>
              Regenerate Plan
            </Button>
          )}
        </div>
      ) : (
        errorMsg.includes('Gemini AI is not connected') ? (
          <EmptyState 
            title="Gemini AI is not connected" 
            description="Add your Google AI Studio API key in Settings to use personalized AI recommendations and roadmaps."
            action={
              <Button onClick={() => navigate('/settings')}>Configure Gemini</Button>
            }
            icon={<Key />}
          />
        ) : (
          <EmptyState 
            title="You don't have a learning plan configured yet" 
            description={errorMsg || "Compile your study checklists. Click generate to construct learning tracks."}
            action={
              generating ? (
                <Button disabled>Generating Learning Plan...</Button>
              ) : (
                <Button onClick={() => handleGenerate(false)}>Generate Learning Plan</Button>
              )
            }
            icon={<Calendar />}
          />
        )
      )}
    </AppLayout>
  );
};

// =========================================================================
// @react-pdf/renderer Styles & PDF Document
// =========================================================================
const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333333',
    lineHeight: 1.5,
  },
  headerModern: {
    borderBottomWidth: 2,
    borderBottomColor: '#7b2cbf',
    paddingBottom: 15,
    marginBottom: 15,
    textAlign: 'center',
  },
  headerMinimal: {
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 10,
    marginBottom: 15,
    textAlign: 'left',
  },
  headerProfessional: {
    borderBottomWidth: 3,
    borderBottomColor: '#1e3a8a',
    paddingBottom: 15,
    marginBottom: 15,
    textAlign: 'left',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  titleModern: {
    color: '#7b2cbf',
  },
  titleProfessional: {
    color: '#1e3a8a',
  },
  contactRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    fontSize: 9,
    color: '#666666',
  },
  contactRowLeft: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: 10,
    fontSize: 9,
    color: '#666666',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitleModern: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7b2cbf',
    borderBottomWidth: 1,
    borderBottomColor: '#e9d5ff',
    paddingBottom: 3,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sectionTitleMinimal: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333333',
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 3,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sectionTitleProfessional: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e3a8a',
    borderBottomWidth: 1,
    borderBottomColor: '#bfdbfe',
    paddingBottom: 3,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  summaryText: {
    fontSize: 9.5,
    color: '#444444',
  },
  itemRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  itemTitle: {
    fontWeight: 'bold',
    fontSize: 10,
  },
  itemSubtitle: {
    color: '#555555',
    fontSize: 9.5,
  },
  itemDuration: {
    color: '#666666',
    fontSize: 9,
  },
  itemDesc: {
    fontSize: 9,
    color: '#555555',
    marginTop: 2,
    marginBottom: 5,
  },
  skillsContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 3,
  },
  skillBadge: {
    padding: '3 6',
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    fontSize: 8.5,
    color: '#4b5563',
  },
  bulletList: {
    marginLeft: 10,
    marginTop: 3,
  },
  bulletItem: {
    fontSize: 9,
    color: '#444444',
    marginBottom: 2,
  }
});

const ResumePDFDocument: React.FC<{ data: any }> = ({ data }) => {
  const t = data.templateId || 'modern';
  
  let headerStyle: any = pdfStyles.headerModern;
  let nameStyle: any = [pdfStyles.name, pdfStyles.titleModern];
  let contactStyle: any = pdfStyles.contactRow;
  let sectionTitleStyle: any = pdfStyles.sectionTitleModern;

  if (t === 'minimal') {
    headerStyle = pdfStyles.headerMinimal;
    nameStyle = [pdfStyles.name];
    contactStyle = pdfStyles.contactRowLeft;
    sectionTitleStyle = pdfStyles.sectionTitleMinimal;
  } else if (t === 'professional') {
    headerStyle = pdfStyles.headerProfessional;
    nameStyle = [pdfStyles.name, pdfStyles.titleProfessional];
    contactStyle = pdfStyles.contactRowLeft;
    sectionTitleStyle = pdfStyles.sectionTitleProfessional;
  }

  const formatSecDate = (dStr: any) => {
    if (!dStr) return '';
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={headerStyle}>
          <Text style={nameStyle}>{data.personalInfo?.fullName || 'Your Name'}</Text>
          <View style={contactStyle}>
            {data.personalInfo?.email && <Text>Email: {data.personalInfo.email}</Text>}
            {data.personalInfo?.phone && <Text>Phone: {data.personalInfo.phone}</Text>}
            {data.personalInfo?.location && <Text>Location: {data.personalInfo.location}</Text>}
            {data.personalInfo?.linkedin && <Text>LinkedIn: {data.personalInfo.linkedin}</Text>}
            {data.personalInfo?.github && <Text>GitHub: {data.personalInfo.github}</Text>}
          </View>
        </View>

        {/* Summary */}
        {data.summary && (
          <View style={pdfStyles.section}>
            <Text style={sectionTitleStyle}>Professional Summary</Text>
            <Text style={pdfStyles.summaryText}>{data.summary}</Text>
          </View>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <View style={pdfStyles.section}>
            <Text style={sectionTitleStyle}>Education</Text>
            {data.education.map((edu: any, idx: number) => (
              <View key={idx} style={{ marginBottom: 6 }}>
                <View style={pdfStyles.itemRow}>
                  <Text style={pdfStyles.itemTitle}>{edu.institution}</Text>
                  <Text style={pdfStyles.itemDuration}>
                    {edu.startDate ? formatSecDate(edu.startDate) : ''} - {edu.endDate ? formatSecDate(edu.endDate) : 'Present'}
                  </Text>
                </View>
                <View style={pdfStyles.itemRow}>
                  <Text style={pdfStyles.itemSubtitle}>{edu.degree} {edu.field ? `in ${edu.field}` : ''}</Text>
                  {edu.grade && <Text style={pdfStyles.itemSubtitle}>Grade: {edu.grade}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <View style={pdfStyles.section}>
            <Text style={sectionTitleStyle}>Professional Experience</Text>
            {data.experience.map((exp: any, idx: number) => (
              <View key={idx} style={{ marginBottom: 6 }}>
                <View style={pdfStyles.itemRow}>
                  <Text style={pdfStyles.itemTitle}>{exp.company}</Text>
                  <Text style={pdfStyles.itemDuration}>
                    {exp.startDate ? formatSecDate(exp.startDate) : ''} - {exp.endDate ? formatSecDate(exp.endDate) : 'Present'}
                  </Text>
                </View>
                <Text style={pdfStyles.itemSubtitle}>{exp.role}</Text>
                {exp.description && <Text style={pdfStyles.itemDesc}>{exp.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <View style={pdfStyles.section}>
            <Text style={sectionTitleStyle}>Academic & Personal Projects</Text>
            {data.projects.map((proj: any, idx: number) => (
              <View key={idx} style={{ marginBottom: 6 }}>
                <View style={pdfStyles.itemRow}>
                  <Text style={pdfStyles.itemTitle}>{proj.title}</Text>
                  {proj.link && <Text style={pdfStyles.itemDuration}>{proj.link}</Text>}
                </View>
                {proj.description && <Text style={pdfStyles.itemDesc}>{proj.description}</Text>}
                {proj.technologies && proj.technologies.length > 0 && (
                  <Text style={[pdfStyles.itemSubtitle, { fontSize: 8.5 }]}>
                    Technologies: {proj.technologies.join(', ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <View style={pdfStyles.section}>
            <Text style={sectionTitleStyle}>Skills</Text>
            <View style={pdfStyles.skillsContainer}>
              {data.skills.map((skill: string, idx: number) => (
                <View key={idx} style={pdfStyles.skillBadge}>
                  <Text>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <View style={pdfStyles.section}>
            <Text style={sectionTitleStyle}>Certifications</Text>
            {data.certifications.map((cert: any, idx: number) => (
              <View key={idx} style={{ marginBottom: 4 }}>
                <View style={pdfStyles.itemRow}>
                  <Text style={pdfStyles.itemTitle}>{cert.name}</Text>
                  {cert.date && <Text style={pdfStyles.itemDuration}>{formatSecDate(cert.date)}</Text>}
                </View>
                {cert.issuer && <Text style={pdfStyles.itemSubtitle}>Issuer: {cert.issuer}</Text>}
                {cert.url && <Text style={pdfStyles.itemDesc}>{cert.url}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Achievements */}
        {data.achievements && data.achievements.length > 0 && (
          <View style={pdfStyles.section}>
            <Text style={sectionTitleStyle}>Achievements</Text>
            <View style={pdfStyles.bulletList}>
              {data.achievements.map((ach: string, idx: number) => (
                <Text key={idx} style={pdfStyles.bulletItem}>• {ach}</Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

export const Resume: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);
  
  // View states
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  const [resumes, setResumes] = useState<any[]>([]);
  const [activeResume, setActiveResume] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'summary' | 'education' | 'experience' | 'projects' | 'skills' | 'certifications' | 'achievements'>('personal');
  
  // Dashboard states
  const [dashboardStep, setDashboardStep] = useState<string>('Create your resume');

  // Deletion state
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await listResumesApi();
      setResumes(res.data);
      if (res.data.length > 0) {
        setDashboardStep('Continue editing your resume');
      } else {
        setDashboardStep('Create your resume');
      }
    } catch {
      toast.error('Failed to load resumes list.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleCreateBlank = async () => {
    try {
      const payload = {
        title: 'New Blank Resume',
        templateId: 'modern',
        personalInfo: {
          fullName: 'Display Name',
          email: 'sample@email.com',
          phone: '',
          location: '',
          linkedin: '',
          github: ''
        },
        summary: '',
        education: [],
        experience: [],
        skills: [],
        projects: [],
        certifications: [],
        achievements: []
      };

      const res = await createResumeApi(payload);
      toast.success('Blank resume created!');
      setActiveResume(res.data);
      setView('editor');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create resume.');
    }
  };

  const handleCreateFromProfile = async () => {
    try {
      const res = await createResumeApi({ importFromProfile: true, title: 'Resume from Profile' });
      toast.success('Resume prefilled from profile snapshot successfully!');
      setActiveResume(res.data);
      setView('editor');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Make sure profile has required details.');
    }
  };

  const handleSave = async () => {
    if (!activeResume) return;
    setSaving(true);
    try {
      const res = await updateResumeApi(activeResume._id, activeResume);
      toast.success('Resume saved successfully!');
      setActiveResume(res.data);
      fetchResumes();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save changes.');
    }
    setSaving(false);
  };

  const handleDeleteTrigger = (id: string) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteResumeApi(deleteId);
      toast.success('Resume deleted successfully.');
      setResumes(prev => prev.filter(r => r._id !== deleteId));
      if (activeResume?._id === deleteId) {
        setActiveResume(null);
        setView('dashboard');
      }
    } catch {
      toast.error('Failed to delete resume.');
    }
    setShowConfirm(false);
    setDeleteId(null);
  };

  const handleExport = async (resume: any) => {
    setExportingId(resume._id);
    try {
      // ownership check
      await exportResumeApi(resume._id);
      
      const doc = <ResumePDFDocument data={resume} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resume.title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('PDF Resume exported successfully!');
    } catch (err: any) {
      toast.error('Failed to generate PDF. Make sure all values are valid.');
    }
    setExportingId(null);
  };

  // Repeater handlers
  const handleAddEducation = () => {
    const list = [...(activeResume.education || [])];
    list.push({ institution: 'New Institution', degree: 'Degree Name', field: '', startDate: '', endDate: '', grade: '' });
    setActiveResume({ ...activeResume, education: list });
  };

  const handleRemoveEducation = (idx: number) => {
    const list = [...(activeResume.education || [])];
    list.splice(idx, 1);
    setActiveResume({ ...activeResume, education: list });
  };

  const handleAddExperience = () => {
    const list = [...(activeResume.experience || [])];
    list.push({ company: 'New Company', role: 'Role Name', startDate: '', endDate: '', description: '' });
    setActiveResume({ ...activeResume, experience: list });
  };

  const handleRemoveExperience = (idx: number) => {
    const list = [...(activeResume.experience || [])];
    list.splice(idx, 1);
    setActiveResume({ ...activeResume, experience: list });
  };

  const handleAddProject = () => {
    const list = [...(activeResume.projects || [])];
    list.push({ title: 'New Project', description: '', technologies: [], link: '' });
    setActiveResume({ ...activeResume, projects: list });
  };

  const handleRemoveProject = (idx: number) => {
    const list = [...(activeResume.projects || [])];
    list.splice(idx, 1);
    setActiveResume({ ...activeResume, projects: list });
  };

  const handleAddCertification = () => {
    const list = [...(activeResume.certifications || [])];
    list.push({ name: 'New Certification', issuer: '', date: '', url: '' });
    setActiveResume({ ...activeResume, certifications: list });
  };

  const handleRemoveCertification = (idx: number) => {
    const list = [...(activeResume.certifications || [])];
    list.splice(idx, 1);
    setActiveResume({ ...activeResume, certifications: list });
  };

  const handleAddAchievement = () => {
    const list = [...(activeResume.achievements || [])];
    list.push('');
    setActiveResume({ ...activeResume, achievements: list });
  };

  const handleRemoveAchievement = (idx: number) => {
    const list = [...(activeResume.achievements || [])];
    list.splice(idx, 1);
    setActiveResume({ ...activeResume, achievements: list });
  };

  if (loading && resumes.length === 0) {
    return (
      <AppLayout>
        <PageHeader title="Resume Optimizer & Builder" description="Loading saved templates..." />
        <div style={{ padding: '20px' }}>
          <div style={{ height: '200px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Toaster position="top-right" theme="dark" />
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Resume"
        message="Are you sure you want to permanently delete this resume template? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
      />

      <PageHeader 
        title="Resume Optimizer & Builder" 
        description={`Current state: ${dashboardStep}`}
      />

      {view === 'dashboard' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Actions */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button onClick={handleCreateBlank}>Start Blank</Button>
            <Button variant="secondary" onClick={handleCreateFromProfile}>Create from Profile</Button>
          </div>

          {/* List of resumes */}
          {resumes.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Saved Resumes ({resumes.length})</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {resumes.map((r) => (
                  <Card key={r._id} style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '180px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{r.title}</span>
                        <Badge color="purple">{r.templateId.toUpperCase()}</Badge>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        Last Updated: {new Date(r.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto' }}>
                      <Button variant="secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => { setActiveResume(r); setView('editor'); }}>
                        <Edit2 size={13} style={{ marginRight: '4px' }} /> Edit
                      </Button>
                      <Button variant="secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleExport(r)} disabled={exportingId === r._id}>
                        {exportingId === r._id ? 'Exporting...' : <><Download size={13} style={{ marginRight: '4px' }} /> Export</>}
                      </Button>
                      <Button variant="secondary" style={{ padding: '6px 12px', fontSize: '12px', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }} onClick={() => handleDeleteTrigger(r._id)}>
                        <Trash2 size={13} style={{ marginRight: '4px' }} /> Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title="No resumes saved"
              description="Get started by importing your diagnostic assessment profile data, or start editing a blank layout."
              icon={<FileText />}
            />
          )}
        </div>
      ) : (
        /* Resume Editor Tabbed Layout */
        <div className="resume-container">
          {/* Editor Header Bar */}
          <div className="resume-toolbar">
            <Button variant="secondary" style={{ height: '48px', display: 'flex', alignItems: 'center' }} onClick={() => setView('dashboard')}>
              <ArrowLeft size={16} style={{ marginRight: '8px' }} /> Back
            </Button>
            
            <input
              id="res-title"
              className="input resume-toolbar-input"
              type="text"
              defaultValue={activeResume.title}
              onChange={(e) => setActiveResume({ ...activeResume, title: e.target.value })}
              placeholder="Resume Title"
            />
            
            <select
              id="res-tmpl"
              className="select resume-toolbar-select"
              defaultValue={activeResume.templateId}
              onChange={(e) => setActiveResume({ ...activeResume, templateId: e.target.value })}
            >
              <option value="modern">Modern Template</option>
              <option value="minimal">Minimal Template</option>
              <option value="professional">Professional Template</option>
            </select>

            <Button style={{ height: '48px' }} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Resume'}
            </Button>
            
            <Button variant="secondary" style={{ height: '48px' }} onClick={() => handleExport(activeResume)} disabled={exportingId === activeResume._id}>
              {exportingId === activeResume._id ? 'Exporting...' : 'Export PDF'}
            </Button>
          </div>

          {/* Split Pane: Editor Forms | Real-time Preview */}
          <div className="resume-split-pane">
            {/* Left Column: Form Editor Tabs */}
            <Card style={{ padding: '24px' }}>
              {/* Tab Navigation */}
              <div className="resume-tabs">
                {[
                  { key: 'personal', label: 'Contact' },
                  { key: 'summary', label: 'Summary' },
                  { key: 'education', label: 'Education' },
                  { key: 'experience', label: 'Experience' },
                  { key: 'projects', label: 'Projects' },
                  { key: 'skills', label: 'Skills' },
                  { key: 'certifications', label: 'Certs' },
                  { key: 'achievements', label: 'Achievements' }
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTab(t.key as any)}
                    className={`resume-tab-btn ${activeTab === t.key ? 'active' : ''}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab Content Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeTab === 'personal' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Input
                      id="p-name"
                      label="Full Name"
                      defaultValue={activeResume.personalInfo?.fullName || ''}
                      onChange={(e) => setActiveResume({
                        ...activeResume,
                        personalInfo: { ...(activeResume.personalInfo || {}), fullName: e.target.value }
                      })}
                    />
                    <Input
                      id="p-email"
                      label="Email Address"
                      defaultValue={activeResume.personalInfo?.email || ''}
                      onChange={(e) => setActiveResume({
                        ...activeResume,
                        personalInfo: { ...(activeResume.personalInfo || {}), email: e.target.value }
                      })}
                    />
                    <Input
                      id="p-phone"
                      label="Phone Number"
                      defaultValue={activeResume.personalInfo?.phone || ''}
                      onChange={(e) => setActiveResume({
                        ...activeResume,
                        personalInfo: { ...(activeResume.personalInfo || {}), phone: e.target.value }
                      })}
                    />
                    <Input
                      id="p-loc"
                      label="Location (City, State)"
                      defaultValue={activeResume.personalInfo?.location || ''}
                      onChange={(e) => setActiveResume({
                        ...activeResume,
                        personalInfo: { ...(activeResume.personalInfo || {}), location: e.target.value }
                      })}
                    />
                    <Input
                      id="p-link"
                      label="LinkedIn Link"
                      defaultValue={activeResume.personalInfo?.linkedin || ''}
                      onChange={(e) => setActiveResume({
                        ...activeResume,
                        personalInfo: { ...(activeResume.personalInfo || {}), linkedin: e.target.value }
                      })}
                    />
                    <Input
                      id="p-git"
                      label="GitHub Link"
                      defaultValue={activeResume.personalInfo?.github || ''}
                      onChange={(e) => setActiveResume({
                        ...activeResume,
                        personalInfo: { ...(activeResume.personalInfo || {}), github: e.target.value }
                      })}
                    />
                  </div>
                )}

                {activeTab === 'summary' && (
                  <Textarea
                    id="p-sum"
                    label="Professional Summary"
                    rows={6}
                    defaultValue={activeResume.summary || ''}
                    onChange={(e) => setActiveResume({ ...activeResume, summary: e.target.value })}
                  />
                )}

                {activeTab === 'education' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {activeResume.education?.map((edu: any, idx: number) => (
                      <div key={idx} style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', position: 'relative' }}>
                        <button
                          onClick={() => handleRemoveEducation(idx)}
                          style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                          <Input
                            id={`edu-inst-${idx}`}
                            label="School / Institution"
                            defaultValue={edu.institution}
                            onChange={(e) => {
                              const list = [...activeResume.education];
                              list[idx].institution = e.target.value;
                              setActiveResume({ ...activeResume, education: list });
                            }}
                          />
                          <Input
                            id={`edu-deg-${idx}`}
                            label="Degree Name"
                            defaultValue={edu.degree}
                            onChange={(e) => {
                              const list = [...activeResume.education];
                              list[idx].degree = e.target.value;
                              setActiveResume({ ...activeResume, education: list });
                            }}
                          />
                          <Input
                            id={`edu-fld-${idx}`}
                            label="Field of Study"
                            defaultValue={edu.field}
                            onChange={(e) => {
                              const list = [...activeResume.education];
                              list[idx].field = e.target.value;
                              setActiveResume({ ...activeResume, education: list });
                            }}
                          />
                          <Input
                            id={`edu-grd-${idx}`}
                            label="Grade / GPA"
                            defaultValue={edu.grade}
                            onChange={(e) => {
                              const list = [...activeResume.education];
                              list[idx].grade = e.target.value;
                              setActiveResume({ ...activeResume, education: list });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    <Button variant="secondary" onClick={handleAddEducation}>
                      <Plus size={14} style={{ marginRight: '4px' }} /> Add Education
                    </Button>
                  </div>
                )}

                {activeTab === 'experience' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {activeResume.experience?.map((exp: any, idx: number) => (
                      <div key={idx} style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', position: 'relative' }}>
                        <button
                          onClick={() => handleRemoveExperience(idx)}
                          style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                          <Input
                            id={`exp-comp-${idx}`}
                            label="Company Name"
                            defaultValue={exp.company}
                            onChange={(e) => {
                              const list = [...activeResume.experience];
                              list[idx].company = e.target.value;
                              setActiveResume({ ...activeResume, experience: list });
                            }}
                          />
                          <Input
                            id={`exp-role-${idx}`}
                            label="Job / Role Name"
                            defaultValue={exp.role}
                            onChange={(e) => {
                              const list = [...activeResume.experience];
                              list[idx].role = e.target.value;
                              setActiveResume({ ...activeResume, experience: list });
                            }}
                          />
                          <Textarea
                            id={`exp-desc-${idx}`}
                            label="Job Description"
                            rows={3}
                            defaultValue={exp.description}
                            onChange={(e) => {
                              const list = [...activeResume.experience];
                              list[idx].description = e.target.value;
                              setActiveResume({ ...activeResume, experience: list });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    <Button variant="secondary" onClick={handleAddExperience}>
                      <Plus size={14} style={{ marginRight: '4px' }} /> Add Work Experience
                    </Button>
                  </div>
                )}

                {activeTab === 'projects' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {activeResume.projects?.map((proj: any, idx: number) => (
                      <div key={idx} style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', position: 'relative' }}>
                        <button
                          onClick={() => handleRemoveProject(idx)}
                          style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                          <Input
                            id={`proj-ttl-${idx}`}
                            label="Project Title"
                            defaultValue={proj.title}
                            onChange={(e) => {
                              const list = [...activeResume.projects];
                              list[idx].title = e.target.value;
                              setActiveResume({ ...activeResume, projects: list });
                            }}
                          />
                          <Input
                            id={`proj-lnk-${idx}`}
                            label="Project Link / Code URL"
                            defaultValue={proj.link}
                            onChange={(e) => {
                              const list = [...activeResume.projects];
                              list[idx].link = e.target.value;
                              setActiveResume({ ...activeResume, projects: list });
                            }}
                          />
                          <Textarea
                            id={`proj-desc-${idx}`}
                            label="Project Description"
                            rows={3}
                            defaultValue={proj.description}
                            onChange={(e) => {
                              const list = [...activeResume.projects];
                              list[idx].description = e.target.value;
                              setActiveResume({ ...activeResume, projects: list });
                            }}
                          />
                          <Input
                            id={`proj-tech-${idx}`}
                            label="Technologies used (comma separated)"
                            defaultValue={proj.technologies?.join(', ') || ''}
                            onChange={(e) => {
                              const list = [...activeResume.projects];
                              list[idx].technologies = e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean);
                              setActiveResume({ ...activeResume, projects: list });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    <Button variant="secondary" onClick={handleAddProject}>
                      <Plus size={14} style={{ marginRight: '4px' }} /> Add Project
                    </Button>
                  </div>
                )}

                {activeTab === 'skills' && (
                  <Textarea
                    id="p-skills"
                    label="Core Skills (comma separated tags list)"
                    rows={4}
                    defaultValue={activeResume.skills?.join(', ') || ''}
                    onChange={(e) => setActiveResume({
                      ...activeResume,
                      skills: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)
                    })}
                  />
                )}

                {activeTab === 'certifications' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {activeResume.certifications?.map((cert: any, idx: number) => (
                      <div key={idx} style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', position: 'relative' }}>
                        <button
                          onClick={() => handleRemoveCertification(idx)}
                          style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                          <Input
                            id={`cert-nm-${idx}`}
                            label="Certification Name"
                            defaultValue={cert.name}
                            onChange={(e) => {
                              const list = [...activeResume.certifications];
                              list[idx].name = e.target.value;
                              setActiveResume({ ...activeResume, certifications: list });
                            }}
                          />
                          <Input
                            id={`cert-iss-${idx}`}
                            label="Issuer Body"
                            defaultValue={cert.issuer}
                            onChange={(e) => {
                              const list = [...activeResume.certifications];
                              list[idx].issuer = e.target.value;
                              setActiveResume({ ...activeResume, certifications: list });
                            }}
                          />
                          <Input
                            id={`cert-url-${idx}`}
                            label="Credential link URL"
                            defaultValue={cert.url}
                            onChange={(e) => {
                              const list = [...activeResume.certifications];
                              list[idx].url = e.target.value;
                              setActiveResume({ ...activeResume, certifications: list });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    <Button variant="secondary" onClick={handleAddCertification}>
                      <Plus size={14} style={{ marginRight: '4px' }} /> Add Certification
                    </Button>
                  </div>
                )}

                {activeTab === 'achievements' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {activeResume.achievements?.map((ach: string, idx: number) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Input
                          id={`ach-item-${idx}`}
                          defaultValue={ach}
                          onChange={(e) => {
                            const list = [...activeResume.achievements];
                            list[idx] = e.target.value;
                            setActiveResume({ ...activeResume, achievements: list });
                          }}
                        />
                        <button
                          onClick={() => handleRemoveAchievement(idx)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <Button variant="secondary" onClick={handleAddAchievement}>
                      <Plus size={14} style={{ marginRight: '4px' }} /> Add Achievement
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Right Column: Real-time Template Preview */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Live Resume Preview</div>
              
              {/* HTML Mock rendering matching chosen template style */}
              <div style={{
                background: '#ffffff',
                color: '#333333',
                minHeight: '650px',
                borderRadius: '8px',
                padding: '30px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                fontSize: '12px',
                lineHeight: 1.5,
                border: '1px solid #e5e7eb',
                fontFamily: 'sans-serif'
              }}>
                {/* Header preview style */}
                <div style={{
                  borderBottom: activeResume.templateId === 'modern' ? '2px solid #7b2cbf' : activeResume.templateId === 'professional' ? '3px solid #1e3a8a' : '1px solid #cccccc',
                  paddingBottom: '12px',
                  marginBottom: '15px',
                  textAlign: activeResume.templateId === 'minimal' ? 'left' : 'center'
                }}>
                  <h2 style={{
                    margin: '0 0 6px 0',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: activeResume.templateId === 'modern' ? '#7b2cbf' : activeResume.templateId === 'professional' ? '#1e3a8a' : '#111111'
                  }}>
                    {activeResume.personalInfo?.fullName || 'Your Name'}
                  </h2>
                  <div style={{ display: 'flex', justifyContent: activeResume.templateId === 'minimal' ? 'flex-start' : 'center', flexWrap: 'wrap', gap: '8px', fontSize: '11px', color: '#666666' }}>
                    {activeResume.personalInfo?.email && <span>{activeResume.personalInfo.email}</span>}
                    {activeResume.personalInfo?.phone && <span>• {activeResume.personalInfo.phone}</span>}
                    {activeResume.personalInfo?.location && <span>• {activeResume.personalInfo.location}</span>}
                    {activeResume.personalInfo?.linkedin && <span>• {activeResume.personalInfo.linkedin}</span>}
                    {activeResume.personalInfo?.github && <span>• {activeResume.personalInfo.github}</span>}
                  </div>
                </div>

                {/* Summary Section */}
                {activeResume.summary && (
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{
                      margin: '0 0 6px 0',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      color: activeResume.templateId === 'modern' ? '#7b2cbf' : activeResume.templateId === 'professional' ? '#1e3a8a' : '#333333',
                      borderBottom: '1px solid #eaeaea',
                      paddingBottom: '2px'
                    }}>
                      Summary
                    </h3>
                    <p style={{ margin: 0, fontSize: '11px', color: '#444444' }}>{activeResume.summary}</p>
                  </div>
                )}

                {/* Education Section */}
                {activeResume.education && activeResume.education.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{
                      margin: '0 0 8px 0',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      color: activeResume.templateId === 'modern' ? '#7b2cbf' : activeResume.templateId === 'professional' ? '#1e3a8a' : '#333333',
                      borderBottom: '1px solid #eaeaea',
                      paddingBottom: '2px'
                    }}>
                      Education
                    </h3>
                    {activeResume.education.map((edu: any, idx: number) => (
                      <div key={idx} style={{ marginBottom: '8px', fontSize: '11px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                          <span>{edu.institution}</span>
                          <span style={{ fontWeight: 400, color: '#666666' }}>{edu.startDate ? new Date(edu.startDate).getFullYear() : ''} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555555' }}>
                          <span>{edu.degree} {edu.field ? `in ${edu.field}` : ''}</span>
                          {edu.grade && <span>Grade: {edu.grade}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Experience Section */}
                {activeResume.experience && activeResume.experience.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{
                      margin: '0 0 8px 0',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      color: activeResume.templateId === 'modern' ? '#7b2cbf' : activeResume.templateId === 'professional' ? '#1e3a8a' : '#333333',
                      borderBottom: '1px solid #eaeaea',
                      paddingBottom: '2px'
                    }}>
                      Experience
                    </h3>
                    {activeResume.experience.map((exp: any, idx: number) => (
                      <div key={idx} style={{ marginBottom: '8px', fontSize: '11px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                          <span>{exp.company}</span>
                          <span style={{ fontWeight: 400, color: '#666666' }}>{exp.startDate ? new Date(exp.startDate).getFullYear() : ''} - {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}</span>
                        </div>
                        <div style={{ fontWeight: 500, color: '#555555' }}>{exp.role}</div>
                        {exp.description && <p style={{ margin: '4px 0 0 0', color: '#666666', fontSize: '10.5px' }}>{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Projects Section */}
                {activeResume.projects && activeResume.projects.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{
                      margin: '0 0 8px 0',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      color: activeResume.templateId === 'modern' ? '#7b2cbf' : activeResume.templateId === 'professional' ? '#1e3a8a' : '#333333',
                      borderBottom: '1px solid #eaeaea',
                      paddingBottom: '2px'
                    }}>
                      Projects
                    </h3>
                    {activeResume.projects.map((proj: any, idx: number) => (
                      <div key={idx} style={{ marginBottom: '8px', fontSize: '11px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                          <span>{proj.title}</span>
                          {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" style={{ fontSize: '10px', color: '#7b2cbf', textDecoration: 'none' }}>Link</a>}
                        </div>
                        {proj.description && <p style={{ margin: '4px 0', color: '#666666' }}>{proj.description}</p>}
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div style={{ fontSize: '10px', color: '#555555' }}><strong>Tech:</strong> {proj.technologies.join(', ')}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Skills Section */}
                {activeResume.skills && activeResume.skills.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{
                      margin: '0 0 8px 0',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      color: activeResume.templateId === 'modern' ? '#7b2cbf' : activeResume.templateId === 'professional' ? '#1e3a8a' : '#333333',
                      borderBottom: '1px solid #eaeaea',
                      paddingBottom: '2px'
                    }}>
                      Skills
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {activeResume.skills.map((skill: string, idx: number) => (
                        <span key={idx} style={{ background: '#f3f4f6', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', color: '#4b5563' }}>{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export const Internships: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'explore' | 'bookmarks'>('explore');

  // Eligibility states
  const [eduLevel, setEduLevel] = useState<string>('UG');
  const [viewingContext, setViewingContext] = useState<string>(() => {
    return localStorage.getItem('opportunity_context') || 'UG';
  });
  const [userObjective, setUserObjective] = useState<string>('find_internship');
  const [isObjectiveMismatch, setIsObjectiveMismatch] = useState(false);
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  const [isAssessmentMissing, setIsAssessmentMissing] = useState(false);
  const [isResumeMissing, setIsResumeMissing] = useState(false);

  // Data states
  const [listings, setListings] = useState<any[]>([]);
  const [savedDocs, setSavedDocs] = useState<any[]>([]);
  const [opportunitySource, setOpportunitySource] = useState<'local' | 'internshala'>('local');
  const [providerStatus, setProviderStatus] = useState<'CONNECTED' | 'NOT_CONFIGURED'>('CONNECTED');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Search parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [modeFilter, setModeFilter] = useState('');

  // Link safety dialog
  const [showRedirectDialog, setShowRedirectDialog] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState<{ id: string; url: string } | null>(null);

  // Notes/Status editing states
  const [editingNotes, setEditingNotes] = useState<{ [id: string]: string }>({});

  const checkEligibilityAndLoad = async () => {
    setLoading(true);
    try {
      const sumRes = await getDashboardSummaryApi();
      const edu = sumRes.data?.education;
      const prof = sumRes.data?.careerObjective;
      const comp = sumRes.data?.profileCompletion?.completionPercentage || 0;

      if (!edu) {
        setIsProfileIncomplete(true);
        setLoading(false);
        return;
      }

      const actualLevel = edu.educationLevel;
      setEduLevel(actualLevel);
      // Only default viewingContext to actualLevel if localStorage has no saved preference
      if (!localStorage.getItem('opportunity_context')) {
        setViewingContext(actualLevel);
        localStorage.setItem('opportunity_context', actualLevel);
      }

      if (prof) {
        setUserObjective(prof.value);
      }

      // Calculate state booleans
      const levelBlocked = actualLevel === 'Class11' || actualLevel === 'Class12' || actualLevel === 'Class10';

      const profileIncomplete = comp < 100;
      setIsProfileIncomplete(profileIncomplete);

      const objectiveMismatch = prof?.value !== 'find_internship';
      setIsObjectiveMismatch(objectiveMismatch);

      // Check readiness test completion
      const resultsHistory = await getResultsHistoryApi();
      const hasCompletedReadyTest = resultsHistory.data?.some((r: any) => r.assessmentId?.type === 'internship_readiness');
      setIsAssessmentMissing(!hasCompletedReadyTest);

      // Check resume builder status
      const resumeRes = await listResumesApi();
      const resumeMissing = !resumeRes.data || resumeRes.data.length === 0;
      setIsResumeMissing(resumeMissing);

      // If all checks pass for the actual user, preload listings and bookmarks
      if (!levelBlocked && !profileIncomplete && !objectiveMismatch && hasCompletedReadyTest && !resumeMissing) {
        await refreshOpportunities();
      }
    } catch {
      toast.error('Failed to verify eligibility dependencies.');
    }
    setLoading(false);
  };

  const refreshOpportunities = async (src = opportunitySource) => {
    setFetching(true);
    setErrorMessage('');
    try {
      // Load saved list
      const savedRes = await api.get('/opportunities/saved');
      setSavedDocs(savedRes.data.data);

      // Load platform listings
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (locationQuery) params.location = locationQuery;
      if (modeFilter) params.mode = modeFilter;
      params.source = src;

      const opportunitiesRes = await api.get('/opportunities/internships', { params });
      if (opportunitiesRes.data.providerStatus === 'NOT_CONFIGURED') {
        setProviderStatus('NOT_CONFIGURED');
        setListings([]);
        setErrorMessage(opportunitiesRes.data.message || 'Live Internshala opportunities are not connected yet.');
      } else {
        setProviderStatus('CONNECTED');
        setListings(opportunitiesRes.data.data || []);
      }
    } catch {
      toast.error('Failed to retrieve opportunities.');
    }
    setFetching(false);
  };

  useEffect(() => {
    checkEligibilityAndLoad();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refreshOpportunities();
  };

  const handleSaveToggle = async (oppId: string, savedDocId?: string) => {
    try {
      if (savedDocId) {
        // Unsave
        await api.delete(`/opportunities/saved/${savedDocId}`);
        toast.success('Opportunity removed from saved list.');
      } else {
        // Save
        await api.post('/opportunities/saved', {
          opportunityType: 'internship',
          opportunityId: oppId,
          status: 'saved',
          notes: ''
        });
        toast.success('Opportunity bookmarked!');
      }
      refreshOpportunities();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save opportunity.');
    }
  };

  const handleApplyClick = (oppId: string, url: string) => {
    setRedirectTarget({ id: oppId, url });
    setShowRedirectDialog(true);
  };

  const handleProceedRedirect = async () => {
    if (!redirectTarget) return;
    setSubmitting(redirectTarget.id);
    try {
      // Save status as applied manually on redirect
      await api.post('/opportunities/saved', {
        opportunityType: 'internship',
        opportunityId: redirectTarget.id,
        status: 'applied'
      });
      toast.success('Application status updated to APPLIED.');
      window.open(redirectTarget.url, '_blank');
      refreshOpportunities();
    } catch {
      toast.error('Failed to log application status.');
    }
    setSubmitting(null);
    setShowRedirectDialog(false);
    setRedirectTarget(null);
  };

  const handleUpdateBookmark = async (savedId: string, status: string, notes: string) => {
    try {
      await api.patch(`/opportunities/saved/${savedId}`, { status, notes });
      toast.success('Saved status updated!');
      refreshOpportunities();
    } catch {
      toast.error('Failed to update bookmark.');
    }
  };

  const mapEduLevel: Record<string, string> = {
    Class10: 'Class 10 Student',
    Class11: 'Class 11 Student',
    Class12: 'Class 12 Student',
    Diploma: 'Diploma Student',
    UG: 'Undergraduate (UG)',
    PG: 'Postgraduate (PG)'
  };

  if (loading) {
    return (
      <AppLayout>
        <PageHeader title="Internship Match Center" description="Verifying eligibility checkpoints..." />
        <div style={{ padding: '20px' }}>
          <div style={{ height: '200px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Toaster position="top-right" theme="dark" />
      <PageHeader 
        title="Internship Match Center" 
        description="Browse whitelisted placements matched deterministically against your profile skills." 
      />

      {/* CASE A: Selected context is Class 11 */}
      {viewingContext === 'Class11' && (
        <EmptyState 
          title="Educational Roadmap Focus" 
          description="Internships and job opportunities are designed for students who have reached Diploma/UG/PG stages. At your current stage, focus on exploring career interests, building foundational skills, completing assessments, and following your career roadmap."
          action={
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button onClick={() => navigate('/roadmap')}>View Career Roadmap</Button>
              <Button variant="secondary" onClick={() => navigate('/learning')}>View Learning Roadmap</Button>
              <Button variant="secondary" onClick={() => navigate('/assessment')}>Take Career Assessment</Button>
            </div>
          }
          icon={<Map />}
        />
      )}

      {/* CASE B: Selected context is Class 12 */}
      {viewingContext === 'Class12' && (
        <EmptyState 
          title="Educational Roadmap Focus" 
          description="Prepare for your upcoming academic transition. Explore optimal degree paths, complete career suitability assessments, and map out your educational roadmap."
          action={
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button onClick={() => navigate('/recommendations')}>View Career Recommendations</Button>
              <Button variant="secondary" onClick={() => navigate('/roadmap')}>View Career Roadmap</Button>
              <Button variant="secondary" onClick={() => navigate('/assessment')}>Take Suitability Assessment</Button>
            </div>
          }
          icon={<Map />}
        />
      )}

      {/* CASE C: Selected context is Diploma, UG, or PG */}
      {['Diploma', 'UG', 'PG'].includes(viewingContext) && (
        <>
          {/* Sub-Case C.1: Actual user is blocked by level */}
          {(eduLevel === 'Class11' || eduLevel === 'Class12' || eduLevel === 'Class10') && (
            <EmptyState 
              title="Access Restricted" 
              description={`Your current education profile is ${mapEduLevel[eduLevel] || eduLevel}, so internship access is not available yet.`}
              action={
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Button onClick={() => {
                    setViewingContext(eduLevel);
                    localStorage.setItem('opportunity_context', eduLevel);
                  }}>Return to My Level</Button>
                  <Button variant="secondary" onClick={() => navigate('/roadmap')}>View Career Roadmap</Button>
                </div>
              }
              icon={<Shield />}
            />
          )}

          {/* Sub-Case C.2: Actual user is not blocked by level, but profile is incomplete */}
          {!(eduLevel === 'Class11' || eduLevel === 'Class12' || eduLevel === 'Class10') && isProfileIncomplete && (
            <EmptyState 
              title="Complete your profile first" 
              description="Complete your student profile details and educational parameters to unlock matches."
              action={<Button onClick={() => navigate('/profile')}>Complete Profile</Button>}
              icon={<FileText />}
            />
          )}

          {/* Sub-Case C.3: Actual user profile complete, but objective mismatch */}
          {!(eduLevel === 'Class11' || eduLevel === 'Class12' || eduLevel === 'Class10') && !isProfileIncomplete && isObjectiveMismatch && (
            <EmptyState 
              title="Adjust Career Objective" 
              description={userObjective === 'find_job'
                ? "This page is configured for internship opportunities. Your current career objective is Job Search."
                : "Your current objective is set to exploration. Choose 'Find an Internship' to view whitelisted listings."
              }
              action={
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {userObjective === 'find_job' && <Button onClick={() => navigate('/jobs')}>View Jobs</Button>}
                  <Button variant={userObjective === 'find_job' ? 'secondary' : 'primary'} onClick={() => navigate('/profile')}>
                    Update Profile
                  </Button>
                </div>
              }
              icon={<Shield />}
            />
          )}

          {/* Sub-Case C.4: Profile complete and correct objective, but readiness assessment missing */}
          {!(eduLevel === 'Class11' || eduLevel === 'Class12' || eduLevel === 'Class10') && !isProfileIncomplete && !isObjectiveMismatch && isAssessmentMissing && (
            <EmptyState 
              title="Complete your assessment first" 
              description="You must complete the Internship Readiness Assessment to unlock matching opportunities."
              action={<Button onClick={() => navigate('/assessment')}>Take Assessment</Button>}
              icon={<Award />}
            />
          )}

          {/* Sub-Case C.5: Assessment complete, but resume missing */}
          {!(eduLevel === 'Class11' || eduLevel === 'Class12' || eduLevel === 'Class10') && !isProfileIncomplete && !isObjectiveMismatch && !isAssessmentMissing && isResumeMissing && (
            <EmptyState 
              title="Build your resume first" 
              description="You must construct and save a resume template in the Resume Builder to unlock applications."
              action={<Button onClick={() => navigate('/resume')}>Build Resume</Button>}
              icon={<FileText />}
            />
          )}

          {/* Sub-Case C.6: Eligible (all checks pass) */}
          {!(eduLevel === 'Class11' || eduLevel === 'Class12' || eduLevel === 'Class10') && !isProfileIncomplete && !isObjectiveMismatch && !isAssessmentMissing && !isResumeMissing && (
            <>
              {/* Redirect dialog */}
              <ConfirmDialog
                isOpen={showRedirectDialog}
                onClose={() => setShowRedirectDialog(false)}
                onConfirm={handleProceedRedirect}
                title="Apply Externally"
                message="You are leaving AI Career Mentor to apply on an external website. Once completed, your application status will be manually tracked by you."
                confirmText="Proceed to Website"
                cancelText="Cancel"
              />

              {/* Tab Controls */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '12px', marginBottom: '20px' }}>
                <button
                  onClick={() => setActiveTab('explore')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: activeTab === 'explore' ? 'var(--primary)' : 'transparent',
                    color: activeTab === 'explore' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Explore Internships
                </button>
                <button
                  onClick={() => setActiveTab('bookmarks')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: activeTab === 'bookmarks' ? 'var(--primary)' : 'transparent',
                    color: activeTab === 'bookmarks' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Tracked Applications ({savedDocs.filter(d => d.opportunityType === 'internship').length})
                </button>
              </div>

              {activeTab === 'explore' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* Segmented Source Selector */}
                  <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', width: 'fit-content' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setOpportunitySource('local');
                        refreshOpportunities('local');
                      }}
                      style={{
                        padding: '6px 16px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: opportunitySource === 'local' ? 'rgba(157, 78, 221, 0.15)' : 'transparent',
                        color: opportunitySource === 'local' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      Mock Placements
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpportunitySource('internshala');
                        refreshOpportunities('internshala');
                      }}
                      style={{
                        padding: '6px 16px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: opportunitySource === 'internshala' ? 'rgba(157, 78, 221, 0.15)' : 'transparent',
                        color: opportunitySource === 'internshala' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      Live Internshala
                    </button>
                  </div>

                  {/* Search/Filter Controls Form */}
                  <Card style={{ padding: '20px' }}>
                    <form onSubmit={handleSearchSubmit} className="search-filter-form">
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <Input
                          id="int-search"
                          label="Search company or role"
                          placeholder="e.g. Example Tech"
                          defaultValue={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div style={{ width: '220px' }}>
                        <Input
                          id="int-loc"
                          label="Location"
                          placeholder="e.g. Bangalore"
                          defaultValue={locationQuery}
                          onChange={(e) => setLocationQuery(e.target.value)}
                        />
                      </div>
                      <div style={{ width: '200px' }}>
                        <Select
                          id="int-mode"
                          label="Mode"
                          defaultValue={modeFilter}
                          options={[
                            { value: '', label: 'All Modes' },
                            { value: 'Remote', label: 'Remote' },
                            { value: 'Hybrid', label: 'Hybrid' },
                            { value: 'On-site', label: 'On-site' }
                          ]}
                          onChange={(e) => setModeFilter(e.target.value)}
                        />
                      </div>
                      <Button type="submit" style={{ width: '130px', height: '48px' }}>Search</Button>
                    </form>
                  </Card>

                  {/* Listings */}
                  {fetching ? (
                    <div style={{ height: '150px', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
                  ) : opportunitySource === 'internshala' && providerStatus === 'NOT_CONFIGURED' ? (
                    <EmptyState
                      title="Live Internshala opportunities are not connected yet."
                      description={errorMessage || "The Internshala provider integration is currently not configured or disabled."}
                      icon={<Shield />}
                    />
                  ) : listings.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {listings.map((item) => {
                        const savedDoc = savedDocs.find(s => s.opportunityId?._id === item._id && s.opportunityType === 'internship');
                        return (
                          <Card key={item._id} style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                              <div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                                  <div style={{ display: 'inline-block', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>
                                    [Mock Placement]
                                  </div>
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Source: Local</span>
                                </div>
                                <h4 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0' }}>{item.role}</h4>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                  <span>{item.company}</span>
                                  <span>•</span>
                                  <span>{item.location}</span>
                                  <span>•</span>
                                  <Badge color="blue">{item.mode}</Badge>
                                </div>
                              </div>

                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>{item.stipend}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Stipend / month</div>
                              </div>
                            </div>

                            {/* Matching compatibility */}
                            <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '16px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                                <span>Skills Compatibility Match</span>
                                <span style={{ color: 'var(--primary)' }}>{item.matchScore}%</span>
                              </div>
                              <Progress value={item.matchScore} />
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                                {item.skillsRequired?.map((skill: string, sIdx: number) => (
                                  <Badge key={sIdx} color="blue">{skill}</Badge>
                                ))}
                              </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                              <Button variant="secondary" onClick={() => handleSaveToggle(item._id, savedDoc?._id)}>
                                {savedDoc ? 'Unsave Opportunity' : 'Save Opportunity'}
                              </Button>
                              <Button onClick={() => handleApplyClick(item._id, item.applicationLink)} disabled={submitting === item._id}>
                                {submitting === item._id ? 'Processing...' : 'Apply Externally'}
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState
                      title="No matched internships found"
                      description="Adjust your keyword queries or filters parameters to search whitelisted seeds."
                      icon={<Briefcase />}
                    />
                  )}
                </div>
              ) : (
                /* Bookmarks/Tracked Tab content */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {savedDocs.filter(d => d.opportunityType === 'internship').length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {savedDocs.filter(d => d.opportunityType === 'internship').map((bookmark) => {
                        const item = bookmark.opportunityId;
                        const notesVal = editingNotes[bookmark._id] !== undefined ? editingNotes[bookmark._id] : (bookmark.notes || '');
                        return (
                          <Card key={bookmark._id} style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                              <div>
                                <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{item?.role || 'Deleted Listing'}</h4>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{item?.company} • {item?.location}</div>
                              </div>
                              
                              <div style={{ width: '160px' }}>
                                <Select
                                  id={`stat-sel-${bookmark._id}`}
                                  label="Tracking Status"
                                  defaultValue={bookmark.status}
                                  options={[
                                    { value: 'saved', label: 'Saved' },
                                    { value: 'applied', label: 'Applied' },
                                    { value: 'interviewing', label: 'Interviewing' },
                                    { value: 'accepted', label: 'Accepted' },
                                    { value: 'rejected', label: 'Rejected' }
                                  ]}
                                  onChange={(e) => handleUpdateBookmark(bookmark._id, e.target.value, notesVal)}
                                />
                              </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                              <Textarea
                                id={`notes-sel-${bookmark._id}`}
                                label="Interview & Preparation Notes"
                                rows={2}
                                value={notesVal}
                                onChange={(e) => setEditingNotes({ ...editingNotes, [bookmark._id]: e.target.value })}
                                placeholder="Write details about the interview, tasks, deadlines, etc."
                              />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                              <Button variant="secondary" onClick={() => handleSaveToggle(item?._id, bookmark._id)}>
                                Remove Bookmark
                              </Button>
                              <Button onClick={() => handleUpdateBookmark(bookmark._id, bookmark.status, notesVal)}>
                                Save Changes
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState
                      title="No tracked applications"
                      description="Explore internships listings and save them to track statuses."
                      icon={<Briefcase />}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </AppLayout>
  );
};

export const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<'explore' | 'bookmarks'>('explore');

  // Eligibility states
  const [eduLevel, setEduLevel] = useState<string>('UG');
  const [isLevelBlocked, setIsLevelBlocked] = useState(false);
  const [isObjectiveMismatch, setIsObjectiveMismatch] = useState(false);
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  const [isAssessmentMissing, setIsAssessmentMissing] = useState(false);
  const [isResumeMissing, setIsResumeMissing] = useState(false);

  // Data states
  const [listings, setListings] = useState<any[]>([]);
  const [savedDocs, setSavedDocs] = useState<any[]>([]);
  const [opportunitySource, setOpportunitySource] = useState<'local' | 'internshala'>('local');
  const [providerStatus, setProviderStatus] = useState<'CONNECTED' | 'NOT_CONFIGURED'>('CONNECTED');
  const [errorMessage, setErrorMessage] = useState('');

  // Search parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  // Link safety redirect dialog
  const [showRedirectDialog, setShowRedirectDialog] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState<{ id: string; url: string } | null>(null);

  // Notes editing states
  const [editingNotes, setEditingNotes] = useState<{ [id: string]: string }>({});

  const checkEligibilityAndLoad = async () => {
    setLoading(true);
    try {
      const sumRes = await getDashboardSummaryApi();
      const edu = sumRes.data?.education;
      const prof = sumRes.data?.careerObjective;
      const comp = sumRes.data?.profileCompletion?.completionPercentage || 0;

      if (!edu) {
        setIsProfileIncomplete(true);
        setLoading(false);
        return;
      }

      setEduLevel(edu.educationLevel);
      if (edu.educationLevel === 'Class11' || edu.educationLevel === 'Class12' || edu.educationLevel === 'Class10') {
        setIsLevelBlocked(true);
        setLoading(false);
        return;
      }

      if (comp < 100) {
        setIsProfileIncomplete(true);
        setLoading(false);
        return;
      }

      if (prof?.value !== 'find_job') {
        setIsObjectiveMismatch(true);
        setLoading(false);
        return;
      }

      // Check readiness test completion
      const resultsHistory = await getResultsHistoryApi();
      const hasCompletedReadyTest = resultsHistory.data?.some((r: any) => r.assessmentId?.type === 'job_readiness');
      if (!hasCompletedReadyTest) {
        setIsAssessmentMissing(true);
        setLoading(false);
        return;
      }

      // Check resume builder status
      const resumeRes = await listResumesApi();
      if (!resumeRes.data || resumeRes.data.length === 0) {
        setIsResumeMissing(true);
        setLoading(false);
        return;
      }

      // If all checks pass, load listings and bookmarks
      await refreshOpportunities();
    } catch {
      toast.error('Failed to verify eligibility dependencies.');
    }
    setLoading(false);
  };

  const refreshOpportunities = async (src = opportunitySource) => {
    setFetching(true);
    setErrorMessage('');
    try {
      // Load saved list
      const savedRes = await api.get('/opportunities/saved');
      setSavedDocs(savedRes.data.data);

      // Load platform listings
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (locationQuery) params.location = locationQuery;
      params.source = src;

      const opportunitiesRes = await api.get('/opportunities/jobs', { params });
      if (opportunitiesRes.data.providerStatus === 'NOT_CONFIGURED') {
        setProviderStatus('NOT_CONFIGURED');
        setListings([]);
        setErrorMessage(opportunitiesRes.data.message || 'Live Internshala opportunities are not connected yet.');
      } else {
        setProviderStatus('CONNECTED');
        setListings(opportunitiesRes.data.data || []);
      }
    } catch {
      toast.error('Failed to retrieve opportunities.');
    }
    setFetching(false);
  };

  useEffect(() => {
    checkEligibilityAndLoad();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refreshOpportunities();
  };

  const handleSaveToggle = async (oppId: string, savedDocId?: string) => {
    try {
      if (savedDocId) {
        // Unsave
        await api.delete(`/opportunities/saved/${savedDocId}`);
        toast.success('Opportunity removed from saved list.');
      } else {
        // Save
        await api.post('/opportunities/saved', {
          opportunityType: 'job',
          opportunityId: oppId,
          status: 'saved',
          notes: ''
        });
        toast.success('Opportunity bookmarked!');
      }
      refreshOpportunities();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save opportunity.');
    }
  };

  const handleApplyClick = (oppId: string, url: string) => {
    setRedirectTarget({ id: oppId, url });
    setShowRedirectDialog(true);
  };

  const handleProceedRedirect = async () => {
    if (!redirectTarget) return;
    setSubmitting(redirectTarget.id);
    try {
      // Save status as applied manually on redirect
      await api.post('/opportunities/saved', {
        opportunityType: 'job',
        opportunityId: redirectTarget.id,
        status: 'applied'
      });
      toast.success('Application status updated to APPLIED.');
      window.open(redirectTarget.url, '_blank');
      refreshOpportunities();
    } catch {
      toast.error('Failed to log application status.');
    }
    setSubmitting(null);
    setShowRedirectDialog(false);
    setRedirectTarget(null);
  };

  const handleUpdateBookmark = async (savedId: string, status: string, notes: string) => {
    try {
      await api.patch(`/opportunities/saved/${savedId}`, { status, notes });
      toast.success('Saved status updated!');
      refreshOpportunities();
    } catch {
      toast.error('Failed to update bookmark.');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <PageHeader title="Job Placements Center" description="Verifying eligibility checkpoints..." />
        <div style={{ padding: '20px' }}>
          <div style={{ height: '200px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
        </div>
      </AppLayout>
    );
  }

  if (isLevelBlocked) {
    return (
      <AppLayout>
        <PageHeader title="Job Placements Center" description="Review local whitelisted jobs matched against your career goals." />
        <EmptyState 
          title="Educational Roadmap Focus Only" 
          description={`Your active education level (${eduLevel}) is focused on school planning. Employment listings are available for Diploma and college graduates.`}
          action={<Button onClick={() => navigate('/roadmap')}>View Career Roadmap</Button>}
          icon={<Map />}
        />
      </AppLayout>
    );
  }

  if (isProfileIncomplete) {
    return (
      <AppLayout>
        <PageHeader title="Job Placements Center" description="Review local whitelisted jobs matched against your career goals." />
        <EmptyState 
          title="Complete your profile first" 
          description="Complete your student profile details and educational parameters to unlock matches."
          action={<Button onClick={() => navigate('/profile')}>Complete Profile</Button>}
          icon={<FileText />}
        />
      </AppLayout>
    );
  }

  if (isObjectiveMismatch) {
    return (
      <AppLayout>
        <PageHeader title="Job Placements Center" description="Review local whitelisted jobs matched against your career goals." />
        <EmptyState 
          title="Adjust Career Objective" 
          description="Your current objective is set to exploration. Choose 'Find a Job' to view whitelisted listings."
          action={<Button onClick={() => navigate('/profile')}>Update Profile</Button>}
          icon={<Shield />}
        />
      </AppLayout>
    );
  }

  if (isAssessmentMissing) {
    return (
      <AppLayout>
        <PageHeader title="Job Placements Center" description="Review local whitelisted jobs matched against your career goals." />
        <EmptyState 
          title="Complete your assessment first" 
          description="You must complete the Job Readiness Assessment to unlock matching opportunities."
          action={<Button onClick={() => navigate('/assessment')}>Take Assessment</Button>}
          icon={<Award />}
        />
      </AppLayout>
    );
  }

  if (isResumeMissing) {
    return (
      <AppLayout>
        <PageHeader title="Job Placements Center" description="Review local whitelisted jobs matched against your career goals." />
        <EmptyState 
          title="Build your resume first" 
          description="You must construct and save a resume template in the Resume Builder to unlock applications."
          action={<Button onClick={() => navigate('/resume')}>Build Resume</Button>}
          icon={<FileText />}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Toaster position="top-right" theme="dark" />
      <PageHeader 
        title="Job Placements Center" 
        description="Browse whitelisted jobs matched deterministically against your profile skills." 
      />

      {/* Redirect dialog */}
      <ConfirmDialog
        isOpen={showRedirectDialog}
        onClose={() => setShowRedirectDialog(false)}
        onConfirm={handleProceedRedirect}
        title="Apply Externally"
        message="You are leaving AI Career Mentor to apply on an external website. Once completed, your application status will be manually tracked by you."
        confirmText="Proceed to Website"
        cancelText="Cancel"
      />

      {/* Tab Controls */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('explore')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 600,
            background: activeTab === 'explore' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'explore' ? 'var(--text-primary)' : 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Explore Jobs
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 600,
            background: activeTab === 'bookmarks' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'bookmarks' ? 'var(--text-primary)' : 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Tracked Applications ({savedDocs.filter(d => d.opportunityType === 'job').length})
        </button>
      </div>

      {activeTab === 'explore' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Segmented Source Selector */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', width: 'fit-content' }}>
            <button
              type="button"
              onClick={() => {
                setOpportunitySource('local');
                refreshOpportunities('local');
              }}
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 600,
                background: opportunitySource === 'local' ? 'rgba(157, 78, 221, 0.15)' : 'transparent',
                color: opportunitySource === 'local' ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              Mock Placements
            </button>
            <button
              type="button"
              onClick={() => {
                setOpportunitySource('internshala');
                refreshOpportunities('internshala');
              }}
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 600,
                background: opportunitySource === 'internshala' ? 'rgba(157, 78, 221, 0.15)' : 'transparent',
                color: opportunitySource === 'internshala' ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              Live Internshala
            </button>
          </div>

          {/* Search/Filter Controls Form */}
          <Card style={{ padding: '20px' }}>
            <form onSubmit={handleSearchSubmit} className="search-filter-form">
              <div style={{ flex: 1, minWidth: '200px' }}>
                <Input
                  id="job-search"
                  label="Search company or role"
                  placeholder="e.g. AI Engineer"
                  defaultValue={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div style={{ width: '220px' }}>
                <Input
                  id="job-loc"
                  label="Location"
                  placeholder="e.g. Bangalore"
                  defaultValue={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                />
              </div>
              <Button type="submit" style={{ width: '130px', height: '48px' }}>Search</Button>
            </form>
          </Card>

          {/* Listings */}
          {fetching ? (
            <div style={{ height: '150px', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
          ) : opportunitySource === 'internshala' && providerStatus === 'NOT_CONFIGURED' ? (
            <EmptyState
              title="Live Internshala opportunities are not connected yet."
              description={errorMessage || "The Internshala provider integration is currently not configured or disabled."}
              icon={<Shield />}
            />
          ) : listings.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {listings.map((item) => {
                const savedDoc = savedDocs.find(s => s.opportunityId?._id === item._id && s.opportunityType === 'job');
                return (
                  <Card key={item._id} style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ display: 'inline-block', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>
                            [Mock Placement]
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Source: Local</span>
                        </div>
                        <h4 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0' }}>{item.jobRole}</h4>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                          <span>{item.company}</span>
                          <span>•</span>
                          <span>{item.location}</span>
                          <span>•</span>
                          <Badge color="blue">{item.experienceRequired}</Badge>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>{item.salaryRange}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Salary / package</div>
                      </div>
                    </div>

                    {/* Matching score section */}
                    <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                        <span>Skills Compatibility Match</span>
                        <span style={{ color: 'var(--primary)' }}>{item.matchScore}%</span>
                      </div>
                      <Progress value={item.matchScore} />
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                        {item.skillsRequired?.map((skill: string, sIdx: number) => (
                          <Badge key={sIdx} color="blue">{skill}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                      <Button variant="secondary" onClick={() => handleSaveToggle(item._id, savedDoc?._id)}>
                        {savedDoc ? 'Unsave Opportunity' : 'Save Opportunity'}
                      </Button>
                      <Button onClick={() => handleApplyClick(item._id, item.applicationLink)} disabled={submitting === item._id}>
                        {submitting === item._id ? 'Processing...' : 'Apply Externally'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No matched jobs found"
              description="Adjust your keyword queries or filters parameters to search whitelisted seeds."
              icon={<GraduationCap />}
            />
          )}
        </div>
      ) : (
        /* Bookmarks/Tracked Tab content */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {savedDocs.filter(d => d.opportunityType === 'job').length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {savedDocs.filter(d => d.opportunityType === 'job').map((bookmark) => {
                const item = bookmark.opportunityId;
                const notesVal = editingNotes[bookmark._id] !== undefined ? editingNotes[bookmark._id] : (bookmark.notes || '');
                return (
                  <Card key={bookmark._id} style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{item?.jobRole || 'Deleted Listing'}</h4>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{item?.company} • {item?.location}</div>
                      </div>

                      <div style={{ width: '160px' }}>
                        <Select
                          id={`stat-sel-${bookmark._id}`}
                          label="Tracking Status"
                          defaultValue={bookmark.status}
                          options={[
                            { value: 'saved', label: 'Saved' },
                            { value: 'applied', label: 'Applied' },
                            { value: 'interviewing', label: 'Interviewing' },
                            { value: 'accepted', label: 'Accepted' },
                            { value: 'rejected', label: 'Rejected' }
                          ]}
                          onChange={(e) => handleUpdateBookmark(bookmark._id, e.target.value, notesVal)}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <Textarea
                        id={`notes-sel-${bookmark._id}`}
                        label="Interview & Preparation Notes"
                        rows={2}
                        value={notesVal}
                        onChange={(e) => setEditingNotes({ ...editingNotes, [bookmark._id]: e.target.value })}
                        placeholder="Write details about the interview, tasks, deadlines, etc."
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                      <Button variant="secondary" onClick={() => handleSaveToggle(item?._id, bookmark._id)}>
                        Remove Bookmark
                      </Button>
                      <Button onClick={() => handleUpdateBookmark(bookmark._id, bookmark.status, notesVal)}>
                        Save Changes
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No tracked applications"
              description="Explore jobs listings and save them to track statuses."
              icon={<GraduationCap />}
            />
          )}
        </div>
      )}
    </AppLayout>
  );
};

export const Settings: React.FC = () => {
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);


  const loadAISettings = async () => {
    try {
      setLoading(true);
      const res = await getAISettingsApi();
      setAiStatus(res.data);
    } catch {
      setAiStatus({ status: 'not_configured', maskedKey: null, validatedAt: null, provider: 'google_gemini' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAISettings(); }, []);

  const handleSaveKey = async () => {
    if (!apiKeyInput.trim()) {
      toast.error('Please enter your API key.');
      return;
    }
    try {
      setSaving(true);
      const res = await saveGeminiKeyApi(apiKeyInput.trim());
      setAiStatus(res.data);
      setApiKeyInput('');
      setShowKeyInput(false);
      setShowKey(false);
      toast.success('Gemini API key verified and connected successfully!');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to verify API key. Please check and try again.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveKey = async () => {
    try {
      setRemoving(true);
      const res = await removeGeminiKeyApi();
      setAiStatus(res.data);
      setShowRemoveConfirm(false);
      toast.success('Gemini API key has been removed.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to remove API key.');
    } finally {
      setRemoving(false);
    }
  };

  const isConnected = aiStatus?.status === 'connected';

  return (
    <AppLayout>
      <Toaster position="top-right" theme="dark" />
      <PageHeader
        title="Account Settings"
        description="Manage your AI configuration and account preferences."
      />
      <div style={{ maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* AI Configuration Section */}
        <Card style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(123,44,191,0.2), rgba(79,70,229,0.2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Key size={20} style={{ color: 'rgb(167,139,250)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>AI Configuration</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Google Gemini API Key</p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span style={{
                padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                background: isConnected ? 'rgba(74,222,128,0.15)' : 'rgba(251,191,36,0.15)',
                color: isConnected ? 'rgb(74,222,128)' : 'rgb(251,191,36)',
                border: `1px solid ${isConnected ? 'rgba(74,222,128,0.3)' : 'rgba(251,191,36,0.3)'}`
              }}>
                {isConnected ? '🟢 Connected' : '⚪ Not Connected'}
              </span>
            </div>
          </div>

          {loading ? (
            <Loading />
          ) : isConnected ? (
            /* Connected State */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={16} style={{ color: 'rgba(74,222,128,0.8)' }} />
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>API Key</span>
                </div>
                <code style={{
                  fontSize: '14px', fontFamily: 'monospace', padding: '10px 14px',
                  background: 'rgba(255,255,255,0.03)', borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.06)', letterSpacing: '1px'
                }}>
                  {aiStatus.maskedKey}
                </code>
              </div>

              {aiStatus.validatedAt && (
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                  Last verified: {new Date(aiStatus.validatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}

              {!showKeyInput ? (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button
                    variant="secondary"
                    onClick={() => { setShowKeyInput(true); setApiKeyInput(''); }}
                    style={{ fontSize: '13px' }}
                  >
                    Change Key
                  </Button>
                  <Button
                    onClick={() => setShowRemoveConfirm(true)}
                    style={{ fontSize: '13px', background: 'rgba(239,68,68,0.15)', color: 'rgb(239,68,68)', border: '1px solid rgba(239,68,68,0.3)' }}
                  >
                    Remove Key
                  </Button>
                </div>
              ) : (
                /* Replacement key input */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                    Enter your new API key. Your current key will be preserved until the new key is successfully verified.
                  </p>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="gemini-key-replace"
                      type={showKey ? 'text' : 'password'}
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="Paste your new Google AI Studio API key"
                      style={{
                        width: '100%', padding: '10px 44px 10px 14px', borderRadius: '8px',
                        background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff', fontSize: '14px', fontFamily: 'monospace',
                        outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                    <button
                      onClick={() => setShowKey(!showKey)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}
                    >
                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button onClick={handleSaveKey} disabled={saving} style={{ fontSize: '13px' }}>
                      {saving ? 'Verifying...' : 'Save & Verify'}
                    </Button>
                    <Button variant="secondary" onClick={() => { setShowKeyInput(false); setApiKeyInput(''); setShowKey(false); }} style={{ fontSize: '13px' }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Not Connected State */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                padding: '20px', borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(123,44,191,0.08), rgba(79,70,229,0.08))',
                border: '1px solid rgba(123,44,191,0.15)'
              }}>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: '0 0 12px 0', lineHeight: 1.6 }}>
                  Connect your <strong>Google AI Studio API key</strong> to unlock personalized AI recommendations,
                  career roadmaps, and learning plans.
                </p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>
                  Your key is encrypted and stored securely. The full key will not be displayed after saving.
                  Your key is used only for your own Gemini requests.
                </p>
              </div>

              <div style={{
                padding: '16px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0' }}>How to get your API key:</h4>
                <ol style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>Open <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'rgb(167,139,250)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Google AI Studio <ExternalLink size={12} /></a></li>
                  <li>Sign in with your Google account</li>
                  <li>Create or select an API key</li>
                  <li>Copy the key and paste it below</li>
                </ol>
              </div>

              {!showKeyInput ? (
                <Button onClick={() => setShowKeyInput(true)} style={{ alignSelf: 'flex-start' }}>
                  <Sparkles size={16} style={{ marginRight: '6px' }} /> Configure Gemini
                </Button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="gemini-key-initial"
                      type={showKey ? 'text' : 'password'}
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="Paste your Google AI Studio API key"
                      style={{
                        width: '100%', padding: '10px 44px 10px 14px', borderRadius: '8px',
                        background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff', fontSize: '14px', fontFamily: 'monospace',
                        outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                    <button
                      onClick={() => setShowKey(!showKey)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}
                    >
                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button onClick={handleSaveKey} disabled={saving}>
                      {saving ? 'Verifying...' : 'Save & Verify'}
                    </Button>
                    <Button variant="secondary" onClick={() => { setShowKeyInput(false); setApiKeyInput(''); setShowKey(false); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Remove Key Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showRemoveConfirm}
          onClose={() => setShowRemoveConfirm(false)}
          title="Remove Gemini API Key"
          message="Are you sure you want to remove your Gemini API key? AI features will be disabled until you configure a new key. Your existing recommendations will remain accessible."
          confirmText={removing ? 'Removing...' : 'Remove Key'}
          cancelText="Cancel"
          isDangerous={true}
          onConfirm={handleRemoveKey}
        />
      </div>
    </AppLayout>
  );
};
