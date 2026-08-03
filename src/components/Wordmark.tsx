export function Wordmark({
  tagline,
  size = "sm",
}: {
  tagline: string;
  size?: "sm" | "lg";
}) {
  return (
    <span className="flex flex-col items-center leading-none sm:items-start">
      <span
        className={
          size === "lg"
            ? "text-4xl font-bold tracking-[0.1em] text-black"
            : "text-lg font-bold tracking-wide text-black"
        }
      >
        V3TTA
      </span>
      <span
        className={
          size === "lg"
            ? "mt-1.5 text-xs tracking-wide text-neutral-500"
            : "text-[10px] tracking-wide text-neutral-500"
        }
      >
        {tagline}
      </span>
    </span>
  );
}
