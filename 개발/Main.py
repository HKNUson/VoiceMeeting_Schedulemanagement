import discord  # py-cord 사용
from discord.ext import commands
import os

import Token
import MySink
import Encoding

## PC가 Opus를 못읽어서 별도작성
def load_opus():
    if not discord.opus.is_loaded():
        discord.opus.load_opus('/opt/homebrew/lib/libopus.dylib')
load_opus()


## 봇 설정
TOKEN = Token.DISCORD_TOKEN
bot = commands.Bot(command_prefix='!', intents=discord.Intents.all())

## 봇이 준비되면 콘솔에 메시지 출력
@bot.event
async def on_ready():
    print(f'{bot.user.name} 디스코드 연결 완료!')


## 명령어가 잘 먹히는지 테스트할려고 만듬
@bot.command(name='안녕')
async def hello(ctx):
    await ctx.send('반가워~')


## 음성 녹음 시작
@bot.command(name='음성녹음시작')
async def start(ctx):
    # 사용자가 음성채널에 존재하는지 확인
    if ctx.author.voice is None:
        await ctx.send("음성 채널에 먼저 들어가세요.")
        return
    
    # 사용자가 있는 음성채널에 연결하고 녹음 시작
    channel = ctx.author.voice.channel
    voice_client = await channel.connect()
    voice_client.start_recording(MySink.RecordingSink(), finished_callback, ctx)
    await ctx.send("음성 녹음을 시작합니다.")


## 음성 녹음 종료
@bot.command(name='음성녹음종료')
async def stop(ctx):
    voice_client = ctx.guild.voice_client
    
    # 봇이 음성채널에 있는지 확인
    if not voice_client or not voice_client.is_connected():
        await ctx.send("봇이 음성 채널에 연결되어 있지 않습니다.")
        return

    voice_client.stop_recording()   # 녹음 중지
    await ctx.send("음성 녹음을 종료합니다.")
    await voice_client.disconnect() # 봇이 음성채널에서 퇴장

## 녹음 종료 시 호출되는 콜백 함수
async def finished_callback(sink, ctx):
    raw_audio_files = sink.get_finished_audio_files()   # 녹음된 파일
    flac_file = Encoding.convert_to_flac(raw_audio_files)   # .flac로 변환
    
    # 현재는 디스코드에 파일을 올리도록 했는데
    # 음성인식으로 넘어가도록 할 예정
    await ctx.send(file=discord.File(flac_file))
    for file in raw_audio_files:
        os.remove(file)

bot.run(TOKEN)
