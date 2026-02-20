#!/usr/bin/env python3
"""
HabaCasa Landing Page Server
Serves the landing page on port 8095
"""

import http.server
import socketserver
import os
import sys

PORT = 8095
DIRECTORY = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {args[0]}")
    
    def end_headers(self):
        # Add CORS and caching headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()


def main():
    os.chdir(DIRECTORY)
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🏠 HabaCasa Landing Page Server                            ║
║                                                              ║
║   Local:    http://localhost:{PORT}                           ║
║   Network:  http://0.0.0.0:{PORT}                             ║
║                                                              ║
║   Press Ctrl+C to stop                                       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
""")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Server stopped.")
            sys.exit(0)


if __name__ == "__main__":
    main()
