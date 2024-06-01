import requests
import json
import Summary

import Key

class STT():
    def __init__(self):
        self.invoke_url = Key.SPEECH_INVOKE_URL
        self.secret_key = Key.SPEECH_SECRET_KEY

    def recognize(self, file, completion='sync', callback=None, userdata=None, forbiddens=None, boostings=None, 
               wordAlignment=True, fullText=True, diarization=None, sed=None):
    
        request_body = {
            'language': 'ko-KR',
            'completion': completion,
            'callback': callback,
            'userdata': userdata,
            'wordAlignment': wordAlignment,
            'fullText': fullText,
            'forbiddens': forbiddens,
            'boostings': boostings,
            'diarization': diarization,
            'sed': sed,
        }
    
        headers = {
            'Accept': 'application/json;UTF-8',
            'X-CLOVASPEECH-API-KEY': self.secret_key
        }
    
        print(json.dumps(request_body, ensure_ascii=False).encode('UTF-8'))
    
        files = {
            'media': open(file, 'rb'),
            'params': (None, json.dumps(request_body, ensure_ascii=False).encode('UTF-8'), 'application/json')
        }

        response = requests.post(url=self.invoke_url + '/recognizer/upload', headers=headers, files=files)
        
        # JSON 결과
        result = response.json()

        # JSON 결과에서 화자별 텍스트를 시간 순서대로 추출
        segments = result.get('segments', [])
        all_texts = []

        for segment in segments:
            speaker_name = segment['speaker']['name']
            text = segment['text']
            start_time = segment['start']
            all_texts.append((start_time, speaker_name, text))

        # 모든 텍스트를 시간 순서대로 정렬
        all_texts.sort(key=lambda x: x[0])
        # 정렬된 텍스트를 하나의 문자열로 저장
        final_text = "\n".join(f"{speaker_name}: {text}" for _, speaker_name, text in all_texts)
             
        # # result.txt 파일에 저장
        # with open('원본.txt', 'w', encoding='utf-8') as file:
        #     file.write(final_text)

        return final_text
