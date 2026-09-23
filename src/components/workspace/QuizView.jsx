import React, { useState } from 'react';

const QuizView = ({ quiz }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!quiz || !Array.isArray(quiz) || quiz.length === 0) {
    return <div className="workspace-placeholder">Quiz format is invalid.</div>;
  }

  const currentQ = quiz[currentIdx];

  const handleSelect = (idx) => {
    if (!isSubmitted) {
      setSelectedAnswer(idx);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setIsSubmitted(true);
    if (selectedAnswer === currentQ.correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < quiz.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedAnswer(null);
      setIsSubmitted(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRetake = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setScore(0);
    setIsFinished(false);
  };

  if (isFinished) {
    const percentage = Math.round((score / quiz.length) * 100);
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>Quiz Complete</h2>
        <div style={{ fontSize: '48px', color: '#3498db', fontWeight: 'bold', marginBottom: '10px' }}>
          {percentage}%
        </div>
        <p style={{ fontSize: '18px', color: '#bdc3c7', marginBottom: '30px' }}>
          Score: {score} / {quiz.length}
        </p>
        <button className="btn-primary" onClick={handleRetake} style={{ padding: '12px 30px', fontSize: '16px' }}>
          Retake Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-view" style={{ width: '100%', maxWidth: '700px', margin: '0 auto', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: '#7f8c8d' }}>
        <span>Question {currentIdx + 1} of {quiz.length}</span>
        <span>Score: {score}</span>
      </div>
      
      <h3 style={{ fontSize: '22px', marginBottom: '30px', lineHeight: '1.4' }}>{currentQ.question}</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
        {currentQ.options.map((opt, idx) => {
          let bgColor = '#2c2c2c';
          let borderColor = '#333';
          
          if (isSubmitted) {
            if (idx === currentQ.correctAnswer) {
              bgColor = 'rgba(46, 204, 113, 0.2)';
              borderColor = '#2ecc71';
            } else if (idx === selectedAnswer) {
              bgColor = 'rgba(231, 76, 60, 0.2)';
              borderColor = '#e74c3c';
            }
          } else if (idx === selectedAnswer) {
            borderColor = '#3498db';
            bgColor = 'rgba(52, 152, 219, 0.1)';
          }

          return (
            <div 
              key={idx}
              onClick={() => handleSelect(idx)}
              style={{
                padding: '16px 20px',
                borderRadius: '8px',
                border: `2px solid ${borderColor}`,
                backgroundColor: bgColor,
                cursor: isSubmitted ? 'default' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}
            >
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${borderColor}`,
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                backgroundColor: idx === selectedAnswer ? borderColor : 'transparent'
              }}>
                {idx === selectedAnswer && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#fff' }} />}
              </div>
              <span style={{ fontSize: '16px' }}>{String.fromCharCode(65 + idx)}. {opt}</span>
            </div>
          );
        })}
      </div>

      {!isSubmitted ? (
        <button 
          className="btn-primary" 
          onClick={handleSubmit} 
          disabled={selectedAnswer === null}
          style={{ width: '100%', padding: '15px', fontSize: '16px', opacity: selectedAnswer === null ? 0.5 : 1 }}
        >
          Submit Answer
        </button>
      ) : (
        <div style={{ backgroundColor: '#2c3e50', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #3498db' }}>
          <h4 style={{ margin: '0 0 10px 0', color: selectedAnswer === currentQ.correctAnswer ? '#2ecc71' : '#e74c3c' }}>
            {selectedAnswer === currentQ.correctAnswer ? 'Correct!' : 'Incorrect'}
          </h4>
          <p style={{ margin: '0 0 20px 0', lineHeight: '1.5' }}>{currentQ.explanation}</p>
          <button className="btn-primary" onClick={handleNext} style={{ padding: '10px 20px' }}>
            {currentIdx < quiz.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizView;
