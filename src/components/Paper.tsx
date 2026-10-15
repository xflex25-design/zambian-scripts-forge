import type { ZDoc } from "@/lib/documents";
import { cn } from "@/lib/utils";

function Placeholder({ w }: { w: string }) {
  return <span className={cn("block h-2 rounded-full bg-muted", w)} />;
}

export function Paper({ doc, className, live }: { doc: ZDoc; className?: string; live?: boolean }) {
  return (
    <article
      className={cn(
        "print-area mx-auto w-full rounded-lg bg-paper px-6 py-8 font-doc text-[13px] leading-relaxed text-paper-ink shadow-paper sm:px-10 sm:py-12 sm:text-[14px]",
        className,
      )}
    >
      {doc.text ? (
        <pre className="whitespace-pre-wrap font-doc">{doc.text}</pre>
      ) : (
        <>
          <div className="ml-auto w-fit text-right">
            {doc.from.length ? doc.from.map((l, i) => <div key={i}>{l}</div>) : <Placeholder w="w-28 ml-auto" />}
            <div className="mt-3">{doc.date}</div>
          </div>
          <div className="mt-6 font-semibold">
            {doc.to.length ? doc.to.map((l, i) => <div key={i}>{l}</div>) : <div className="space-y-1.5"><Placeholder w="w-40" /><Placeholder w="w-28" /></div>}
          </div>
          <p className="mt-5">{doc.salutation}</p>
          <p className="mt-4 font-bold underline underline-offset-2">{doc.subject}</p>
          <div className="mt-4 space-y-3 text-justify">
            {doc.paragraphs.length ? (
              doc.paragraphs.map((p, i) => <p key={i}>{p}</p>)
            ) : live ? (
              <div className="space-y-2 py-1">
                <Placeholder w="w-full" /><Placeholder w="w-11/12" /><Placeholder w="w-full" /><Placeholder w="w-3/4" />
                <div className="h-2" />
                <Placeholder w="w-full" /><Placeholder w="w-5/6" />
              </div>
            ) : null}
          </div>
          <p className="mt-6">{doc.closing}</p>
          {doc.name && <p className="mt-6 font-doc text-xl italic text-primary/80 print:text-paper-ink">{doc.name}</p>}
          <p className="mt-1">{doc.name}</p>
          {doc.footer.map((l, i) => <p key={i}>{l}</p>)}
        </>
      )}
    </article>
  );
}
