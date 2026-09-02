#!/usr/bin/env python3
"""
Simple HTTP Server para servir el frontend
Ejecutar: python server.py
Acceder a: http://localhost:8080
"""

import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

PORT = 8080
FRONTEND_DIR = Path(__file__).parent

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(FRONTEND_DIR), **kwargs)
    
    def end_headers(self):
        # Agregar headers para prevenir cache
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        super().end_headers()
    
    def log_message(self, format, *args):
        # Log personalizado
        print(f"[{self.log_date_time_string()}] {format % args}")

if __name__ == "__main__":
    os.chdir(FRONTEND_DIR)
    
    handler = MyHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print(f" Servidor Frontend iniciado!")
            print(f" URL: http://localhost:{PORT}")
            print(f" Directorio: {FRONTEND_DIR}")
            print(f"\n Presiona Ctrl+C para detener el servidor\n")
            
            # Abrir navegador automáticamente
            webbrowser.open(f'http://localhost:{PORT}', new=2)
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n Servidor detenido")
    except OSError as e:
        print(f"\n Error: {e}")
        print(f"El puerto {PORT} podría estar en uso. Intenta con otro puerto.")
