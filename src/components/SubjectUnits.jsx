import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UnitModal from './UnitModal';
import { useUI } from '../context/UIContext';
import { saveFile, deleteFile } from '../utils/fileStorage';

const SubjectUnits = ({ subjectId }) => {
  const navigate = useNavigate();
  const { showConfirm, showAlert } = useUI();
  const [units, setUnits] = useState(() => {
    const saved = localStorage.getItem('studysync_units');
    if (saved) {
      try {
        return JSON.parse(saved) || [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);

  useEffect(() => {
    localStorage.setItem('studysync_units', JSON.stringify(units));
  }, [units]);

  const subjectUnits = units.filter(u => u.subjectId === subjectId)
    .sort((a, b) => {
      const numA = parseInt(a.unitNumber) || 0;
      const numB = parseInt(b.unitNumber) || 0;
      return numA - numB;
    });

  const handleOpenModal = () => {
    setEditingUnit(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUnit(null);
  };

  const handleSaveUnit = async (unitData) => {
    const unitId = editingUnit ? editingUnit.id : crypto.randomUUID();
    
    // Upload new files
    for (const mat of unitData.materials) {
      if (mat.rawFile) {
        try {
          await saveFile(mat.id, subjectId, unitId, mat.rawFile);
        } catch (e) {
          console.error(e);
          showAlert(`Failed to save file ${mat.name}`, "error");
        }
      }
    }

    // Delete removed files
    if (editingUnit && editingUnit.materials) {
      const newMatIds = new Set(unitData.materials.map(m => m.id));
      for (const oldMat of editingUnit.materials) {
        if (!newMatIds.has(oldMat.id)) {
          try {
            await deleteFile(oldMat.id);
          } catch (e) {
            console.error(e);
          }
        }
      }
    }

    // Clean up rawFile before saving to state
    const cleanMaterials = unitData.materials.map(mat => {
      const { rawFile, ...rest } = mat;
      return rest;
    });

    const finalUnitData = { ...unitData, materials: cleanMaterials };

    if (editingUnit) {
      setUnits(units.map(u => u.id === editingUnit.id ? { ...u, ...finalUnitData } : u));
    } else {
      setUnits([...units, { id: unitId, subjectId, ...finalUnitData }]);
    }
    handleCloseModal();
  };

  const handleDeleteUnit = async (id) => {
    showConfirm("Delete Unit", "Are you sure you want to delete this unit? This will also remove it from Notes.", async () => {
      const unitToDelete = units.find(u => u.id === id);
      if (unitToDelete && unitToDelete.materials) {
        for (const mat of unitToDelete.materials) {
          try {
            await deleteFile(mat.id);
          } catch (e) {
            console.error(e);
          }
        }
      }
      setUnits(units.filter(u => u.id !== id));
      showAlert("Unit deleted.", "info");
    });
  };

  const handleEditUnit = (unit) => {
    setEditingUnit(unit);
    setIsModalOpen(true);
  };

  return (
    <div className="subject-units">
      <div className="tab-section-header" style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>        <button className="btn-primary" onClick={handleOpenModal}>+ Add Unit</button>      </div>

      {subjectUnits.length === 0 ? (
        <div className="empty-state">
          <p>No units added in this course.</p>
        </div>
      ) : (
        <div className="units-list">
          {subjectUnits.map(unit => (
            <div 
              key={unit.id} 
              className="unit-card clickable-unit-card"
              onClick={() => navigate(`/subjects/${subjectId}/units/${unit.id}`)}
            >
              <div className="unit-info">
                <h3>Unit {unit.unitNumber}</h3>
                <h4>{unit.name}</h4>
                <p className="unit-materials-count">
                  {unit.materials ? unit.materials.length : 0} study materials
                </p>
              </div>
              <div className="unit-actions">
                <button 
                  className="icon-btn edit-btn" 
                  onClick={(e) => { e.stopPropagation(); handleEditUnit(unit); }}
                >
                  Edit
                </button>
                <button 
                  className="icon-btn delete-btn" 
                  onClick={(e) => { e.stopPropagation(); handleDeleteUnit(unit.id); }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <UnitModal 
          initialData={editingUnit}
          onSubmit={handleSaveUnit}
          onCancel={handleCloseModal}
        />
      )}
    </div>
  );
};

export default SubjectUnits;




