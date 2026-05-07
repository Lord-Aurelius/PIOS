"use client";

import { useEffect, useState } from "react";
import { commandData } from "@/lib/demo-data";
import {
  defaultSurveyQuestions,
  storageKeyForSurvey,
  SurveyQuestion
} from "@/lib/survey-questions";

export function PublicSurveyForm({ slug }: { slug: string }) {
  const survey = commandData.surveys.find((item) => item.slug === slug) ?? commandData.surveys[0];
  const [questions, setQuestions] = useState<SurveyQuestion[]>(defaultSurveyQuestions[survey.slug]);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKeyForSurvey(survey.slug));
    setQuestions(saved ? JSON.parse(saved) : defaultSurveyQuestions[survey.slug]);
  }, [survey.slug]);

  return (
    <main className="min-h-screen bg-command-950 px-4 py-6 text-white">
      <section className="mx-auto max-w-xl rounded-md border border-white/10 bg-command-900 shadow-intel">
        <div className="border-b border-white/10 p-5">
          <p className="text-sm uppercase text-sky-200">Field Survey</p>
          <h1 className="mt-2 text-2xl font-semibold">{survey.name}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">{survey.target}</p>
        </div>
        <form className="space-y-5 p-5">
          {questions.map((question) => (
            <Field key={question.id} label={question.label}>
              <QuestionInput question={question} />
            </Field>
          ))}
          <button className="h-12 w-full rounded-md bg-sky-300 font-semibold text-slate-950" type="button">
            Submit Response
          </button>
          <p className="text-xs leading-5 text-slate-500">
            This public form is scoped to survey collection only. Field agents do not receive command-center access from this link.
          </p>
        </form>
      </section>
    </main>
  );
}

function QuestionInput({ question }: { question: SurveyQuestion }) {
  const baseClass = "w-full rounded-md border border-white/10 bg-slate-950/60 px-3 outline-none focus:border-sky-300";
  if (question.type === "NOTES") {
    return <textarea className={`${baseClass} min-h-28 p-3`} name={question.id} />;
  }
  if (question.type === "SCALE") {
    return (
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <label key={value} className="flex h-11 items-center justify-center rounded-md border border-white/10 bg-slate-950/60 text-sm">
            <input className="sr-only" type="radio" name={question.id} value={value} />
            {value}
          </label>
        ))}
      </div>
    );
  }
  if (question.type === "MULTI_CHOICE") {
    return (
      <div className="space-y-2">
        {(question.options ?? ["Yes", "No"]).map((option) => (
          <label key={option} className="flex min-h-10 items-center gap-3 rounded-md border border-white/10 bg-slate-950/60 px-3 text-sm">
            <input type="checkbox" name={question.id} value={option} />
            {option}
          </label>
        ))}
      </div>
    );
  }
  if (question.type === "SINGLE_CHOICE") {
    return (
      <select className={`${baseClass} h-11`} name={question.id}>
        {(question.options ?? ["Yes", "No"]).map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    );
  }
  return <input className={`${baseClass} h-11`} name={question.id} />;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      {children}
    </label>
  );
}
