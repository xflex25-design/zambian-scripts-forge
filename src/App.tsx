import { useEffect } from "react";
import { Toaster } from "sonner";
import { useRoute, matchRoute } from "@/lib/router";
import { Home } from "@/pages/Home";
import { Create } from "@/pages/Create";
import { ImageToText } from "@/pages/ImageToText";
import { Landing, LANDINGS } from "@/pages/Landing";
import { Login } from "@/pages/Login";
import { ResetPassword } from "@/pages/ResetPassword";
import { Account } from "@/pages/Account";
import { getDocType } from "@/lib/documents";

function getSiteUrl(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
  return "https://zalemba.lovable.app";
}

type MetaInfo = { title: string; description: string; canonical: string };

function getMeta(path: string): MetaInfo {
  const siteUrl = getSiteUrl();
  if (path === "/" || path === "") {
    return {
      title: "Zalemba – Free CV Maker & Application Letter Generator in Zambia",
      description: "Create professional Zambian CVs, job application letters, and HELSB appeal letters online with Zalemba. Free, fast, and formatted for Zambian employers and institutions.",
      canonical: `${siteUrl}/`,
    };
  }
  const createMatch = matchRoute("/create/$type", path);
  if (createMatch) {
    const t = getDocType(createMatch.type);
    if (t) {
      return { title: t.seo.title, description: t.seo.description, canonical: `${siteUrl}/create/${t.id}` };
    }
  }
  const landingMatch = matchRoute("/landing/$slug", path);
  if (landingMatch) {
    const l = LANDINGS[landingMatch.slug];
    if (l) {
      return { title: l.metaTitle, description: l.metaDescription, canonical: `${siteUrl}/landing/${l.slug}` };
    }
  }
  if (path === "/image-to-text") {
    return {
      title: "Image to Text Converter Online — Free OCR Scanner in Zambia | Zalemba",
      description: "Extract text from photos, documents, and screenshots instantly in Zambia. Free online OCR converter — copy, edit, or transform printed letters into editable text.",
      canonical: `${siteUrl}/image-to-text`,
    };
  }
  return {
    title: "Zalemba – Free CV Maker & Application Letter Generator in Zambia",
    description: "Create professional Zambian CVs, job application letters, and HELSB appeal letters online with Zalemba.",
    canonical: siteUrl,
  };
}

function setMeta(path: string) {
  const meta = getMeta(path);
  document.title = meta.title;

  const setOrCreate = (selector: string, attr: string, value: string) => {
    let el = document.head.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement("meta");
      if (selector.startsWith('meta[name="')) {
        el.setAttribute("name", selector.match(/name="(.+?)"/)?.[1] ?? "");
      } else if (selector.startsWith('meta[property="')) {
        el.setAttribute("property", selector.match(/property="(.+?)"/)?.[1] ?? "");
      }
      document.head.appendChild(el);
    }
    el.setAttribute(attr, value);
  };

  setOrCreate('meta[name="description"]', "content", meta.description);
  setOrCreate('meta[property="og:title"]', "content", meta.title);
  setOrCreate('meta[property="og:description"]', "content", meta.description);
  setOrCreate('meta[property="og:url"]', "content", meta.canonical);
  setOrCreate('meta[property="og:type"]', "content", "website");
  setOrCreate('meta[property="og:site_name"]', "content", "Zalemba");
  setOrCreate('meta[name="twitter:card"]', "content", "summary_large_image");
  setOrCreate('meta[name="twitter:title"]', "content", meta.title);
  setOrCreate('meta[name="twitter:description"]', "content", meta.description);

  let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = meta.canonical;
}

function App() {
  const route = useRoute();

  useEffect(() => {
    setMeta(route.path);
  }, [route.path]);

  let page: React.ReactNode;
  if (route.path === "/") {
    page = <Home />;
  } else if (matchRoute("/create/$type", route.path)) {
    page = <Create />;
  } else if (route.path === "/image-to-text") {
    page = <ImageToText />;
  } else if (matchRoute("/landing/$slug", route.path)) {
    page = <Landing />;
  } else if (route.path === "/login" || route.path === "/signup" || route.path === "/forgot-password") {
    page = <Login />;
  } else if (route.path === "/reset-password") {
    page = <ResetPassword />;
  } else if (route.path === "/account") {
    page = <Account />;
  } else {
    page = (
      <div className="min-h-screen bg-hero flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-7xl font-bold text-foreground">404</h1>
          <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
          <a href="#/" className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Go home
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      {page}
      <Toaster position="top-center" />
    </>
  );
}

export default App;
