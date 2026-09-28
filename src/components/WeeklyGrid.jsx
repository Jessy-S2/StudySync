import React, { useState, useEffect, useRef } from 'react';
import './WeeklyGrid.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const minsToTimeStr = (m) => {
  let h = Math.floor(m / 60);
  let mins = m % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${mins.toString().padStart(2, '0')} ${ampm}`;
};

const parseTimeStr = (str) => {
  const match = str.trim().match(/^(\d{1,2}):?(\d{2})?\s*(AM|PM)?$/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  let m = match[2] ? parseInt(match[2], 10) : 0;
  let ampm = match[3] ? match[3].toUpperCase() : null;
  if (h === 12 && ampm === 'AM') h = 0;
  if (ampm === 'PM' && h < 12) h += 12;
  return h * 60 + m;
};

const getLuminance = (r, g, b) => {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const hexToRgb = (hex) => {
  let c = hex.substring(1);
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  return { r: parseInt(c.substring(0, 2), 16), g: parseInt(c.substring(2, 4), 16), b: parseInt(c.substring(4, 6), 16) };
};

const isDarkColor = (hex) => {
  if (!hex || hex === 'transparent' || hex === 'none') return false;
  try {
    const rgb = hexToRgb(hex);
    return getLuminance(rgb.r, rgb.g, rgb.b) < 0.179;
  } catch (e) { return false; }
};

const migrateLegacyState = () => {
  const isMigrated = localStorage.getItem('studysync_v3_migrated');
  
  let times = [];
  const savedTimes = localStorage.getItem('studysync_weekly_grid_times');
  if (savedTimes) {
    const parsed = JSON.parse(savedTimes);
    if (parsed.length > 0) {
      if (typeof parsed[0] === 'object' && parsed[0].start !== undefined) {
        times = parsed.map(o => o.start);
      } else {
        times = parsed.map(Number);
      }
    }
  }
  if (times.length === 0) {
    for (let i = parseInt(localStorage.getItem('studysync_weekly_grid_start') || '9', 10); 
         i <= parseInt(localStorage.getItem('studysync_weekly_grid_end') || '22', 10); 
         i++) {
      times.push(i * 60);
    }
  }

  const migrateObj = (storageKey, isRowKey) => {
    const raw = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (isMigrated || Object.keys(raw).length === 0) return raw;
    
    const newObj = {};
    for (const k in raw) {
      if (isRowKey) {
        const r = parseInt(k, 10);
        if (times[r] !== undefined) newObj[times[r]] = raw[k];
      } else {
        const parts = k.split('_');
        if (parts.length === 2) {
           const c = parseInt(parts[0], 10);
           const r = parseInt(parts[1], 10);
           if (times[r] !== undefined) newObj[`${c}_${times[r]}`] = raw[k];
        }
      }
    }
    return newObj;
  };

  const migrateMerges = () => {
    const raw = JSON.parse(localStorage.getItem('studysync_weekly_grid_merges') || '[]');
    if (isMigrated || raw.length === 0) return raw;
    return raw.map(m => {
      if (m.t1 !== undefined) return { ...m, t1: Number(m.t1), t2: Number(m.t2) };
      return { ...m, t1: times[m.r1], t2: times[m.r2] };
    });
  };

  return {
    times,
    gridData: migrateObj('studysync_weekly_grid_data', false),
    cellColors: migrateObj('studysync_weekly_grid_colors', false),
    rowHeights: migrateObj('studysync_weekly_grid_rowheights', true),
    mergedCells: migrateMerges(),
    cellAligns: migrateObj('studysync_weekly_grid_aligns', false),
    cellFontSizes: migrateObj('studysync_weekly_grid_font_sizes', false),
  };
};

const CellTextArea = ({ value, onChange, align, fontSize, color }) => {
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '0px';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value, fontSize, align]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        onChange(e);
        adjustHeight();
      }}
      placeholder=""
      style={{
        textAlign: align,
        fontSize: `${fontSize}px`,
        color: color,
      }}
    />
  );
};

const WeeklyGrid = () => {
  const [migratedState] = useState(migrateLegacyState);
  
  const [isConfigured, setIsConfigured] = useState(() => localStorage.getItem('studysync_weekly_grid_configured') === 'true');
  const [startHour, setStartHour] = useState(() => parseInt(localStorage.getItem('studysync_weekly_grid_start') || '9', 10));
  const [endHour, setEndHour] = useState(() => parseInt(localStorage.getItem('studysync_weekly_grid_end') || '22', 10));

  const [rowTimes, setRowTimes] = useState(migratedState.times);
  const [gridData, setGridData] = useState(migratedState.gridData);
  const [rowHeights, setRowHeights] = useState(migratedState.rowHeights);
  const [mergedCells, setMergedCells] = useState(migratedState.mergedCells);
  const [cellColors, setCellColors] = useState(migratedState.cellColors);
  const [colWidths, setColWidths] = useState(() => JSON.parse(localStorage.getItem('studysync_weekly_grid_colwidths') || '{}'));
  const [colorKeys, setColorKeys] = useState(() => JSON.parse(localStorage.getItem('studysync_weekly_grid_colorkeys') || '[]'));
  
  const [cellAligns, setCellAligns] = useState(migratedState.cellAligns);
  const [cellFontSizes, setCellFontSizes] = useState(migratedState.cellFontSizes);

  const [selection, setSelection] = useState(null);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [isConfirmNewOpen, setIsConfirmNewOpen] = useState(false);
  const [newColor, setNewColor] = useState('#3498db');
  const [newColorName, setNewColorName] = useState('');

  useEffect(() => {
    localStorage.setItem('studysync_v3_migrated', 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('studysync_weekly_grid_configured', isConfigured);
    localStorage.setItem('studysync_weekly_grid_start', startHour);
    localStorage.setItem('studysync_weekly_grid_end', endHour);
    localStorage.setItem('studysync_weekly_grid_times', JSON.stringify(rowTimes));
    localStorage.setItem('studysync_weekly_grid_data', JSON.stringify(gridData));
    localStorage.setItem('studysync_weekly_grid_colwidths', JSON.stringify(colWidths));
    localStorage.setItem('studysync_weekly_grid_rowheights', JSON.stringify(rowHeights));
    localStorage.setItem('studysync_weekly_grid_merges', JSON.stringify(mergedCells));
    localStorage.setItem('studysync_weekly_grid_colorkeys', JSON.stringify(colorKeys));
    localStorage.setItem('studysync_weekly_grid_colors', JSON.stringify(cellColors));
    localStorage.setItem('studysync_weekly_grid_aligns', JSON.stringify(cellAligns));
    localStorage.setItem('studysync_weekly_grid_font_sizes', JSON.stringify(cellFontSizes));
  }, [isConfigured, startHour, endHour, rowTimes, gridData, colWidths, rowHeights, mergedCells, colorKeys, cellColors, cellAligns, cellFontSizes]);

  useEffect(() => {
    let migrated = false;
    const newCellColors = { ...cellColors };
    Object.keys(newCellColors).forEach(key => {
      const val = newCellColors[key];
      if (val && val !== 'none' && !val.startsWith('#')) {
        const legacyKey = colorKeys.find(k => k.id === val);
        if (legacyKey) {
          newCellColors[key] = legacyKey.color;
          migrated = true;
        }
      }
    });
    if (migrated) setCellColors(newCellColors);
  }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    if (startHour >= endHour) {
      alert("End time must be after start time.");
      return;
    }
    const times = [];
    for (let i = startHour; i <= endHour; i++) times.push(i * 60);
    setRowTimes(times);
    setIsConfigured(true);
  };

  const handleConfirmNewSchedule = () => {
    setIsConfigured(false);
    setGridData({});
    setMergedCells([]);
    setCellColors({});
    setColorKeys([]);
    setColWidths({});
    setRowHeights({});
    setCellAligns({});
    setCellFontSizes({});
    setIsConfirmNewOpen(false);
  };

  
  const adjustGlobalStart = (deltaMins) => {
    const currentStart = rowTimes[0];
    const newStart = currentStart + deltaMins;
    const currentEnd = rowTimes[rowTimes.length - 1];
    
    if (newStart >= currentEnd) return; 
    if (newStart < 0) return;

    setRowTimes(prev => {
      let copy = [...prev];
      const targetFirstRow = newStart;
      
      if (targetFirstRow < copy[0]) {
        while (copy[0] - 60 >= targetFirstRow) {
          copy.unshift(copy[0] - 60);
        }
        if (copy[0] !== targetFirstRow) {
          copy.unshift(targetFirstRow);
        }
      } else {
        while (copy.length > 1 && copy[0] < targetFirstRow) {
          copy.shift();
        }
        if (copy[0] !== targetFirstRow) {
          copy.unshift(targetFirstRow);
        }
      }
      return copy;
    });
  };

  const adjustGlobalEnd = (deltaMins) => {
    const currentEnd = rowTimes[rowTimes.length - 1];
    const newEnd = currentEnd + deltaMins;
    
    if (newEnd <= rowTimes[0]) return; 
    if (newEnd >= 1440) return; 

    setRowTimes(prev => {
      let copy = [...prev];
      const targetLastRow = newEnd;
      
      if (targetLastRow > copy[copy.length - 1]) {
        while (copy[copy.length - 1] + 60 <= targetLastRow) {
          copy.push(copy[copy.length - 1] + 60);
        }
        if (copy[copy.length - 1] !== targetLastRow) {
          copy.push(targetLastRow);
        }
      } else {
        while (copy.length > 1 && copy[copy.length - 1] > targetLastRow) {
          copy.pop();
        }
        if (copy[copy.length - 1] !== targetLastRow) {
          copy.push(targetLastRow);
        }
      }
      return copy;
    });
  };

  const handleRowTimeEdit = (e, r) => {
    const valStr = e.target.value;
    const newMins = parseTimeStr(valStr);
    if (newMins === null) {
      e.target.value = minsToTimeStr(rowTimes[r]);
      return;
    }
    
    if (r > 0 && newMins <= rowTimes[r - 1]) {
      alert("Time must be after the previous row's time.");
      e.target.value = minsToTimeStr(rowTimes[r]);
      return;
    }
    const oldMins = rowTimes[r];
    const delta = newMins - oldMins;
    if (delta === 0) {
      e.target.value = minsToTimeStr(oldMins);
      return;
    }

    const newRowTimes = [...rowTimes];
    const shiftedMap = new Map();
    
    for (let i = r; i < newRowTimes.length; i++) {
      const oldT = newRowTimes[i];
      const newT = oldT + delta;
      newRowTimes[i] = newT;
      shiftedMap.set(oldT, newT);
    }
    
    setRowTimes(newRowTimes);

    const migrateKeys = (oldObj, isRowKey) => {
      const newObj = { ...oldObj };
      for (const key in oldObj) {
        if (isRowKey) {
          const t = parseInt(key, 10);
          if (shiftedMap.has(t)) {
            newObj[shiftedMap.get(t)] = oldObj[key];
            delete newObj[key];
          }
        } else {
          const parts = key.split('_');
          if (parts.length === 2) {
            const t = parseInt(parts[1], 10);
            if (shiftedMap.has(t)) {
              newObj[`${parts[0]}_${shiftedMap.get(t)}`] = oldObj[key];
              delete newObj[key];
            }
          }
        }
      }
      return newObj;
    };

    setGridData(prev => migrateKeys(prev, false));
    setCellColors(prev => migrateKeys(prev, false));
    setCellAligns(prev => migrateKeys(prev, false));
    setCellFontSizes(prev => migrateKeys(prev, false));
    setRowHeights(prev => migrateKeys(prev, true));
    
    setMergedCells(prev => prev.map(m => ({
      ...m,
      t1: shiftedMap.has(m.t1) ? shiftedMap.get(m.t1) : m.t1,
      t2: shiftedMap.has(m.t2) ? shiftedMap.get(m.t2) : m.t2,
    })));
  };

  const startResizing = (e, type, index) => {
    e.stopPropagation();
    e.preventDefault();
    const startPos = type === 'col' ? e.clientX : e.clientY;
    const startSize = type === 'col' 
      ? (colWidths[index] || (index === -1 ? 80 : 120))
      : (rowHeights[index] || 80);

    const onMouseMove = (moveEvent) => {
      const delta = (type === 'col' ? moveEvent.clientX : moveEvent.clientY) - startPos;
      const newSize = Math.max(40, startSize + delta);
      if (type === 'col') {
        setColWidths(prev => ({ ...prev, [index]: newSize }));
      } else {
        setRowHeights(prev => ({ ...prev, [index]: newSize }));
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleMouseDownCell = (t, c) => {
    setSelection({ t1: t, c1: c, t2: t, c2: c });
  };
  const handleMouseEnterCell = (e, t, c) => {
    if (e.buttons !== 1) return;
    if (selection && (selection.t2 !== t || selection.c2 !== c)) {
      setSelection(prev => ({ ...prev, t2: t, c2: c }));
    }
  };

  const handleMerge = () => {
    if (!selection) return;
    const minT = Math.min(selection.t1, selection.t2);
    const maxT = Math.max(selection.t1, selection.t2);
    const minC = Math.min(selection.c1, selection.c2);
    const maxC = Math.max(selection.c1, selection.c2);
    
    if (minT === maxT && minC === maxC) return;

    const newMerge = { t1: minT, c1: minC, t2: maxT, c2: maxC, id: crypto.randomUUID() };
    const overlaps = mergedCells.some(m => 
      Math.max(newMerge.t1, m.t1) <= Math.min(newMerge.t2, m.t2) &&
      Math.max(newMerge.c1, m.c1) <= Math.min(newMerge.c2, m.c2)
    );
    if (overlaps) {
      alert('Selection overlaps existing merged cells. Unmerge first.');
      return;
    }
    
    setMergedCells([...mergedCells, newMerge]);
  };

  const handleUnmerge = () => {
    if (!selection) return;
    const minT = Math.min(selection.t1, selection.t2);
    const maxT = Math.max(selection.t1, selection.t2);
    const minC = Math.min(selection.c1, selection.c2);
    const maxC = Math.max(selection.c1, selection.c2);
    
    const filtered = mergedCells.filter(m => 
      !(Math.max(minT, m.t1) <= Math.min(maxT, m.t2) &&
        Math.max(minC, m.c1) <= Math.min(maxC, m.c2))
    );
    setMergedCells(filtered);
  };

  const applyFormat = (type, value) => {
    if (!selection) return;
    const minT = Math.min(selection.t1, selection.t2);
    const maxT = Math.max(selection.t1, selection.t2);
    const minC = Math.min(selection.c1, selection.c2);
    const maxC = Math.max(selection.c1, selection.c2);
    
    const minR = rowTimes.indexOf(minT);
    const maxR = rowTimes.indexOf(maxT);

    if (type === 'align') {
      setCellAligns(prev => {
        const copy = { ...prev };
        for (let r = minR; r <= maxR; r++) {
          for (let c = minC; c <= maxC; c++) {
            copy[`${c}_${rowTimes[r]}`] = value;
          }
        }
        return copy;
      });
    } else if (type === 'size') {
      setCellFontSizes(prev => {
        const copy = { ...prev };
        for (let r = minR; r <= maxR; r++) {
          for (let c = minC; c <= maxC; c++) {
            const key = `${c}_${rowTimes[r]}`;
            const currentSize = prev[key] || 13;
            const newSize = Math.max(10, currentSize + value);
            copy[key] = newSize;
          }
        }
        return copy;
      });
    }
  };

  const addColorKey = () => {
    if (!newColorName.trim()) return;
    setColorKeys([...colorKeys, { id: crypto.randomUUID(), name: newColorName, color: newColor }]);
    setNewColorName('');
    setIsColorModalOpen(false);
  };

  const removeColorKey = (id) => {
    setColorKeys(colorKeys.filter(k => k.id !== id));
  };

  const applyColor = (colorValue) => {
    if (!selection) return;
    const minT = Math.min(selection.t1, selection.t2);
    const maxT = Math.max(selection.t1, selection.t2);
    const minC = Math.min(selection.c1, selection.c2);
    const maxC = Math.max(selection.c1, selection.c2);
    
    const minR = rowTimes.indexOf(minT);
    const maxR = rowTimes.indexOf(maxT);

    setCellColors(prev => {
      let allHaveColor = true;
      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          if (prev[`${c}_${rowTimes[r]}`] !== colorValue) {
            allHaveColor = false;
            break;
          }
        }
        if (!allHaveColor) break;
      }

      const targetColor = allHaveColor ? 'none' : colorValue;
      const copy = { ...prev };
      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          if (targetColor === 'none') {
            delete copy[`${c}_${rowTimes[r]}`];
          } else {
            copy[`${c}_${rowTimes[r]}`] = targetColor;
          }
        }
      }
      return copy;
    });
  };

  const hoursOptions = [];
  for (let i = 0; i <= 23; i++) {
    const ampm = i >= 12 ? 'PM' : 'AM';
    let h = i % 12;
    if (h === 0) h = 12;
    hoursOptions.push(<option key={i} value={i}>{`${h}:00 ${ampm}`}</option>);
  }

  if (!isConfigured) {
    return (
      <div className="weekly-setup-container">
        <div className="weekly-setup-card">
          <h2>Create Your Daily Schedule</h2>
          <p>Choose the hours you want your timetable to cover.</p>
          <div className="setup-form">
            <div className="form-group">
              <label>From:</label>
              <select value={startHour} onChange={(e) => setStartHour(parseInt(e.target.value, 10))}>{hoursOptions}</select>
            </div>
            <div className="form-group">
              <label>To:</label>
              <select value={endHour} onChange={(e) => setEndHour(parseInt(e.target.value, 10))}>{hoursOptions}</select>
            </div>
          </div>
          <button className="btn-primary" onClick={handleCreate}>Create Schedule</button>
        </div>
      </div>
    );
  }

  const skipCells = new Set();
  const mergeHeads = new Map();
  mergedCells.forEach(m => {
    const mt1 = Number(m.t1);
    const mt2 = Number(m.t2);
    const mc1 = Number(m.c1);
    const mc2 = Number(m.c2);

    const validTimes = rowTimes.map(Number).filter(t => t >= mt1 && t <= mt2);
    if (validTimes.length > 0) {
      const anchorT = validTimes[0];
      mergeHeads.set(`${mc1}_${anchorT}`, { ...m, t1: mt1, t2: mt2, c1: mc1, c2: mc2, rowSpan: validTimes.length });

      validTimes.forEach(numT => {
        for (let c = mc1; c <= mc2; c++) {
          if (numT !== anchorT || c !== mc1) {
            skipCells.add(`${c}_${numT}`);
          }
        }
      });
    }
  });

  return (
    <div className="weekly-grid-wrapper">
      <div className="weekly-controls">
        <div className="weekly-range">
          <label>Schedule Time:</label>
          {rowTimes.length > 0 ? (
            <div className="global-time-editors">
              <div className="time-stepper">
                <button className="stepper-btn" onClick={() => adjustGlobalStart(60)}>▲</button>
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                  <span className="stepper-value">{minsToTimeStr(rowTimes[0])}</span>
                  <input type="time" style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', left: 0, top: 0 }} onChange={(e) => { const val = e.target.value; if (!val) return; const parts = val.split(':'); const h = parseInt(parts[0], 10); const m = parseInt(parts[1], 10); const total = h * 60 + m; const delta = total - rowTimes[0]; adjustGlobalStart(delta); }} />
                </div>
                <button className="stepper-btn" onClick={() => adjustGlobalStart(-60)}>▼</button>
              </div>
              <span>to</span>
              <div className="time-stepper">
                <button className="stepper-btn" onClick={() => adjustGlobalEnd(60)}>▲</button>
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                  <span className="stepper-value">{minsToTimeStr(rowTimes[rowTimes.length - 1])}</span>
                  <input type="time" style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', left: 0, top: 0 }} onChange={(e) => { const val = e.target.value; if (!val) return; const parts = val.split(':'); const h = parseInt(parts[0], 10); const m = parseInt(parts[1], 10); const total = h * 60 + m; const delta = total - rowTimes[rowTimes.length - 1]; adjustGlobalEnd(delta); }} />
                </div>
                <button className="stepper-btn" onClick={() => adjustGlobalEnd(-60)}>▼</button>
              </div>
            </div>
          ) : (
            <div className="range-read-only">No times</div>
          )}
        </div>
        <button className="btn-primary" onClick={() => setIsConfirmNewOpen(true)}>New Schedule</button>
      </div>

      <div className="weekly-toolbar">
        <div className="color-legend">
          <span className="legend-title">Color Key:</span>
          {colorKeys.map(k => {
            const dark = isDarkColor(k.color);
            return (
              <span 
                key={k.id} 
                className="legend-item" 
                style={{ backgroundColor: k.color, color: dark ? '#FFFFFF' : '#17143A' }} 
                onClick={() => applyColor(k.color)}
                title="Click to apply color"
              >
                {k.name}
                <button 
                  className="color-key-remove"
                  onClick={(e) => { e.stopPropagation(); removeColorKey(k.id); }}
                  title="Remove color key"
                >&times;</button>
              </span>
            );
          })}
          <button className="btn-small" onClick={() => setIsColorModalOpen(true)}>+ Add Color Key</button>
        </div>

        <div className="cell-actions">
          <button className="btn-small" onClick={() => applyFormat('align', 'left')} title="Align Left">Left</button>
          <button className="btn-small" onClick={() => applyFormat('align', 'center')} title="Align Center">Center</button>
          <button className="btn-small" onClick={() => applyFormat('align', 'right')} title="Align Right">Right</button>
          <div className="toolbar-divider" />
          <button className="btn-small" onClick={() => applyFormat('size', -2)} title="Decrease Text Size">A-</button>
          <button className="btn-small" onClick={() => applyFormat('size', 2)} title="Increase Text Size">A+</button>
          <div className="toolbar-divider" />
          <button className="btn-small" onClick={handleMerge}>Merge Cells</button>
          <button className="btn-small" onClick={handleUnmerge}>Unmerge Cells</button>
        </div>
      </div>

      {isConfirmNewOpen && (
        <div className="ui-modal-overlay">
          <div className="ui-modal-content" style={{ zIndex: 999 }}>
            <h3 className="ui-modal-title">Are you sure?</h3>
            <p className="ui-modal-message">The current schedule will be deleted and cannot be recovered.</p>
            <div className="ui-modal-actions">
              <button className="ui-btn-cancel" onClick={() => setIsConfirmNewOpen(false)}>Cancel</button>
              <button className="ui-btn-confirm" onClick={handleConfirmNewSchedule}>Create New Schedule</button>
            </div>
          </div>
        </div>
      )}

      {isColorModalOpen && (
        <div className="color-modal">
          <div className="color-modal-content">
            <h3>Add Color Key</h3>
            <div className="form-group">
              <label>Color:</label>
              <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Name:</label>
              <input type="text" value={newColorName} onChange={e => setNewColorName(e.target.value)} placeholder="e.g. Study" />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setIsColorModalOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={addColorKey}>Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table className="weekly-table">
          <thead>
            <tr>
              <th className="time-header" style={{ width: colWidths[-1] || 80, minWidth: colWidths[-1] || 80 }}>
                <div className="col-resizer" onMouseDown={(e) => startResizing(e, 'col', -1)} />
              </th>
              {DAYS.map((day, c) => (
                <th key={day} style={{ width: colWidths[c] || 120, minWidth: colWidths[c] || 120 }}>
                  {day}
                  <div className="col-resizer" onMouseDown={(e) => startResizing(e, 'col', c)} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowTimes.map((timeMins, r) => (
              <tr key={timeMins} style={{ height: rowHeights[timeMins] || 80 }}>
                <td className="time-col" style={{ position: 'relative' }}>
                  <div className="time-edit-container">
                    <input 
                      type="text" 
                      className="time-edit-input"
                      defaultValue={minsToTimeStr(timeMins)} 
                      onBlur={(e) => handleRowTimeEdit(e, r)}
                      key={`time_${timeMins}`}
                    />
                  </div>
                  <div className="row-resizer" onMouseDown={(e) => startResizing(e, 'row', timeMins)} />
                </td>
                
                {DAYS.map((day, c) => {
                  const key = `${c}_${timeMins}`;
                  if (skipCells.has(key)) return null;

                  const mergeObj = mergeHeads.get(key);
                  const rowSpan = mergeObj ? mergeObj.rowSpan : 1;
                  const colSpan = mergeObj ? (mergeObj.c2 - mergeObj.c1 + 1) : 1;

                  const rIndex = rowTimes.indexOf(timeMins);
                  const selStartT = selection ? Math.min(selection.t1, selection.t2) : 0;
                  const selEndT = selection ? Math.max(selection.t1, selection.t2) : 0;
                  
                  const isSelected = selection && 
                    rIndex >= rowTimes.indexOf(selStartT) && 
                    rIndex <= rowTimes.indexOf(selEndT) &&
                    c >= Math.min(selection.c1, selection.c2) && 
                    c <= Math.max(selection.c1, selection.c2);

                  let cellColor = cellColors[key] || 'transparent';
                  if (cellColor !== 'transparent' && !cellColor.startsWith('#')) {
                    const legacyKey = colorKeys.find(k => k.id === cellColor);
                    cellColor = legacyKey ? legacyKey.color : 'transparent';
                  }
                  const isDark = isDarkColor(cellColor);
                  const align = cellAligns[key] || 'left';
                  const fontSize = cellFontSizes[key] || 13;

                  return (
                    <td 
                      key={c}
                      rowSpan={rowSpan}
                      colSpan={colSpan}
                      className={`grid-cell ${isSelected ? 'selected' : ''}`}
                      style={{ backgroundColor: cellColor }}
                      onMouseDown={() => handleMouseDownCell(timeMins, c)}
                      onMouseEnter={(e) => handleMouseEnterCell(e, timeMins, c)}
                    >
                      <div className="grid-cell-content" style={{
                        justifyContent: align === 'center' ? 'center' : 'flex-start'
                      }}>
                        <CellTextArea 
                          value={gridData[key] || ''}
                          onChange={(e) => setGridData(prev => ({ ...prev, [key]: e.target.value }))}
                          align={align}
                          fontSize={fontSize}
                          color={isDark ? '#FFFFFF' : '#17143A'}
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeeklyGrid;




