#!/usr/bin/env python3
"""
TTS Server using macOS native 'say' command.
FREE - No API costs. Uses best available macOS voices.
"""

from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import tempfile
import os
import subprocess

class TTSHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/tts':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                text = data.get('text', '')
                language = data.get('language', 'en')
                voice_name = data.get('voice')
                
                if not text:
                    self.send_error(400, 'Missing text parameter')
                    return
                
                # Use SYSTEM DEFAULT voice (respects user's macOS setting!)
                # If user set a voice in System Settings, use that
                # This way we use whatever premium voice they downloaded
                voice_map = {
                    'en': None,         # Use system default for English
                    'zh': 'Tingting',   # Mandarin Chinese
                    'hi': 'Lekha',      # Hindi
                    'ta': 'Vani',       # Tamil
                }
                
                # Select voice - None means use system default
                selected_voice = voice_name if voice_name else voice_map.get(language, None)
                
                print(f'[TTS] Using voice: {selected_voice} for language: {language}')
                print(f'[TTS] Text: {text[:50]}...')
                
                # Generate audio using macOS 'say' command
                # Rate: 160 words per minute (slower for seniors)
                with tempfile.NamedTemporaryFile(suffix='.aiff', delete=False) as tmp:
                    tmp_path = tmp.name
                
                try:
                    # Use 'say' command with rate adjustment (160 wpm for seniors)
                    if selected_voice:
                        # Specific voice requested
                        subprocess.run(
                            ['say', '-v', selected_voice, '-r', '160', '-o', tmp_path, text],
                            check=True,
                            capture_output=True,
                            text=True
                        )
                    else:
                        # Use macOS system default voice (respects user's preference!)
                        print(f'[TTS] Using macOS system default voice for: {text[:50]}...')
                        subprocess.run(
                            ['say', '-r', '160', '-o', tmp_path, text],
                            check=True
                        )
                except subprocess.CalledProcessError as e:
                    # If voice not found, fallback to system default
                    print(f'Voice {selected_voice} not found, using system default: {e.stderr}')
                    subprocess.run(
                        ['say', '-r', '160', '-o', tmp_path, text],
                        check=True
                    )
                
                # Convert AIFF to WAV for better browser compatibility
                wav_path = tmp_path.replace('.aiff', '.wav')
                subprocess.run(
                    ['afconvert', '-f', 'WAVE', '-d', 'LEI16@22050', tmp_path, wav_path],
                    check=True
                )
                
                # Read generated audio
                with open(wav_path, 'rb') as f:
                    audio_data = f.read()
                
                # Clean up
                os.unlink(tmp_path)
                os.unlink(wav_path)
                
                # Send response (WAV format for browser compatibility)
                self.send_response(200)
                self.send_header('Content-Type', 'audio/wav')
                self.send_header('Content-Length', str(len(audio_data)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(audio_data)
                
            except Exception as e:
                print(f'TTS Error: {e}')
                import traceback
                traceback.print_exc()
                self.send_error(500, str(e))
        else:
            self.send_error(404)
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def log_message(self, format, *args):
        # Custom logging
        print(f'[TTS Server] {format % args}')

def run_server(port=8765):
    server_address = ('127.0.0.1', port)
    httpd = HTTPServer(server_address, TTSHandler)
    print(f'🎙️  TTS Server running on http://127.0.0.1:{port}')
    print(f'✅ Using macOS NSSpeechSynthesizer for high-quality voices')
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()

