import React from 'react';
import { BookOpen, HeartPulse, ClipboardList, Pill, Users, ShieldCheck } from 'lucide-react';

const learningTopics = [
  {
    title: 'Understanding blood pressure',
    category: 'Heart health',
    icon: <HeartPulse className="h-5 w-5" />,
    summary: 'Learn what the two blood pressure numbers describe and why measurements can vary.',
    points: [
      'The top number (systolic) measures pressure when the heart beats.',
      'The bottom number (diastolic) measures pressure between beats.',
      'A single reading does not tell the whole story. Ask a qualified healthcare professional how to interpret your readings in context.',
    ],
  },
  {
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
    title: 'Supporting someone you care for',
    category: 'Caregiver resources',
    icon: <Users className="h-5 w-5" />,
    summary: 'Practical ways to support another person while respecting their choices and privacy.',
    points: [
      'Ask what kind of help the person wants rather than assuming.',
      'With their permission, help organize questions, appointments, and care instructions.',
      'Make space for your own rest and ask the care team about caregiver support resources.',
    ],
  },
];

export const StratumLearningHub: React.FC = () => (
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
            Explore approachable learning resources for patients, families, caregivers, students, and people at every stage of life. Stratum makes health topics easier to understand; Project Kingdom provides the shared intelligence and governance foundation.
          </p>
          <p className="mt-3 text-sm font-medium text-emerald-200">
            Clear Health Insights for Every Generation
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
          <ShieldCheck className="h-6 w-6 text-emerald-300 mb-2" />
          <h3 className="text-sm font-bold text-white">Education, not diagnosis</h3>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            These introductory materials support learning and conversations with qualified professionals. They do not diagnose conditions or replace personalized medical advice.
          </p>
        </div>
      </div>
    </div>

    <div>
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white">Explore health learning topics</h3>
        <p className="mt-1 text-sm text-slate-400">Open a topic to read a short, plain-language introduction.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {learningTopics.map((topic) => (
          <details key={topic.title} className="group glass-panel rounded-xl p-5 open:border-emerald-400/40">
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
          </details>
        ))}
      </div>
    </div>
    <p className="text-[11px] leading-5 text-slate-500">
      Health information should be reviewed by qualified subject-matter professionals before publication as clinical guidance. If you have urgent or worsening symptoms, contact local emergency services or an appropriate healthcare professional.
    </p>
  </section>
);
