const fs = require('fs');
let code = fs.readFileSync('src/pages/Register.jsx', 'utf8');

// Add emailError state
code = code.replace(
  "const [error, setError] = useState('');",
  "const [error, setError] = useState('');\n  const [emailError, setEmailError] = useState('');"
);

// Update handleSubmit validation
const oldValidation = `    // Basic email validation
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }`;

const newValidation = `    // Strict email validation
    const emailRegex = /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*\\.[a-zA-Z]{2,}$/;
    let isEmailValid = emailRegex.test(email);
    
    if (isEmailValid) {
      const domainPart = email.split('@')[1].split('.')[0];
      if (/^\\d+$/.test(domainPart)) {
        isEmailValid = false;
      }
    }

    if (!isEmailValid) {
      setEmailError('Please enter a valid email address.');
      return;
    }`;

code = code.replace(oldValidation, newValidation);

// Update input rendering
const oldInput = `<input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />`;

const newInput = `<input 
              type="email" 
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              placeholder="you@example.com"
              className={emailError ? 'input-error' : ''}
            />
            {emailError && <span className="field-error">{emailError}</span>}`;

code = code.replace(oldInput, newInput);

fs.writeFileSync('src/pages/Register.jsx', code);
console.log('Register updated');
