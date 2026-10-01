const fs = require('fs');
let code = fs.readFileSync('src/context/AuthContext.jsx', 'utf8');

// Add studysync_settings
code = code.replace(
  /'studysync_v3_migrated'/g,
  "'studysync_v3_migrated',\n  'studysync_settings'"
);

// Add changePassword and deleteAccount functions
const oldLogout = `  const logout = () => {
    setCurrentUser(null);
  };`;

const newFunctions = `  const changePassword = (currentPassword, newPassword) => {
    if (currentUser.password !== currentPassword) {
      return { success: false, error: 'Incorrect current password' };
    }
    const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, password: newPassword } : u);
    setUsers(updatedUsers);
    setCurrentUser({ ...currentUser, password: newPassword });
    return { success: true };
  };

  const deleteAccount = () => {
    // Note: local user data handled by settings clear data functions
    const updatedUsers = users.filter(u => u.id !== currentUser.id);
    setUsers(updatedUsers);
    setCurrentUser(null);
  };

  const logout = () => {
    setCurrentUser(null);
  };`;

code = code.replace(oldLogout, newFunctions);
code = code.replace(
  /login, register, logout/g,
  "login, register, logout, changePassword, deleteAccount"
);

fs.writeFileSync('src/context/AuthContext.jsx', code);
