"use client";

import { useEffect, useState } from "react";
import {
  defaultSurveyQuestions,
  storageKeyForSurveyResponses,
  storageKeyForSurvey,
  SurveyQuestion
} from "@/lib/survey-questions";

export function PublicSurveyForm({ slug }: { slug: string }) {
  const survey = {
    slug,
    name: slug.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
    target: "Field collection"
  };
  const [questions, setQuestions] = useState<SurveyQuestion[]>(defaultSurveyQuestions[survey.slug] ?? defaultSurveyQuestions["cost-of-living-pulse"]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKeyForSurvey(survey.slug));
    setQuestions(saved ? JSON.parse(saved) : (defaultSurveyQuestions[survey.slug] ?? defaultSurveyQuestions["cost-of-living-pulse"]));
  }, [survey.slug]);

  async function submitSurvey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const answers = questions.reduce<Record<string, string | string[]>>((result, question) => {
      const values = data.getAll(question.id).map(String).filter(Boolean);
      result[question.id] = question.type === "MULTI_CHOICE" ? values : values[0] ?? "";
      return result;
    }, {});
    const response = {
      id: `response-${Date.now()}`,
      slug: survey.slug,
      submittedAt: new Date().toISOString(),
      answers
    };
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    let savedResponse = response;
    if (apiBase) {
      try {
        const apiResponse = await fetch(`${apiBase}/api/v1/public/surveys/${survey.slug}/responses`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ answers })
        });
        if (apiResponse.ok) {
          savedResponse = await apiResponse.json();
        }
      } catch {
        savedResponse = response;
      }
    }
    const storageKey = storageKeyForSurveyResponses(survey.slug);
    const existing = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
    window.localStorage.setItem(storageKey, JSON.stringify([savedResponse, ...existing]));
    window.dispatchEvent(new CustomEvent("pios-survey-response", { detail: savedResponse }));
    setSubmitted(true);
    event.currentTarget.reset();
  }

  return (
    <main className="min-h-screen bg-command-950 px-4 py-6 text-white">
      <section className="mx-auto max-w-xl rounded-md border border-white/10 bg-command-900 shadow-intel">
        <div className="border-b border-white/10 p-5">
          <p className="text-sm uppercase text-sky-200">Field Survey</p>
          <h1 className="mt-2 text-2xl font-semibold">{survey.name}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">{survey.target}</p>
        </div>
        <form onSubmit={submitSurvey} className="space-y-5 p-5">
          {questions.map((question) => (
            <Field key={question.id} label={question.label}>
              <QuestionInput question={question} />
            </Field>
          ))}
          {submitted ? (
            <p className="rounded-md border border-emerald-300/30 bg-emerald-300/10 p-3 text-sm text-emerald-100">
              Response submitted. The campaign dashboard can now use this field signal.
            </p>
          ) : null}
          <button className="h-12 w-full rounded-md bg-sky-300 font-semibold text-slate-950" type="submit">
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
