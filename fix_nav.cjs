const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.css', 'utf8');
const idx = code.indexOf('/* Mobile Navigation */');
if (idx > -1) {
  code = code.substring(0, idx);
}

code += `
/* Mobile Navigation */
@media (max-width: 768px) {
  .sidebar,
  .sidebar.collapsed {
    position: fixed !important;
    top: auto !important;
    bottom: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 70px !important;
    flex-direction: row !important;
    z-index: 1000 !important;
    box-shadow: 0 -2px 10px rgba(0,0,0,0.05) !important;
    background-color: #FFFFFF !important;
    border-top: 1px solid #E6E4EF !important;
    border-right: none !important;
    padding: 0 !important;
  }

  .sidebar-brand-wrapper,
  .sidebar.collapsed .sidebar-brand-wrapper {
    display: none !important;
  }

  .sidebar-nav,
  .sidebar.collapsed .sidebar-nav {
    flex: 1 !important;
    display: flex !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .sidebar-nav ul {
    display: flex !important;
    flex-direction: row !important;
    width: 100% !important;
    justify-content: flex-start !important; /* Fixes the clipping issue */
    padding: 0 !important;
    margin: 0 !important;
  }

  .sidebar-nav ul li {
    flex: 1 1 20% !important;
    min-width: 64px !important;
    display: flex !important;
  }

  .sidebar-nav ul li a,
  .sidebar.collapsed .sidebar-nav ul li a {
    width: 100% !important;
    display: flex !important;
    flex-direction: column !important;
    padding: 10px 4px !important;
    justify-content: center !important;
    align-items: center !important;
    border-radius: 0 !important;
    gap: 4px !important;
    background: transparent !important;
    height: 70px !important;
  }

  .sidebar-nav ul li a.active,
  .sidebar.collapsed .sidebar-nav ul li a.active {
    color: #5B2DBB !important;
    background: transparent !important;
    border-top: 3px solid #5B2DBB !important;
  }

  .sidebar-nav ul li a svg,
  .sidebar.collapsed .sidebar-nav ul li a svg {
    margin: 0 !important;
    width: 20px !important;
    height: 20px !important;
  }

  .nav-text,
  .sidebar.collapsed .nav-text {
    font-size: 10px !important;
    display: block !important;
    white-space: nowrap !important;
    opacity: 1 !important;
  }

  .sidebar-bottom,
  .sidebar.collapsed .sidebar-bottom {
    display: flex !important;
    padding: 0 !important;
    margin: 0 !important;
    align-items: center !important;
    justify-content: center !important;
    flex: 0 0 64px !important;
    border-top: none !important;
    border-left: 1px solid #E6E4EF !important;
  }

  .settings-link,
  .sidebar.collapsed .settings-link {
    display: flex !important;
    flex-direction: column !important;
    padding: 10px 4px !important;
    justify-content: center !important;
    align-items: center !important;
    gap: 4px !important;
    border-radius: 0 !important;
    width: 100% !important;
    height: 70px !important;
    background: transparent !important;
  }

  .settings-link.active,
  .sidebar.collapsed .settings-link.active {
    border-top: 3px solid #5B2DBB !important;
  }
  
  .settings-link svg,
  .sidebar.collapsed .settings-link svg { 
    margin: 0 !important;
    width: 20px !important;
    height: 20px !important;
  }
}
`;

fs.writeFileSync('src/components/Sidebar.css', code);
