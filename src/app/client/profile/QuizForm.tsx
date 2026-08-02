import { submitQuiz } from "@/app/client/actions";
import { QUESTIONS, LIKERT_OPTIONS } from "@/lib/quiz";

export function QuizForm({ retake }: { retake?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-1 text-sm font-semibold text-slate-900">
        {retake ? "Retake the work-style assessment" : "Work-style assessment"}
      </h2>
      <p className="mb-4 text-sm text-slate-500">
        Rate how much you agree with each statement. This helps your coach understand how you
        like to work.
      </p>
      <form action={submitQuiz} className="flex flex-col gap-5">
        {QUESTIONS.map((question, index) => (
          <fieldset key={question.id} className="flex flex-col gap-2">
            <legend className="text-sm text-slate-800">
              {index + 1}. {question.text}
            </legend>
            <div className="flex flex-wrap gap-3">
              {LIKERT_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-1.5 text-xs text-slate-600"
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option.value}
                    required
                    className="h-3.5 w-3.5"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <button
          type="submit"
          className="self-start rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          {retake ? "Save new results" : "See my results"}
        </button>
      </form>
    </div>
  );
}
