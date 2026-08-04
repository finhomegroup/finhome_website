import type { Topic } from "./posts";

export const TOPICS: { id: Topic; label: string }[] = [
  { id: "gia-cung", label: "Giá & Cung" },
  { id: "cau-thanh-khoan", label: "Cầu & Thanh khoản" },
  { id: "khu-vuc-ha-tang", label: "Khu vực & Hạ tầng" },
  { id: "chinh-sach-su-kien", label: "Chính sách & Sự kiện" },
];

const LABEL_BY_ID = new Map(TOPICS.map((t) => [t.id, t.label]));

export function topicLabel(topic: Topic): string {
  return LABEL_BY_ID.get(topic) ?? topic;
}
