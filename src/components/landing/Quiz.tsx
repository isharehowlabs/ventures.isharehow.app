import React from "react";
import styles from "../../styles/landing/Quiz.module.css";
import { QuizQuestion } from "../../types/landing";

interface QuizProps {
  quizStep: number;
  answers: Record<string, number>;
  onAnswer: (qid: string, opt: number) => void;
  onNext: () => void;
  onPrev: () => void;
  quizData: QuizQuestion[];
  isActive: boolean;
}

export const Quiz: React.FC<QuizProps> = ({
  quizStep,
  answers,
  onAnswer,
  onNext,
  onPrev,
  quizData,
  isActive,
}) => {
  if (quizStep >= quizData.length) return null;

  const currentQuestion = quizData[quizStep];

  return (
    <div
      className={`${styles.view} ${isActive ? styles.active : ""}`}
      id="quiz"
    >
      <div className={styles.quizContainer}>
        <div className={styles.quizProgress}>
          <div
            className={styles.quizProgressBar}
            style={{ width: `${((quizStep + 1) / quizData.length) * 100}%` }}
          ></div>
        </div>
        <div id="quizQuestions">
          <div className={`${styles.quizQuestion} ${styles.active}`}>
            <h2>{currentQuestion.question}</h2>
            <p className={styles.quizQuestionSubtitle}>
              {currentQuestion.subtitle}
            </p>
            <div className={styles.quizOptions}>
              {currentQuestion.options.map((opt, idx) => (
                <div
                  key={idx}
                  className={`${styles.quizOption} ${
                    answers[currentQuestion.id] === idx ? styles.selected : ""
                  }`}
                  onClick={() => onAnswer(currentQuestion.id, idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" && onAnswer(currentQuestion.id, idx)
                  }
                >
                  <div className={styles.quizOptionRadio}></div>
                  <div className={styles.quizOptionText}>
                    <div className={styles.quizOptionTitle}>{opt.text}</div>
                    <div className={styles.quizOptionDesc}>
                      {opt.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.quizButtons}>
          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            disabled={quizStep === 0}
            onClick={onPrev}
          >
            Previous
          </button>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={answers[currentQuestion.id] == null}
            onClick={onNext}
          >
            {quizStep === quizData.length - 1 ? "View Results" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

