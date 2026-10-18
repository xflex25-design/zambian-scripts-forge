import { useEffect, useState } from "react";
import { Home, ScanText, LogIn, LayoutGrid, LogOut } from "lucide-react";
import { DOC_TYPES } from "@/lib/documents";
import { DocIcon } from "@/components/DocIcon";
import { navigate, useRoute } from "@/lib/router";
import { useAuth } from "@/lib/auth";
import { countDocuments } from "@/lib/saved";

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
  const { user, signOut } = useAuth();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      setCount(null);
      return;
    }
    let active = true;
    countDocuments()
      .then((n) => active && setCount(n))
      .catch(() => active && setCount(null));
    return () => {
      active = false;
    };
  }, [user, route.path]);

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
        {user ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/account")}
              data-testid="header-account-btn"
              className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition hover:bg-primary hover:text-primary-foreground"
            >
              <LayoutGrid className="size-3.5" /> My documents
              {count !== null && count > 0 && (
                <span
                  data-testid="header-doc-count"
                  className="ml-0.5 inline-grid min-w-[1.25rem] place-items-center rounded-full bg-background px-1.5 text-[10px] font-bold text-primary"
                >
                  {count}
                </span>
              )}
            </button>
            <button
              onClick={() => { void signOut(); navigate("/"); }}
              data-testid="header-logout-btn"
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition hover:border-primary/40"
              aria-label="Log out"
            >
              <LogOut className="size-3.5" /> Log out
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            data-testid="header-login-btn"
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            <LogIn className="size-3.5" /> Log in
          </button>
        )}
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
