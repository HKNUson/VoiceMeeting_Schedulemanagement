import discord
import os
from collections import defaultdict
import time

## 녹음 처리
class RecordingSink(discord.sinks.PCMSink):
    def __init__(self):
        super().__init__()
        self.audio_data = defaultdict(list)
        self.start_time = time.time()

    def write(self, data, user_id):
        current_time = time.time() - self.start_time
        self.audio_data[user_id].append((current_time, data))

    def cleanup(self):
        for user_id, data_list in self.audio_data.items():
            file_path = f"recorded_audio_{user_id}.pcm"
            with open(file_path, "wb") as f:
                for timestamp, data in data_list:
                    f.write(data)

    def get_finished_audio_files(self):
        file_paths = []
        for user_id in self.audio_data.keys():
            file_path = f"recorded_audio_{user_id}.pcm"
            file_paths.append(file_path)
        return file_paths
