import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  HeartPulse,
  ClipboardList,
  Pill,
  Users,
  ShieldCheck,
  Search,
  Bookmark,
  CheckCircle2,
  Stethoscope,
  FileText,
  Brain,
  Moon,
  Wallet,
} from 'lucide-react';
import { trackAnalyticsEvent } from '../../platform/analytics/analyticsEvents.ts';
import { ReadAloudButton } from '../stratum/ReadAloudButton.tsx';

type LearningTopic = {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  summary: string;
  points: string[];
};

const learningTopics: LearningTopic[] = [
  {
    id: 'blood-pressure',
    title: 'Understanding blood pressure',
    category: 'Everyday health',
    icon: <HeartPulse className="h-5 w-5" />,
    summary: 'Learn what the two blood pressure numbers describe and why measurements can vary.',
    points: [
      'The top number (systolic) measures pressure when the heart beats.',
      'The bottom number (diastolic) measures pressure between beats.',
      'A single reading does not tell the whole story. Ask a qualified healthcare professional how to interpret your readings in context.',
    ],
  },
  {
    id: 'healthcare-visit',
    title: 'Preparing for a healthcare visit',
    category: 'Patient skills',
    icon: <ClipboardList className="h-5 w-5" />,
    summary: 'A simple way to organize questions, current medicines, and follow-up steps.',
    points: [
      'Write down your main questions and when symptoms or concerns began.',
      'Bring an up-to-date list of medicines and supplements, including how you take them.',
      'Before leaving, ask who to contact with questions and when you should expect results.',
    ],
  },
  {
    id: 'medicine-safety',
    title: 'Using medicines safely',
    category: 'Medication literacy',
    icon: <Pill className="h-5 w-5" />,
    summary: 'Understand labels, medicine lists, and the importance of checking before making changes.',
    points: [
      'Follow the instructions provided by your prescriber and pharmacist.',
      'Ask before starting, stopping, or changing a medicine or supplement.',
      'Tell your care team about allergies and all medicines you take to help them check for interactions.',
    ],
  },
  {
    id: 'caregiver-support',
    title: 'Supporting someone you care for',
    category: 'Caregiving',
    icon: <Users className="h-5 w-5" />,
    summary: 'Practical ways to support another person while respecting their choices and privacy.',
    points: [
      'Ask what kind of help the person wants rather than assuming.',
      'With their permission, help organize questions, appointments, and care instructions.',
      'Make space for your own rest and ask the care team about caregiver support resources.',
    ],
  },
  {
    id: 'cholesterol',
    title: 'Learning about cholesterol',
    category: 'Everyday health',
    icon: <HeartPulse className="h-5 w-5" />,
    summary: 'Understand common cholesterol terms and how clinicians use results as part of a bigger picture.',
    points: [
      'Cholesterol is a waxy substance that the body uses to do important jobs.',
      'A lipid panel may report different types of cholesterol and triglycerides.',
      'A healthcare professional can explain what your results mean alongside your health history and other risk factors.',
    ],
  },
  {
    id: 'test-results',
    title: 'Making sense of test results',
    category: 'Patient skills',
    icon: <FileText className="h-5 w-5" />,
    summary: 'Prepare useful questions when you receive a laboratory or imaging result.',
    points: [
      'Ask what the test measures and why it was ordered.',
      'Reference ranges can differ between laboratories and do not always explain what a result means for one person.',
      'Ask whether follow-up is needed, who will contact you, and what to do if you have questions.',
    ],
  },
  {
    id: 'preventive-care',
    title: 'Understanding preventive care',
    category: 'Health systems',
    icon: <Stethoscope className="h-5 w-5" />,
    summary: 'Learn how checkups, screenings, and vaccines fit into conversations about staying well.',
    points: [
      'Preventive care can include routine visits, screenings, vaccines, and health counseling.',
      'Recommendations can depend on age, personal history, family history, and other factors.',
      'Ask your healthcare professional which services are appropriate for you and when to schedule them.',
    ],
  },
  {
    id: 'mental-health',
    title: 'Starting a mental health conversation',
    category: 'Everyday health',
    icon: <Brain className="h-5 w-5" />,
    summary: 'Find a clear way to describe emotional well-being concerns and ask for support.',
    points: [
      'You can start by describing what has changed and how it affects daily life.',
      'It may help to note when concerns began and what makes them better or worse.',
      'A qualified professional can discuss support options. If someone is in immediate danger, contact local emergency services.',
    ],
  },
  {
    id: 'sleep',
    title: 'Talking about sleep and daily routines',
    category: 'Everyday health',
    icon: <Moon className="h-5 w-5" />,
    summary: 'Explore how sleep, daily habits, and health conversations can connect.',
    points: [
      'Sleep needs and patterns can change across life stages.',
      'A short sleep diary can help you describe patterns to a healthcare professional.',
      'Ask for guidance if sleep problems persist or affect safety, mood, or daily activities.',
    ],
  },
  {
    id: 'health-coverage',
    title: 'Navigating health coverage',
    category: 'Health systems',
    icon: <Wallet className="h-5 w-5" />,
    summary: 'Learn common insurance terms and questions to ask before receiving care.',
    points: [
      'A provider network is the group of clinicians and facilities covered under a plan’s network rules.',
      'Prior authorization means a health plan reviews some services before they are provided.',
      'Ask your plan and provider about coverage, expected costs, referrals, and appeal options before making decisions.',
    ],
  },
];

const categories = ['All topics', ...Array.from(new Set(learningTopics.map((topic) => topic.category)))];

export const StratumLearningHub: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All topics');
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set());
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => new Set());

  const filteredTopics = useMemo(() => {
    const query = search.trim().toLowerCase();
    return learningTopics.filter((topic) => {
      const matchesCategory = category === 'All topics' || topic.category === category;
      const searchableText = [topic.title, topic.category, topic.summary, ...topic.points].join(' ').toLowerCase();
      return matchesCategory && (!query || searchableText.includes(query));
    });
  }, [search, category]);

  const toggleSaved = (id: string) => {
    if (!savedIds.has(id)) void trackAnalyticsEvent('resource_saved');
    setSavedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const markCompleted = (id: string) => {
    if (completedIds.has(id)) return;
    void trackAnalyticsEvent('article_completed');
    setCompletedIds((current) => new Set(current).add(id));
  };

  return (
    <section aria-labelledby="stratum-learning-title" className="max-w-6xl mx-auto px-4 space-y-7">
      <div className="glass-panel-elevated rounded-2xl p-6 sm:p-8 border border-emerald-400/20">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/40 px-3 py-1 text-xs font-mono text-emerald-200">
            <BookOpen className="h-3.5 w-3.5" />
            STRATUM CLINICAL EDGE
          </span>
          <span className="text-xs text-slate-400">Powered by Project Kingdom</span>
        </div>
        <div className="grid gap-6 md:grid-cols-[1.4fr_0.6fr] md:items-center">
          <div>
            <h2 id="stratum-learning-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Clear health information. More confident conversations.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Explore approachable learning resources for patients, families, caregivers, students, and people at every stage of life.
              Stratum makes health topics easier to understand; Project Kingdom provides the shared intelligence and governance foundation.
            </p>
            <p className="mt-3 text-sm font-medium text-emerald-200">Clear Health Insights for Every Generation</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
            <ShieldCheck className="h-6 w-6 text-emerald-300 mb-2" />
            <h3 className="text-sm font-bold text-white">Education, not diagnosis</h3>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              These introductory materials support learning and conversations with qualified professionals. They do not diagnose
              conditions or replace personalized medical advice.
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Explore health learning topics</h3>
            <p className="mt-1 text-sm text-slate-400">Search, filter, save topics, and mark your reading progress for this session.</p>
          </div>
          <p className="text-xs text-emerald-200" aria-live="polite">
            {completedIds.size} of {learningTopics.length} topics completed this session
          </p>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_220px]">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-300">Search health topics</span>
            <span className="flex items-center gap-2 rounded-lg border border-white/15 bg-slate-950/70 px-3 focus-within:border-emerald-300/60">
              <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search topics or keywords"
                className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-300">Topic category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-lg border border-white/15 bg-slate-950/70 px-3 py-3 text-sm text-white outline-none focus:border-emerald-300/60"
            >
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <p className="mb-3 text-xs text-slate-400" aria-live="polite">
          Showing {filteredTopics.length} {filteredTopics.length === 1 ? 'topic' : 'topics'}.
          {savedIds.size > 0 ? ` ${savedIds.size} saved this session.` : ''}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {filteredTopics.map((topic) => (
            <details
              key={topic.id}
              onToggle={(event) => {
                if (event.currentTarget.open) void trackAnalyticsEvent('article_opened');
              }}
              className="group glass-panel rounded-xl p-5 open:border-emerald-400/40"
            >
              <summary className="flex cursor-pointer list-none items-start gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-950/50 text-emerald-200">
                  {topic.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-emerald-300">{topic.category}</span>
                  <span className="mt-1 block text-sm font-bold text-white">{topic.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-400">{topic.summary}</span>
                </span>
                <span aria-hidden="true" className="text-lg text-emerald-300 transition-transform group-open:rotate-45">+</span>
              </summary>
              <ul className="mt-4 space-y-2 border-t border-white/10 pt-4 pl-5 text-xs leading-5 text-slate-300 list-disc">
                {topic.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
                <ReadAloudButton text={`${topic.title}. ${topic.summary} ${topic.points.join(' ')}`} />
                <button
                  type="button"
                  onClick={() => toggleSaved(topic.id)}
                  aria-pressed={savedIds.has(topic.id)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/15 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300"
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  {savedIds.has(topic.id) ? 'Saved this session' : 'Save topic'}
                </button>
                <button
                  type="button"
                  onClick={() => markCompleted(topic.id)}
                  aria-pressed={completedIds.has(topic.id)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/25 px-2.5 py-1.5 text-xs text-emerald-200 hover:bg-emerald-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {completedIds.has(topic.id) ? 'Completed' : 'Mark as read'}
                </button>
              </div>
            </details>
          ))}
        </div>

        {filteredTopics.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-slate-950/50 px-5 py-10 text-center" role="status">
            <p className="text-sm font-semibold text-white">No matching topics</p>
            <p className="mt-1 text-xs text-slate-400">Try another search term or choose a different category.</p>
            <button
              type="button"
              onClick={() => { setSearch(''); setCategory('All topics'); }}
              className="mt-3 rounded-lg border border-emerald-300/30 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-300/10"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <section aria-labelledby="stratum-data-title" className="rounded-xl border border-white/10 bg-slate-950/50 p-5">
        <h3 id="stratum-data-title" className="text-sm font-bold text-white">How this learning space handles information</h3>
        <ul className="mt-3 grid gap-3 text-xs leading-5 text-slate-300 sm:grid-cols-2">
          <li><strong className="text-emerald-200">Learning progress:</strong> saved topics and reading progress stay in this page session and are not uploaded.</li>
          <li><strong className="text-emerald-200">Read aloud:</strong> speech is generated by your browser; topic text is not sent to an audio service.</li>
          <li><strong className="text-emerald-200">Optional analytics:</strong> only generic approved event names are sent, and only after you grant consent.</li>
          <li><strong className="text-emerald-200">Clinical data:</strong> no EHR or patient-record connection is active. Do not enter personal or patient information into this learning experience.</li>
        </ul>
      </section>

      <p className="text-[11px] leading-5 text-slate-500">
        Health information should be reviewed by qualified subject-matter professionals before publication as clinical guidance.
        If you have urgent or worsening symptoms, contact local emergency services or an appropriate healthcare professional.
      </p>
    </section>
  );
};
