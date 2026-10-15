import { cn } from "@/lib/utils";

export function DocIcon({ id, emoji, className }: { id: string; emoji: string; className?: string }) {
  return (
    <span className={cn("grid size-11 place-items-center rounded-2xl bg-secondary text-2xl", className)}>
      {id === "helsb" ? <img src="/education-logo.png" alt="Education logo" className="size-8 object-contain" /> : emoji}
    </span>
  );
}
