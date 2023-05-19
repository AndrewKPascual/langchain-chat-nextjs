import os
import sys
import openai


print("Transcribe.py script started.1")

openai.api_key = os.getenv("OPENAI_API_KEY")

print("Transcribe.py script started.2")

def transribe_audio(file_path):
    audio_file = open(file_path, "rb")
    return openai.Audio.transcribe("whisper-1", file)

if __name__ == "__main__":
    file_path = sys.argv[1]
    print(transribe_audio(file_path))