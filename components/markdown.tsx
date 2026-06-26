import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders a markdown string with Tailwind typography styling. */
export function Markdown({ source }: { source: string }) {
  return (
    <div className="prose prose-neutral max-w-none prose-headings:font-display prose-headings:text-ink prose-a:text-primary prose-img:rounded-2xl">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{source}</ReactMarkdown>
    </div>
  );
}
