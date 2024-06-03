import json
import http.client
import Key

class CompletionExecutor:
    def __init__(self, texts):
        self._host = 'clovastudio.apigw.ntruss.com'
        self._api_key = Key.CLOVA_STUDIO_API_KEY
        self._api_key_primary_val = Key.CLOVA_STUDIO_API_GW_KEY
        self._request_id = Key.CLOVA_STUDIO_REQUEST_ID
        self._request_data = {
            "texts" : texts,
            "segMinSize" : 300,
            "includeAiFilters" : True,
            "autoSentenceSplitter" : True,
            "segCount" : -1,
            "segMaxSize" : 3000
        }

    def _send_request(self):
        headers = {
            'Content-Type': 'application/json; charset=utf-8',
            'X-NCP-CLOVASTUDIO-API-KEY': self._api_key,
            'X-NCP-APIGW-API-KEY': self._api_key_primary_val,
            'X-NCP-CLOVASTUDIO-REQUEST-ID': self._request_id
        }

        conn = http.client.HTTPSConnection(self._host)
        conn.request('POST', '/testapp/v1/api-tools/summarization/v2/9f37a0b218a1420ca616be7268803249', json.dumps(self._request_data), headers)
        response = conn.getresponse()
        result = json.loads(response.read().decode(encoding='utf-8'))
        conn.close()
        return result

    def execute(self):
        res = self._send_request()
        if res['status']['code'] == '20000':
            return res['result']['text']
        else:
            return 'Error'
