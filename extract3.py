import json

with open(r'C:\Users\Jessica\.gemini\antigravity\brain\0705bcaf-8c84-4112-86e8-2a935ac11aa9\.system_generated\logs\transcript_full.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if 2285 <= data.get('step_index', 0) <= 2313:
                calls = data.get('tool_calls', [])
                for call in calls:
                    if call.get('name') == 'replace_file_content':
                        print(f"Step {data.get('step_index')}: {call['args'].get('Description')}")
        except Exception as e:
            pass
