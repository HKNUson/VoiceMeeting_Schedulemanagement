import subprocess

## PCM파일을 flac파일로 변환
def convert_to_flac(input_files):
    output_file = "recorded_audio.flac"
    inputs = []
    filters = []
    for i, input_file in enumerate(input_files):
        inputs.extend(["-f", "s16le", "-ar", "48000", "-ac", "2", "-i", input_file])
        filters.append(f"[{i}:a]")

    filter_complex = "".join(filters) + f"amix=inputs={len(input_files)}:duration=longest[a]"

    command = ["ffmpeg", "-y"] + inputs + ["-filter_complex", filter_complex, "-map", "[a]", "-c:a", "flac", output_file]
    subprocess.run(command, check=True)
    return output_file
