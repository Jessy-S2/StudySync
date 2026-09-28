import json

with open(r'C:\Users\Jessica\.gemini\antigravity\brain\0705bcaf-8c84-4112-86e8-2a935ac11aa9\.system_generated\logs\transcript_full.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('step_index') == 2309:
                calls = data.get('tool_calls', [])
                for call in calls:
                    if call.get('name') == 'run_command':
                        print(call['args']['CommandLine'])
            if data.get('step_index') == 2310:
                print(repr(data.get('content'))[:500])
        except Exception as e:
            pass
