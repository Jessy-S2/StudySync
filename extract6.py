import json

with open(r'C:\Users\Jessica\.gemini\antigravity\brain\0705bcaf-8c84-4112-86e8-2a935ac11aa9\.system_generated\logs\transcript_full.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('step_index') == 2285:
                print("--- STEP 2285 ---")
                print(data['tool_calls'][0]['args']['CommandLine'])
            elif data.get('step_index') in [2295, 2297, 2301]:
                print(f"--- STEP {data.get('step_index')} ---")
                print(json.dumps(data['tool_calls'][0]['args'], indent=2))
        except Exception as e:
            pass
