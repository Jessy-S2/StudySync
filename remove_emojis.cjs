const fs = require('fs');

let dashboard = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');
dashboard = dashboard.replace('<h1>Welcome back, {currentUser?.name}! 👋</h1>', '<h1>Welcome back, {currentUser?.name}!</h1>');
dashboard = dashboard.replace('<h3>You can do it! <span className="sparkles">✨</span></h3>', '<h3>You can do it!</h3>');
fs.writeFileSync('src/pages/Dashboard.jsx', dashboard);

let timer = fs.readFileSync('src/context/TimerContext.jsx', 'utf8');
timer = timer.replace('<div className="timer-popup-icon">ðŸŽ‰</div>', '');
fs.writeFileSync('src/context/TimerContext.jsx', timer);

console.log('Done');
