#!/usr/bin/env python3
"""Static server cho bản mirror Framer.

Framer hydrate xong sẽ request ảnh kèm query string, vd:
    /images/abc.png?scale-down-to=512&width=2000&height=1333
nhưng file tải về tên là:
    images/abc.png@width=2000&height=1333   (wget đổi ? -> @)

Server này bỏ query string; nếu không thấy file đúng tên thì tìm file
cùng thư mục có dạng "<tên>@..." và phục vụ file đó (mọi biến thể size
đều trỏ về 1 file đã tải -> đủ để xem giống bản gốc).
"""
import os
import urllib.parse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = 8899
ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Bỏ query string và fragment
        path = path.split("?", 1)[0].split("#", 1)[0]
        rel = urllib.parse.unquote(path).lstrip("/")
        full = os.path.join(ROOT, rel)

        if os.path.isfile(full):
            return full

        # Thử khớp file biến thể: "<tên>@..."
        directory = os.path.dirname(full)
        base = os.path.basename(full)
        if base and os.path.isdir(directory):
            prefix = base + "@"
            for name in os.listdir(directory):
                if name == base or name.startswith(prefix):
                    return os.path.join(directory, name)

        return full  # để super trả 404 nếu thật sự không có

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    os.chdir(ROOT)
    print(f"Serving {ROOT} at http://localhost:{PORT}")
    ThreadingHTTPServer(("", PORT), Handler).serve_forever()
