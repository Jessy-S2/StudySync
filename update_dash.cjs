const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

code = code.replace(/<h1>Welcome back, Student!/g, '<h1>Welcome back, {currentUser?.name || \'Student\'}!');

if (!code.includes('useAuth')) {
    code = code.replace(/import React, \{ useState, useEffect \} from 'react';/, 
        "import React, { useState, useEffect } from 'react';\nimport { useAuth } from '../context/AuthContext';");
    code = code.replace(/const Dashboard = \(\) => \{/, 
        "const Dashboard = () => {\n  const { currentUser } = useAuth();");
}

fs.writeFileSync('src/pages/Dashboard.jsx', code);
