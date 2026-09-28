import json

with open(r'C:\Users\Jessica\.gemini\antigravity\brain\0705bcaf-8c84-4112-86e8-2a935ac11aa9\.system_generated\logs\transcript_full.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('step_index') == 2285:
                print(data['tool_calls'][0]['args']['CommandLine'])
        except Exception as e:
            pass
