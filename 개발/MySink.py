import discord
from io import BytesIO

class CustomAudioSink(discord.sinks.Sink):
    def __init__(self, *, filters=None):
        super().__init__(filters=filters)
        self.combined_audio = BytesIO()  # 모든 사용자의 오디오를 저장할 단일 스트림

    def write(self, data, user):        
        # 모든 사용자의 데이터를 하나의 BytesIO 객체에 저장
        self.combined_audio.write(data)

    def cleanup(self):        
        self.combined_audio.seek(0)  # 파일 저장 전 스트림 리셋


    def get_all_audio(self):
        # return [stream for stream in self.audio_files.values()]
        return self.combined_audio
