type Props = { name: string; url: string };

export function SourceAttribution({ name, url }: Props) {
  return (
    <aside className="mt-6 rounded-2xl border border-ink-4/20 bg-bg-soft px-5 py-4 text-sm text-ink-2">
      <p>
        Bài viết của FinHome, tổng hợp và diễn giải dựa trên thông tin từ{" "}
        <strong className="text-ink">{name}</strong>.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex rounded-full bg-primary px-4 py-2 font-medium text-white transition-opacity hover:opacity-90"
      >
        Xem nguồn gốc trên {name} →
      </a>
    </aside>
  );
}
