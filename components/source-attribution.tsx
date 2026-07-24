type Props = { name: string; url: string };

export function SourceAttribution({ name, url }: Props) {
  return (
    <aside className="mt-6 rounded-2xl border border-ink-4/20 bg-bg-soft px-5 py-4 text-sm text-ink-2">
      <p>
        Bài viết này tổng hợp góc nhìn FinHome dựa trên thông tin từ{" "}
        <strong className="text-ink">{name}</strong>. Nội dung chi tiết thuộc về
        đơn vị xuất bản gốc.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex font-medium text-primary underline-offset-4 hover:underline"
      >
        Đọc bài gốc trên {name} →
      </a>
    </aside>
  );
}
