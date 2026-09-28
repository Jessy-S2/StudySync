const fs = require('fs');
const file = 'src/components/MonthlyCalendar.jsx';
let code = fs.readFileSync(file, 'utf8');

const target = `            </div>
          </div>
        ) : (`;

const replacement = `            </div>
          </div>
        </>
        ) : (`;

code = code.replace(target, replacement);
fs.writeFileSync(file, code);
