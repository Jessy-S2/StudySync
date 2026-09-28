const fs = require('fs');
let code = fs.readFileSync('src/components/WeeklyGrid.jsx', 'utf8');

code = code.replace(/<button className="stepper-btn" onClick=\{\(\) => adjustGlobalStart\(60\)\}>[^<]*<\/button>/g, '<button className="stepper-btn" onClick={() => adjustGlobalStart(60)}>▲</button>');
code = code.replace(/<button className="stepper-btn" onClick=\{\(\) => adjustGlobalStart\(-60\)\}>[^<]*<\/button>/g, '<button className="stepper-btn" onClick={() => adjustGlobalStart(-60)}>▼</button>');
code = code.replace(/<button className="stepper-btn" onClick=\{\(\) => adjustGlobalEnd\(60\)\}>[^<]*<\/button>/g, '<button className="stepper-btn" onClick={() => adjustGlobalEnd(60)}>▲</button>');
code = code.replace(/<button className="stepper-btn" onClick=\{\(\) => adjustGlobalEnd\(-60\)\}>[^<]*<\/button>/g, '<button className="stepper-btn" onClick={() => adjustGlobalEnd(-60)}>▼</button>');

const startOverlay = `<div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                  <span className="stepper-value">{minsToTimeStr(rowTimes[0])}</span>
                  <input type="time" style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', left: 0, top: 0 }} onChange={(e) => { const val = e.target.value; if (!val) return; const parts = val.split(':'); const h = parseInt(parts[0], 10); const m = parseInt(parts[1], 10); const total = h * 60 + m; const delta = total - rowTimes[0]; adjustGlobalStart(delta); }} />
                </div>`;

const endOverlay = `<div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                  <span className="stepper-value">{minsToTimeStr(rowTimes[rowTimes.length - 1])}</span>
                  <input type="time" style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', left: 0, top: 0 }} onChange={(e) => { const val = e.target.value; if (!val) return; const parts = val.split(':'); const h = parseInt(parts[0], 10); const m = parseInt(parts[1], 10); const total = h * 60 + m; const delta = total - rowTimes[rowTimes.length - 1]; adjustGlobalEnd(delta); }} />
                </div>`;

code = code.replace(/<span className="stepper-value">\{minsToTimeStr\(rowTimes\[0\]\)\}<\/span>/g, startOverlay);
code = code.replace(/<span className="stepper-value">\{minsToTimeStr\(rowTimes\[rowTimes\.length - 1\]\)\}<\/span>/g, endOverlay);

fs.writeFileSync('src/components/WeeklyGrid.jsx', code, 'utf8');
