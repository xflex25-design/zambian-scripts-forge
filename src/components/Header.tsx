import { Home, ScanText } from "lucide-react";
import { DOC_TYPES } from "@/lib/documents";
import { DocIcon } from "@/components/DocIcon";
import { navigate, useRoute } from "@/lib/router";

function Flag() {
  return (
    <span className="relative inline-block h-5 w-7 overflow-hidden rounded-[4px] bg-primary">
      <span className="absolute bottom-0 right-0 flex h-3 w-3">
        <span className="w-1/3 bg-destructive" />
        <span className="w-1/3 bg-paper-ink" />
        <span className="w-1/3 bg-accent" />
      </span>
    </span>
  );
}

export function Header() {
  const route = useRoute();

  const isActive = (path: string) => {
    if (path === "/") return route.path === "/" && !route.params.type;
    return route.path === path;
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 font-display text-xl font-bold">
          <Flag /> Zalemba
        </button>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          No login required
        </span>
      </div>
      <nav aria-label="Documents" className="mx-auto max-w-6xl overflow-x-auto px-5 pb-3 [scrollbar-width:none]">
        <div className="flex w-max gap-2">
          <button
            onClick={() => navigate("/")}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${isActive("/") ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/40"}`}
          >
            <Home className="size-4" /> Home
          </button>
          {DOC_TYPES.filter((d) => d.popular).map((d) => (
            <button
              key={d.id}
              onClick={() => navigate(`/create/${d.id}`)}
              className={`flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-3 text-sm font-medium transition ${route.path === "/create" && route.params.type === d.id ? "border-primary bg-secondary text-secondary-foreground" : "bg-card hover:border-primary/40"}`}
            >
              <DocIcon id={d.id} emoji={d.emoji} className="size-7 rounded-full text-sm [&_img]:size-5" />
              {d.title}
            </button>
          ))}
          <button
            onClick={() => navigate("/image-to-text")}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${route.path === "/image-to-text" ? "border-primary bg-secondary text-secondary-foreground" : "bg-card hover:border-primary/40"}`}
          >
            <ScanText className="size-4" /> Image to Text
          </button>
        </div>
      </nav>
    </header>
  );
}
