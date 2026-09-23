import React, { useState } from 'react';

const FlashcardsView = ({ flashcards }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcards || !Array.isArray(flashcards) || flashcards.length === 0) {
    return <div className="workspace-placeholder">Flashcards format is invalid.</div>;
  }

  const currentCard = flashcards[currentIdx];

  const handleFlip = () => setIsFlipped(!isFlipped);
  
  const handleNext = () => {
    if (currentIdx < flashcards.length - 1) {
      setIsFlipped(false);
      setCurrentIdx(currentIdx + 1);
    }
  };
  
  const handlePrev = () => {
    if (currentIdx > 0) {
      setIsFlipped(false);
      setCurrentIdx(currentIdx - 1);
    }
  };

  return (
    <div className="flashcards-view" style={{ width: '100%', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ marginBottom: '20px', color: '#7f8c8d', fontSize: '16px' }}>
        Card {currentIdx + 1} of {flashcards.length}
      </div>

      <div 
        onClick={handleFlip}
        style={{
          perspective: '1000px',
          width: '100%',
          height: '350px',
          marginBottom: '30px',
          cursor: 'pointer'
        }}
      >
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transition: 'transform 0.6s',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}>
          {/* Front */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            backgroundColor: '#2c3e50',
            border: '2px solid #34495e',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ fontSize: '24px', lineHeight: '1.4', margin: 0 }}>{currentCard.front}</h3>
            <p style={{ position: 'absolute', bottom: '20px', color: '#7f8c8d', fontSize: '14px', margin: 0 }}>
              Click to flip
            </p>
          </div>
          
          {/* Back */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            backgroundColor: '#3498db',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px',
            transform: 'rotateY(180deg)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <p style={{ fontSize: '20px', lineHeight: '1.5', margin: 0, color: '#fff' }}>{currentCard.back}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          className="btn-cancel" 
          onClick={handlePrev} 
          disabled={currentIdx === 0}
          style={{ padding: '10px 20px', opacity: currentIdx === 0 ? 0.3 : 1 }}
        >
          &larr; Previous
        </button>

        <button 
          className="btn-primary" 
          onClick={handleNext} 
          disabled={currentIdx === flashcards.length - 1}
          style={{ padding: '10px 20px', opacity: currentIdx === flashcards.length - 1 ? 0.3 : 1 }}
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
};

export default FlashcardsView;
