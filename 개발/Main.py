import discord
from discord.ext import commands
def load_opus():    # 내 pc가 opus를 못읽어서 따로 추가했음
    if not discord.opus.is_loaded():
        # libopus.dylib의 경로를 지정합니다.
        discord.opus.load_opus('/opt/homebrew/lib/libopus.dylib')
load_opus()

import Token
import MySink
import Encoding as ec

## 봇 설정
TOKEN = Token.DISCORD_TOKEN
bot = commands.Bot(command_prefix='!', intents= discord.Intents.all())


## on되면 콘솔창에 봇 이름 출력
@bot.event
async def on_ready():
    print(f'{bot.user.name} 디스코드 연결 완료!')


## 명령어 잘 먹히는지 테스트
@bot.command(name='안녕')
async def hello(ctx):
    await ctx.send('반가워~')


## 음성채널에 들어가서 음성 녹음을 시작
@bot.command(name='음성녹음시작')
async def joinAndRecordStart(ctx):
    if ctx.author.voice and ctx.author.voice.channel:
        vc = await ctx.author.voice.channel.connect()
        sink = MySink.CustomAudioSink()
        vc.start_recording(sink, finished_callback, ctx)
        await ctx.send('음성 녹음을 시작합니다.')
    else:
        await ctx.send('우선 음성 채널에 입장해주세요.')

async def finished_callback(sink, ctx):
    audio_data = sink.get_all_audio()
    if not audio_data.closed:
        output_filename = "combined_recorded_audio.flac"
        encoded_file_path = ec.encode_audio(audio_data, output_filename)
        await ctx.send(file=discord.File(encoded_file_path, filename=output_filename))
        audio_data.close()
    else:
        print("Error: Trying to access a closed file.")
    
    # all_audio_files = sink.get_all_audio()
    # for audio_file in all_audio_files:
    #     if not audio_file.closed:  # 스트림이 닫혀 있지 않은지 확인
    #         output_filename = "recorded_audio.mp3"
    #         encoded_file_path = ec.encode_audio(audio_file, output_filename)
    #         # 인코딩된 파일을 디스코드 채널에 전송
    #         await ctx.send(file=discord.File(encoded_file_path, filename=output_filename))
    #         audio_file.close()  # 파일 처리 후 스트림 닫기
    #     else:
    #         print("Error: Trying to access a closed file.")  # 스트림이 닫혔을 경우 로그 출력
    
    
## 음성 녹음을 종료하고 음성 채널에서 퇴장
@bot.command(name='음성녹음종료')
async def recordStopAndLeave(ctx):
    vc = ctx.guild.voice_client
    if vc and vc.is_connected():
        vc.stop_recording()
        await ctx.send('음성 녹음을 종료합니다.')
        await vc.disconnect()
        await ctx.send('음성 채널에서 퇴장했습니다.')
    else:
        await ctx.send('봇이 음성 채널에 입장하지 않았습니다.')


bot.run(TOKEN)
