import os
import math
import struct
import wave

AUDIO_TRACKS = [
    ("rajamati.wav", "Rajamati - Traditional Newar Folk Ballad", 440.0),
    ("silu.wav", "Silu - Pilgrimage Ballad of Gosaikunda", 392.0),
    ("sitala_maju.wav", "Sitala Maju - Historical Ballad", 349.23),
    ("ji_waya_la.wav", "Ji Waya La Lachhi Maduni - Tragedy Ballad", 329.63),
    ("ghatu.wav", "Ghatu - Summer Seasonal Melody", 523.25),
    ("mohani.wav", "Mohani - Seasonal Dashain Tune", 587.33),
    ("wala_wala.wav", "Wala Wala Pulu Kishi - Indra Jatra Song", 659.25),
    ("yomari_maku.wav", "Yomari Maku - Yomari Punhi Song", 698.46),
    ("holi_ya_mela.wav", "Holi ya Mela - Spring Color Festival Song", 783.99),
    ("gunla_bajan.wav", "Gunla Bajan - Buddhist Sacred Music", 440.0),
    ("malshree_dhun.wav", "Malshree Dhun - Royal Dashain Hymn", 523.25),
    ("dapha_bhajan.wav", "Dapha Bhajan - Temple Devotional Recital", 392.0)
]

FRONTEND_AUDIO_DIR = os.path.abspath("../frontend/public/assets/audio")
BACKEND_AUDIO_DIR = os.path.abspath("static/audio")
UPLOADS_AUDIO_DIR = os.path.abspath("static/uploads")

os.makedirs(FRONTEND_AUDIO_DIR, exist_ok=True)
os.makedirs(BACKEND_AUDIO_DIR, exist_ok=True)
os.makedirs(UPLOADS_AUDIO_DIR, exist_ok=True)

def generate_pentatonic_melody(filename, base_freq):
    sample_rate = 44100
    duration = 5.0
    total_samples = int(sample_rate * duration)
    
    scale = [1.0, 1.125, 1.333, 1.5, 1.777, 2.0]
    
    frontend_path = os.path.join(FRONTEND_AUDIO_DIR, filename)
    backend_path = os.path.join(BACKEND_AUDIO_DIR, filename)
    uploads_path = os.path.join(UPLOADS_AUDIO_DIR, filename)

    audio_bytes = bytearray()
    
    for i in range(total_samples):
        t = i / sample_rate
        note_idx = int(t * 4) % len(scale)
        freq = base_freq * scale[note_idx]
        
        note_t = (t * 4) % 1.0
        envelope = math.sin(math.pi * note_t) * math.exp(-note_t * 0.5)
        
        sample = (
            0.6 * math.sin(2 * math.pi * freq * t) +
            0.3 * math.sin(2 * math.pi * freq * 2 * t) +
            0.1 * math.sin(2 * math.pi * freq * 3 * t)
        ) * envelope * 0.4
        
        pcm_val = int(sample * 32767)
        pcm_val = max(-32768, min(32767, pcm_val))
        audio_bytes.extend(struct.pack('<h', pcm_val))
        
    for path in [frontend_path, backend_path, uploads_path]:
        with wave.open(path, 'wb') as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(audio_bytes)

def main():
    print("Generating audio assets for folk songs...")
    for filename, title, freq in AUDIO_TRACKS:
        generate_pentatonic_melody(filename, freq)
        print(f"  [+] Created audio asset: {filename} ({title})")
    print("All audio assets generated successfully.")

if __name__ == "__main__":
    main()
