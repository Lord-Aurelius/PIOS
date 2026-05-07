export type SurveyQuestionType = "SHORT_TEXT" | "SINGLE_CHOICE" | "MULTI_CHOICE" | "SCALE" | "LOCATION" | "NOTES";

export type SurveyQuestion = {
  id: string;
  label: string;
  type: SurveyQuestionType;
  options?: string[];
};

export type SurveyResponse = {
  id: string;
  slug: string;
  submittedAt: string;
  answers: Record<string, string | string[]>;
};

export const questionTypes: Array<{ value: SurveyQuestionType; label: string }> = [
  { value: "SHORT_TEXT", label: "Short text" },
  { value: "SINGLE_CHOICE", label: "Single choice" },
  { value: "MULTI_CHOICE", label: "Multiple choice" },
  { value: "SCALE", label: "1-5 scale" },
  { value: "LOCATION", label: "Location" },
  { value: "NOTES", label: "Long notes" }
];

export const defaultSurveyQuestions: Record<string, SurveyQuestion[]> = {
  "cost-of-living-pulse": [
    { id: "location", label: "Ward or polling station", type: "LOCATION" },
    { id: "age", label: "Age group", type: "SINGLE_CHOICE", options: ["18-24", "25-34", "35-44", "45+"] },
    {
      id: "issue",
      label: "Which issue matters most right now?",
      type: "SINGLE_CHOICE",
      options: ["Cost of living", "Jobs", "Security", "Healthcare", "County services"]
    },
    {
      id: "support",
      label: "Candidate support level",
      type: "SINGLE_CHOICE",
      options: ["Strong supporter", "Leaning supporter", "Undecided", "Leaning opponent", "Strong opponent"]
    },
    { id: "notes", label: "Notes from respondent", type: "NOTES" }
  ],
  "youth-jobs-cross-tab": [
    { id: "location", label: "Ward or estate", type: "LOCATION" },
    { id: "employment", label: "Employment status", type: "SINGLE_CHOICE", options: ["Employed", "Self-employed", "Student", "Unemployed"] },
    { id: "priority", label: "Most urgent youth jobs need", type: "MULTI_CHOICE", options: ["Training", "Capital", "County tenders", "Digital work", "Transport support"] },
    { id: "persuasion", label: "How persuasive is the candidate jobs plan?", type: "SCALE" }
  ],
  "rally-follow-up": [
    { id: "location", label: "Event location", type: "LOCATION" },
    { id: "attendance", label: "Did the respondent attend the rally?", type: "SINGLE_CHOICE", options: ["Yes", "No", "Heard about it"] },
    { id: "message", label: "Which rally message was remembered?", type: "SHORT_TEXT" },
    { id: "notes", label: "Organizer notes", type: "NOTES" }
  ]
};

export function storageKeyForSurvey(slug: string) {
  return `pios-survey:${slug}:questions`;
}

export function storageKeyForSurveyResponses(slug: string) {
  return `pios-survey:${slug}:responses`;
}
