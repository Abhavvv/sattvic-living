"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const RichTextEditorInternal = dynamic(
  () => import("./RichTextEditorInternal"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[350px] border border-primary-sage/20 rounded-xl bg-secondary-cream/35 flex items-center justify-center text-primary-sage gap-2">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-xs uppercase font-bold tracking-widest">
          Loading Sacred Editor...
        </span>
      </div>
    ),
  }
);

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  return <RichTextEditorInternal content={content} onChange={onChange} />;
}
