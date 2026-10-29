"""Preview the homepage's HTML-only Jekyll page without installing Ruby gems."""
import argparse
import functools
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def render():
    page = (ROOT / '_pages/about.md').read_text()
    if not page.startswith('---\n'):
        raise ValueError('Missing Jekyll front matter')
    _, _, body = page.split('---', 2)
    layout = (ROOT / '_layouts/homepage.html').read_text()
    if layout.count('{{ content }}') != 1:
        raise ValueError('Expected exactly one layout content slot')
    return layout.replace('{{ content }}', body.strip()).encode()


class PreviewHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.split('?', 1)[0] in ('/', '/index.html', '/about/', '/about.html'):
            html = render()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(html)))
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            self.wfile.write(html)
        elif self.path.startswith(('/assets/', '/images/')):
            super().do_GET()
        else:
            self.send_error(404)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8765)
    args = parser.parse_args()
    handler = functools.partial(PreviewHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(('127.0.0.1', args.port), handler)
    print(f'Local homepage preview: http://127.0.0.1:{args.port}', flush=True)
    server.serve_forever()
