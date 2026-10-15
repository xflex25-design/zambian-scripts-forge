import { useEffect } from "react";
import { Toaster } from "sonner";
import { useRoute, matchRoute } from "@/lib/router";
import { Home } from "@/pages/Home";
import { Create } from "@/pages/Create";
import { ImageToText } from "@/pages/ImageToText";
import { Landing, LANDINGS } from "@/pages/Landing";
import { getDocType } from "@/lib/documents";

const SITE_URL = "https://zalemba.lovable.app";

type MetaInfo = { title: string; description: string; canonical: string };

function getMeta(path: string): MetaInfo {
  if (path === "/") {
    return {
      title: "Zalemba – AI Letter and Document Generator in Zambia",
      description: "Create professional letters, CVs, student appeals and formal documents with Zalemba. Answer a few simple questions and generate your document online.",
      canonical: `${SITE_URL}/`,
    };
  }
  const createMatch = matchRoute("/create/$type", path);
  if (createMatch) {
    const t = getDocType(createMatch.type);
    if (t) {
      return { title: t.seo.title, description: t.seo.description, canonical: `${SITE_URL}/create/${t.id}` };
    }
  }
  const landingMatch = matchRoute("/landing/$slug", path);
  if (landingMatch) {
    const l = LANDINGS[landingMatch.slug];
    if (l) {
      return { title: l.metaTitle, description: l.metaDescription, canonical: `${SITE_URL}/landing/${l.slug}` };
    }
  }
  if (path === "/image-to-text") {
    return {
      title: "Image to Text Converter — Free OCR Online | Zalemba",
      description: "Upload an image or screenshot and extract its text instantly. Free image to text converter with OCR — edit, copy, download, or use the text to create a document.",
      canonical: `${SITE_URL}/image-to-text`,
    };
  }
  return {
    title: "Zalemba – AI Letter and Document Generator in Zambia",
    description: "Create professional letters, CVs, student appeals and formal documents with Zalemba.",
    canonical: SITE_URL,
  };
}

function setMeta(path: string) {
  const meta = getMeta(path);
  document.title = meta.title;

  const setOrCreate = (selector: string, attr: string, value: string) => {
    let el = document.head.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement("meta");
      const [, name] = selector.match(/\[(.+?)="(.+?)"\]/)?.slice(1) ?? [null, null];
      if (selector.startsWith("meta[name")) {
        el.setAttribute("name", selector.match(/name="(.+?)"/)?.[1] ?? "");
      } else if (selector.startsWith("meta[property")) {
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
