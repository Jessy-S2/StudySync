const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const oldSidebar = `  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(() => {
    const saved = localStorage.getItem('studysync_sidebar_collapsed');
    return saved === 'true';
  });`;

const newSidebar = `  const { settings } = useSettings();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(() => {
    if (settings?.appearance?.rememberSidebar) {
      const saved = localStorage.getItem('studysync_sidebar_collapsed');
      return saved === 'true';
    }
    return false;
  });`;

code = code.replace(oldSidebar, newSidebar);

fs.writeFileSync('src/App.jsx', code);
