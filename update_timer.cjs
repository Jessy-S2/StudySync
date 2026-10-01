const fs = require('fs');
let code = fs.readFileSync('src/context/TimerContext.jsx', 'utf8');

// Import useNotification
if (!code.includes('useNotification')) {
  code = code.replace(
    /import \{ useSettings \} from '\.\/SettingsContext';/,
    "import { useSettings } from './SettingsContext';\nimport { useNotification } from './NotificationContext';"
  );
}

// Add useNotification to TimerProvider
code = code.replace(
  /const \{ showConfirm, showAlert \} = useUI\(\);/,
  "const { showConfirm, showAlert } = useUI();\n  const { addNotification } = useNotification();"
);

// Inject addNotification in handleCompletion
// wait, handleCompletion is wrapped in useCallback and currently has no dependencies on addNotification.
// The easiest is just string replacement.
const replacement = `    setCompletedSessions(prev => [newSession, ...prev]);
    setShowPopup(true);
    
    // Add Notification
    const { settings } = stateRef.current; // wait, settings isn't in stateRef. Let's just use it directly, handleCompletion depends on settings?
    // Actually handleCompletion is in useCallback with [] deps, so it might not see the latest settings.
    // Let's add settings to stateRef.`;

// Instead of regex, let's fix stateRef and handleCompletion completely in TimerContext.jsx
let newCode = code.replace(
  /const stateRef = useRef\(\{ selectedSubjectId, selectedDuration, customSubjectName \}\);/,
  "const stateRef = useRef({ selectedSubjectId, selectedDuration, customSubjectName, settings });"
);

newCode = newCode.replace(
  /useEffect\(\(\) => \{\s*stateRef.current = \{ selectedSubjectId, selectedDuration, customSubjectName \};\s*\}, \[selectedSubjectId, selectedDuration, customSubjectName\]\);/,
  "useEffect(() => { stateRef.current = { selectedSubjectId, selectedDuration, customSubjectName, settings }; }, [selectedSubjectId, selectedDuration, customSubjectName, settings]);"
);

newCode = newCode.replace(
  /setCompletedSessions\(prev => \[newSession, \.\.\.prev\]\);\s*setShowPopup\(true\);/,
  `setCompletedSessions(prev => [newSession, ...prev]);
    setShowPopup(true);
    
    const { settings: currentSettings } = stateRef.current;
    if (currentSettings?.notifications?.timerCompletion) {
      addNotification({
        id: \`timer-complete-\${newSession.id}\`,
        type: 'timer',
        title: 'Study Session Complete',
        message: \`Your \${newSession.duration}-minute study session has completed.\`,
        route: '/timer'
      });
    }`
);

newCode = newCode.replace(
  /const handleCompletion = useCallback\(\(\) => \{/,
  "const handleCompletion = useCallback(() => {"
);

fs.writeFileSync('src/context/TimerContext.jsx', newCode);
console.log('TimerContext.jsx updated');
