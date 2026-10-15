import { useRef, useState } from "react";

export function useSpeech(onText: (t: string) => void) {
  const [listening, setListening] = useState(false);
  const rec = useRef<any>(null);

  const toggle = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Voice input isn't supported on this browser. Try Chrome on Android.");
      return;
    }
    if (listening) {
      rec.current?.stop();
      return;
    }
    const r = new SR();
    r.lang = "en-ZM";
    r.interimResults = false;
    r.onresult = (e: any) => onText(Array.from(e.results).map((x: any) => x[0].transcript).join(" "));
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    rec.current = r;
    r.start();
    setListening(true);
  };
  return { listening, toggle };
}
