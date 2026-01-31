import urllib.request
import json

try:
    response = urllib.request.urlopen('http://127.0.0.1:8000/companies/1')
    data = json.loads(response.read())
    print('✅ Single company API working!')
    print(f'   Name: {data.get("name")}')
    print(f'   Country: {data.get("country")}')
    print(f'   Category: {data.get("category")}')
    desc = data.get("description", "N/A")
    print(f'   Description: {desc[:50] if desc else "N/A"}...')
except Exception as e:
    print(f'❌ Error: {e}')
