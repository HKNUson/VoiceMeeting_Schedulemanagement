import subprocess
from io import BytesIO

def encode_audio(audio_data, output_filename):
    temp_filename = 'temp.raw'
    with open(temp_filename, 'wb') as f:
        f.write(audio_data.getvalue())

    # ffmpeg를 사용하여 MP3 형식으로 인코딩
    command = [
        'ffmpeg',
        '-y',  # 기존의 파일 덮어쓰기
        '-f', 's16le',  # 원본 포맷이 raw audio인 경우
        '-ar', '48000',  # 샘플 레이트
        '-ac', '2',  # 채널 수
        '-i', temp_filename,  # 입력 파일
        '-bufsize', '350k',  # 버퍼 크기를 350KB로 설정 (256KB ~ 512KB)
        '-c:a', 'flac',  # 오디오 코덱으로 FLAC 사용
        output_filename  # 출력 파일
    ]
    subprocess.run(command, check=True)

    return output_filename