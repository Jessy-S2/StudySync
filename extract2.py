import json

with open(r'C:\Users\Jessica\.gemini\antigravity\brain\0705bcaf-8c84-4112-86e8-2a935ac11aa9\.system_generated\logs\transcript_full.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('step_index') == 2284:
                content = data.get('content', '')
                idx = content.find('Output:')
                if idx != -1:
                    code = content[idx+7:].strip()
                    with open(r'C:\Users\Jessica\Documents\ReactProjects\StudySync\src\components\WeeklyGrid.jsx.step2284', 'w', encoding='utf-8') as out:
                        out.write(code)
                    print('Extracted WeeklyGrid.jsx successfully!')
                    break
        except Exception as e:
            pass
