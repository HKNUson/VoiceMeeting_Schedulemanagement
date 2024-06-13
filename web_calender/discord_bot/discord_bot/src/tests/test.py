import discord  
import os
import requests
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from PIL import Image
import io

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
            await self.capture_and_send(channel, URL)
        else:
            print(f"Error: Channel ID {CHANNEL_ID} not found.")
        
    # 메시지 입력
    async def on_message(self, message):
        if message.author == self.user:
            return

        # !capture 명령어 처리
        if message.content.startswith('!capture'):
            await self.capture_and_send(message.channel, URL)
        
        # 기타 명령어 처리...

    async def capture_and_send(self, channel, url):
        # ChromeOptions 설정
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')

        # ChromeDriver 경로 설정
        chrome_service = Service(executable_path='/usr/local/bin/chromedriver')  # chromedriver 경로 지정

        try:
            # Selenium을 사용하여 웹페이지 캡처
            driver = webdriver.Chrome(service=chrome_service, options=chrome_options)
            driver.get(url)
            screenshot = driver.get_screenshot_as_png()
            driver.quit()

            # 이미지를 디스코드 채널에 전송
            image = Image.open(io.BytesIO(screenshot))
            with io.BytesIO() as image_binary:
                image.save(image_binary, 'PNG')
                image_binary.seek(0)
                await channel.send(file=discord.File(fp=image_binary, filename='screenshot.png'))
        except Exception as e:
            print(f"An error occurred while capturing the webpage: {str(e)}")

# 봇 실행
print("Starting the bot...")
intents = discord.Intents.default()
intents.message_content = True
client = MyClient(intents=intents)
client.run(TOKEN)
