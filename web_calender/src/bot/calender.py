import discord  
import os
import requests
from dotenv import load_dotenv

# .env 파일에서 환경 변수 로드
load_dotenv()

# 봇 토큰 설정
TOKEN = os.getenv('DISCORD_TOKEN')
URL = "https://665d47760761dd006eb9b4c6--discord-summary-calendar.netlify.app/"
CHANNEL_ID = int(os.getenv('DISCORD_CHANNEL_ID'))  # 채널 ID 

class MyClient(discord.Client):
    async def on_ready(self):
        print('Logged on as {0}!'.format(self.user))
        await self.change_presence(status=discord.Status.online, activity=discord.Game("대기중"))

        # 봇 연결시 디코 채팅 전송 메시지
        channel = self.get_channel(CHANNEL_ID)
        if channel:
            await channel.send('https://665d47760761dd006eb9b4c6--discord-summary-calendar.netlify.app/')
        else:
            print(f"Error: Channel ID {CHANNEL_ID} not found.")
    #메세지 입력
    async def on_message(self, message):
        if message.author == self.user:
            return
        
        # /create_channel 명령어 처리
        if message.content.startswith('/create_channel'):
            try:
                _, channel_name = message.content.split(' ', 1)
                guild = message.guild
                existing_channel = discord.utils.get(guild.channels, name=channel_name)
                if not existing_channel:
                    print(f'Creating a new channel: {channel_name}')
                    await guild.create_text_channel(channel_name)
                    await message.channel.send(f'채널 "{channel_name}"이(가) 생성되었습니다.')
                else:
                    await message.channel.send(f'채널 "{channel_name}"은(는) 이미 존재합니다.')
            except Exception as e:
                await message.channel.send(f'채널 생성 중 오류가 발생했습니다: {str(e)}')
                                        
        # !설명 명령어 처리
        if message.content.startswith('!설명'):
            await message.channel.send("Calender 기본 웹페이지 입니다")
            await message.channel.send("https://665d47760761dd006eb9b4c6--discord-summary-calendar.netlify.app/")
            await message.channel.send("/create_channel <채널이름>  을 통해서 calender의 내용을 저장 할 채널을 만들어주세요, 내용은 url로 저장됩니다") 
        # !알정 명령어 처리
        elif message.content.startswith('!일정'):
            try:
                _, teamname, password = message.content.split(' ')
                response = requests.post(f'{URL}/login', json={
                    'teamname': teamname,
                    'password': password
                })
                if response.status_code == 200:
                    await message.channel.send(f'Login 성공 \n{teamname}팀의 발전을 기원합니다 ')
                else:
                    await message.channel.send(f'Login 실패: {response.text}')
            except ValueError:
                await message.channel.send('Usage: /login <teamname> <password>')
            except Exception as e:
                await message.channel.send(f'An error occurred: {str(e)}')
        
        # 사용법
        elif message.content == '/사용법':
            await message.channel.send('/logon <teamname> <password>\n/login <teamname> <password>')
        else:
            await message.channel.send('Unknown command. Use /사용법 for available commands.')

# 봇 실행
print("Starting the bot...")
intents = discord.Intents.default()
intents.message_content = True
client = MyClient(intents=intents)
client.run(TOKEN)