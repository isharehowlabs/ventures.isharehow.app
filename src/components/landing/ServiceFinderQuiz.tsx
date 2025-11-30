import React from "react";
import styles from "../../styles/landing/ServiceFinderQuiz.module.css";
import { QuizQuestion, ServiceScore } from "../../types/landing";

interface ServiceFinderQuizProps {
  quizStep: number;
  answers: Record<string, number>;
  onAnswer: (qid: string, opt: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  quizData: QuizQuestion[];
  topServices: ServiceScore[];
  onNav: (view: "services" | "quiz" | "about" | "results") => void;
}

export const ServiceFinderQuiz: React.FC<ServiceFinderQuizProps> = ({
  quizStep,
  answers,
  onAnswer,
  onNext,
  onPrev,
  onReset,
  quizData,
  topServices,
  onNav,
}) => {
  const isQuizComplete = quizStep >= quizData.length;
  const currentQuestion = !isQuizComplete ? quizData[quizStep] : null;

  return (
    <div className={styles.container}>
      {/* Header - Always visible */}
      <div className={styles.header}>
        <h2 className={styles.title}>
          {isQuizComplete ? "Your Recommended Services" : "Service Finder Quiz"}
        </h2>
        <p className={styles.subtitle}>
          {isQuizComplete
            ? "Based on your responses, here are the services that best fit your needs."
            : "Answer a few questions to discover which services are perfect for you."}
        </p>
      </div>

      {/* Quiz Section - Show when not complete */}
      {!isQuizComplete && currentQuestion && (
        <div className={styles.quizSection}>
          {/* Progress Bar */}
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${((quizStep + 1) / quizData.length) * 100}%` }}
            />
          </div>

          {/* Current Question */}
          <div className={styles.questionCard}>
            <div className={styles.questionHeader}>
              <span className={styles.questionNumber}>
                Question {quizStep + 1} of {quizData.length}
              </span>
              <h3 className={styles.questionText}>{currentQuestion.question}</h3>
              {currentQuestion.subtitle && (
                <p className={styles.questionSubtitle}>{currentQuestion.subtitle}</p>
              )}
            </div>

            {/* Options */}
            <div className={styles.options}>
              {currentQuestion.options.map((opt, idx) => (
                <div
                  key={idx}
                  className={`${styles.option} ${
                    answers[currentQuestion.id] === idx ? styles.selected : ""
                  }`}
                  onClick={() => onAnswer(currentQuestion.id, idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" && onAnswer(currentQuestion.id, idx)
                  }
                >
                  <div className={styles.radioButton}>
                    <div className={styles.radioInner} />
                  </div>
                  <div className={styles.optionContent}>
                    <div className={styles.optionTitle}>{opt.text}</div>
                    {opt.description && (
                      <div className={styles.optionDescription}>{opt.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className={styles.navButtons}>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                disabled={quizStep === 0}
                onClick={onPrev}
              >
                ← Previous
              </button>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={answers[currentQuestion.id] === undefined}
                onClick={onNext}
              >
                {quizStep === quizData.length - 1 ? "See Results →" : "Next →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Section - Show when complete */}
      {isQuizComplete && (
        <div className={styles.resultsSection}>
          {/* Top Match - Featured */}
          {topServices[0] && (
            <div className={`${styles.resultCard} ${styles.topMatch}`}>
              <div className={styles.topMatchBadge}>
                <span>🏆 Top Match</span>
              </div>
              <div className={styles.resultHeader}>
                <div className={styles.resultIcon}>{topServices[0].icon}</div>
                <div className={styles.resultInfo}>
                  <h3 className={styles.resultTitle}>{topServices[0].name}</h3>
                  <p className={styles.resultDescription}>
                    {topServices[0].description}
                  </p>
                </div>
              </div>
              <div className={styles.features}>
                {topServices[0].includes.map((item, idx) => (
                  <div className={styles.feature} key={idx}>
                    <span className={styles.checkmark}>✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Matches */}
          {topServices.slice(1).map((service, index) => (
            <div className={styles.resultCard} key={service.key}>
              <div className={styles.resultHeader}>
                <div className={styles.resultIconSmall}>{service.icon}</div>
                <div className={styles.resultInfo}>
                  <div className={styles.resultTitleRow}>
                    <h4 className={styles.resultTitleSmall}>{service.name}</h4>
                    <span className={styles.priorityBadge}>
                      #{index + 2} Priority
                    </span>
                  </div>
                  <p className={styles.resultDescriptionSmall}>
                    {service.description}
                  </p>
                </div>
              </div>
              <div className={styles.featuresCompact}>
                {service.includes.slice(0, 3).map((item, idx) => (
                  <div className={styles.featureCompact} key={idx}>
                    <span className={styles.checkmarkSmall}>✓</span>
                    <span>{item}</span>
                  </div>
                ))}
                {service.includes.length > 3 && (
                  <div className={styles.featureMore}>
                    +{service.includes.length - 3} more features
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* CTA Section */}
          <div className={styles.ctaCard}>
            <h3 className={styles.ctaTitle}>Ready to Get Started?</h3>
            <p className={styles.ctaText}>
              Let's discuss how our managed services can transform your organization
              with security-first infrastructure and guaranteed availability.
            </p>
            <div className={styles.ctaButtons}>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => onNav("services")}
              >
                View All Services
              </button>
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={onReset}
              >
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
