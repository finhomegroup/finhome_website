/**
 * Fetch og:image (or twitter:image) from each sourced blog post and save under
 * public/images/blog/<slug>.<ext>, then print cover path mappings.
 *
 * Usage: node scripts/fetch-blog-covers.mjs
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "images", "blog");

const POSTS = [
  {
    slug: "kha-nang-mua-nha-viet-nam-numbeo",
    url: "https://vnexpress.net/nguoi-viet-thuoc-nhom-kho-mua-nha-nhat-the-gioi-5072991.html",
  },
  {
    slug: "hon-30-nam-thu-nhap-de-mua-nha",
    url: "https://cafef.vn/nguoi-viet-can-hon-30-nam-thu-nhap-de-mua-duoc-nha-188260202110901204.chn",
  },
  {
    slug: "gioi-tre-mua-nha-thoi-bao-gia",
    url: "https://cafef.vn/gioi-tre-va-su-chuyen-dich-trong-quyet-dinh-mua-nha-thoi-bao-gia-188260531074034384.chn",
  },
  {
    slug: "chinh-sach-nha-o-thu-nhap-trung-binh",
    url: "https://vnexpress.net/thu-tuong-can-co-chinh-sach-nha-o-cho-nguoi-thu-nhap-trung-binh-5044253.html",
  },
  {
    slug: "gia-nha-phu-hop-thu-nhap-trung-binh",
    url: "https://vnexpress.net/gia-nha-bao-nhieu-phu-hop-voi-nguoi-thu-nhap-trung-binh-5046151.html",
  },
  {
    slug: "uu-tien-mua-nha-gia-phu-hop-tren-20-trieu",
    url: "https://vnexpress.net/thu-nhap-tren-20-trieu-dong-mot-thang-co-the-duoc-uu-tien-mua-nha-gia-phu-hop-5044245.html",
  },
  {
    slug: "vay-von-mua-nha-o-xa-hoi-dieu-kien",
    url: "https://luatvietnam.vn/dat-dai-nha-o/dieu-kien-va-chinh-sach-uu-dai-vay-von-mua-nha-o-xa-hoi-567-101470-article.html",
  },
  {
    slug: "ma-dinh-danh-dien-tu-bat-dong-san",
    url: "https://vnexpress.net/moi-bat-dong-san-se-co-ma-dinh-danh-dien-tu-rieng-tu-1-3-5001623.html",
  },
  {
    slug: "lai-suat-vay-mua-nha-neo-cao",
    url: "https://www.dnse.com.vn/senses/tin-tuc/lai-suat-cho-vay-mua-nha-tiep-tuc-tang-chua-co-hy-vong-giam-35237636",
  },
  {
    slug: "goi-tin-dung-uu-dai-nguoi-tre-duoi-35",
    url: "https://vnexpress.net/thu-tuong-de-nghi-co-goi-tin-dung-uu-dai-nha-o-cho-nguoi-khong-qua-35-tuoi-4848272.html",
  },
];

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

function extractMeta(html, prop) {
  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${prop}["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+name=["']${prop}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${prop}["']`,
      "i",
    ),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

function extFromUrlOrType(imageUrl, contentType) {
  const clean = imageUrl.split("?")[0].toLowerCase();
  if (clean.endsWith(".png")) return "png";
  if (clean.endsWith(".webp")) return "webp";
  if (clean.endsWith(".gif")) return "gif";
  if (clean.endsWith(".jpg") || clean.endsWith(".jpeg")) return "jpg";
  if (contentType?.includes("png")) return "png";
  if (contentType?.includes("webp")) return "webp";
  if (contentType?.includes("gif")) return "gif";
  return "jpg";
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html,*/*" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function downloadImage(imageUrl, destPath) {
  const res = await fetch(imageUrl, {
    headers: { "User-Agent": UA, Accept: "image/*,*/*" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for image ${imageUrl}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) throw new Error(`Image too small (${buf.length}b)`);
  await fs.writeFile(destPath, buf);
  return { bytes: buf.length, contentType: res.headers.get("content-type") };
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  const results = [];

  for (const post of POSTS) {
    process.stdout.write(`→ ${post.slug} ... `);
    try {
      const html = await fetchText(post.url);
      const imageUrl =
        extractMeta(html, "og:image") ||
        extractMeta(html, "twitter:image") ||
        extractMeta(html, "twitter:image:src");
      if (!imageUrl) throw new Error("No og:image / twitter:image found");

      const absolute = new URL(imageUrl, post.url).toString();
      const probe = await fetch(absolute, {
        method: "GET",
        headers: { "User-Agent": UA, Range: "bytes=0-0" },
        redirect: "follow",
      });
      const ext = extFromUrlOrType(absolute, probe.headers.get("content-type"));
      const filename = `${post.slug}.${ext}`;
      const dest = path.join(outDir, filename);
      const { bytes } = await downloadImage(absolute, dest);
      const cover = `/images/blog/${filename}`;
      console.log(`OK (${bytes} bytes) ${cover}`);
      results.push({ slug: post.slug, cover, sourceImage: absolute });
    } catch (err) {
      console.log(`FAIL: ${err.message}`);
      results.push({ slug: post.slug, error: err.message });
    }
  }

  const mapPath = path.join(outDir, "covers.json");
  await fs.writeFile(mapPath, JSON.stringify(results, null, 2));
  console.log(`\nWrote ${mapPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
