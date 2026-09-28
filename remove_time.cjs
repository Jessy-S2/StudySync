const fs = require('fs');
const file = 'src/components/EventModal.jsx';
let code = fs.readFileSync(file, 'utf8');

const timeField = `            <div className="form-group">
              <label>Time (Optional)</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>`;

code = code.replace(timeField, '');

fs.writeFileSync(file, code);
console.log('Success!');
