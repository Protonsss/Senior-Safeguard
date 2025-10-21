#!/usr/bin/env python3
"""
TTS Server for Cloud Deployment (Linux/Docker compatible)
Uses gTTS (Google Text-to-Speech) - FREE and cross-platform
"""

from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import tempfile
import os

try:
    from gtts import gTTS
    GTTS_AVAILABLE = True
except ImportError:
    GTTS_AVAILABLE = False
    print("⚠️  gTTS not installed. Run: pip install gTTS")

class TTSHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        if self.path == '/tts':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                text = data.get('text', '')
                language = data.get('language', 'en')
                
                if not text:
                    self.send_error(400, 'Missing text parameter')
                    return
                
                if not GTTS_AVAILABLE:
                    self.send_error(500, 'gTTS library not installed')
                    return
                
                # Map our language codes to gTTS language codes
                lang_map = {
                    'en': 'en',    # English
                    'zh': 'zh-CN', # Mandarin Chinese
                    'hi': 'hi',    # Hindi
                    'ta': 'ta',    # Tamil
                }
                
                gtts_lang = lang_map.get(language, 'en')
                
                print(f'[TTS] Generating speech for: {text[:50]}... (language: {gtts_lang})')
                
                # Generate speech using gTTS
                with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as tmp:
                    tmp_path = tmp.name
                
                try:
                    # Create gTTS object with slow=False for normal speed
                    tts = gTTS(text=text, lang=gtts_lang, slow=False)
                    tts.save(tmp_path)
                    
                    # Read generated audio
                    with open(tmp_path, 'rb') as f:
                        audio_data = f.read()
                    
                    # Clean up
                    os.unlink(tmp_path)
                    
                    # Send response (MP3 format)
                    self.send_response(200)
                    self.send_header('Content-Type', 'audio/mpeg')
                    self.send_header('Content-Length', str(len(audio_data)))
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(audio_data)
                    
                    print(f'[TTS] ✅ Successfully generated {len(audio_data)} bytes of audio')
                
                except Exception as e:
                    print(f'[TTS] ❌ Error generating audio: {str(e)}')
                    self.send_error(500, f'Error generating speech: {str(e)}')
                    if os.path.exists(tmp_path):
                        os.unlink(tmp_path)
            
            except Exception as e:
                print(f'[TTS] ❌ Request error: {str(e)}')
                self.send_error(500, str(e))
        
        elif self.path == '/health':
            # Health check endpoint
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = json.dumps({
                'status': 'healthy',
                'gtts_available': GTTS_AVAILABLE
            })
            self.wfile.write(response.encode())
        
        else:
            self.send_error(404, 'Not found')
    
    def do_GET(self):
        """Health check endpoint"""
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = json.dumps({
                'status': 'healthy',
                'gtts_available': GTTS_AVAILABLE
            })
            self.wfile.write(response.encode())
        else:
            self.send_error(404, 'Not found')

def run_server(port=8765):
    server_address = ('', port)
    httpd = HTTPServer(server_address, TTSHandler)
    print(f'🎙️  TTS Server (Cloud) running on port {port}')
    print(f'✅ gTTS library: {"Available" if GTTS_AVAILABLE else "Not installed"}')
    print(f'📡 Health check: http://localhost:{port}/health')
    print(f'🌐 TTS endpoint: http://localhost:{port}/tts')
    httpd.serve_forever()

if __name__ == '__main__':
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.getenv('PORT', 8765))
    run_server(port)

