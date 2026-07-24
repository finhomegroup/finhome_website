import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const components: Components = {
  a: ({ href, children }) => {
    const external = href?.startsWith("http");
    return (
      <a
        href={href}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {children}
      </a>
    );
  },
};

export function Markdown({ source }: { source: string }) {
  return (
    <div className="prose prose-neutral max-w-none prose-headings:font-display prose-headings:text-ink prose-a:text-primary prose-img:rounded-2xl prose-pre:overflow-x-auto [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
