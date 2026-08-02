import { updateProfileInfo } from "@/app/client/actions";

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function ProfileInfoForm({
  yearsExperience,
  careerGoal,
  careerGoalTargetDate,
}: {
  yearsExperience: number | null;
  careerGoal: string | null;
  careerGoalTargetDate: Date | null;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">Career snapshot</h2>
      <form action={updateProfileInfo} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="yearsExperience" className="text-xs font-medium text-slate-600">
            Years of experience
          </label>
          <input
            id="yearsExperience"
            name="yearsExperience"
            type="number"
            min={0}
            max={60}
            defaultValue={yearsExperience ?? ""}
            className="w-32 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="careerGoal" className="text-xs font-medium text-slate-600">
            Career goal
          </label>
          <textarea
            id="careerGoal"
            name="careerGoal"
            rows={2}
            defaultValue={careerGoal ?? ""}
            placeholder="e.g. Become a director of product within a B2B SaaS company"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="careerGoalTargetDate" className="text-xs font-medium text-slate-600">
            Target date
          </label>
          <input
            id="careerGoalTargetDate"
            name="careerGoalTargetDate"
            type="date"
            defaultValue={toDateInputValue(careerGoalTargetDate)}
            className="w-48 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="self-start rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          Save
        </button>
      </form>
    </div>
  );
}
