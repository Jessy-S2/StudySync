const fs = require('fs');

let css = fs.readFileSync('src/components/Header.css', 'utf8');

css += `
.notif-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 340px;
  background-color: #FFFFFF;
  border: 1px solid #E6E4EF;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  margin-top: 10px;
  z-index: 150;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.notif-header {
  padding: 16px 20px;
  border-bottom: 1px solid #E6E4EF;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #F8F5FC;
}

.notif-header h3 {
  margin: 0;
  font-size: 15px;
  color: #17143A;
  font-weight: 600;
}

.mark-read-btn {
  background: none;
  border: none;
  color: var(--primary-color, #5B2DBB);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}

.mark-read-btn:hover {
  text-decoration: underline;
}

.notif-list {
  max-height: 380px;
  overflow-y: auto;
}

.notif-item {
  padding: 16px 20px;
  border-bottom: 1px solid #E6E4EF;
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.notif-item:last-child {
  border-bottom: none;
}

.notif-item:hover {
  background-color: #F8F5FC;
}

.notif-item.unread {
  background-color: #F0EEFC;
}

.notif-item.unread:hover {
  background-color: #E6E4EF;
}

.notif-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #FFFFFF;
  color: var(--primary-color, #5B2DBB);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.notif-content {
  flex: 1;
}

.notif-title {
  font-size: 14px;
  font-weight: 600;
  color: #17143A;
  margin-bottom: 4px;
}

.notif-message {
  font-size: 13px;
  color: #686579;
  margin-bottom: 6px;
  line-height: 1.4;
}

.notif-time {
  font-size: 11px;
  color: #9C99AD;
}

.notif-unread-dot {
  width: 8px;
  height: 8px;
  background-color: #e74c3c;
  border-radius: 50%;
  position: absolute;
  top: 20px;
  right: 20px;
}

.notif-empty {
  padding: 30px;
  text-align: center;
  color: #686579;
  font-size: 14px;
}
`;

// Fix notification dot styling in original CSS
css = css.replace(
  /\.notification-dot \{[\s\S]*?\}/,
  `.notification-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 14px;
  height: 14px;
  background-color: #e74c3c;
  border-radius: 50%;
  border: 2px solid #FFFFFF;
}`
);

fs.writeFileSync('src/components/Header.css', css);
console.log('Header.css updated');
