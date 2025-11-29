import React from "react";
import styles from "../../styles/landing/Results.module.css";
import { ServiceScore } from "../../types/landing";

interface ResultsProps {
  topServices: ServiceScore[];
  onResetQuiz: () => void;
  onNav: (view: "services" | "quiz" | "about" | "results") => void;
  isActive: boolean;
}

export const Results: React.FC<ResultsProps> = ({ topServices, onResetQuiz, onNav, isActive }) => {
  return (
    <div className={`${styles.view} ${isActive ? styles.active : ""}`} id="results">
      <div className={styles.resultsContainer}>
        <div className={styles.resultCard}>
          <div className={styles.resultHeader}>
            <div className={styles.resultIcon}>✨</div>
            <div className={styles.resultTitle}>
              <h2>Your Recommended Services</h2>
              <p>Based on your responses, here are the services that best fit your needs.</p>
            </div>
          </div>
        </div>
        {topServices.map((service, index) => (
          <div className={styles.resultCard} key={service.key}>
            <div className={styles.resultHeader}>
              <div className={styles.resultIcon}>{service.icon}</div>
              <div className={styles.resultTitle}>
                <h2>{service.name}</h2>
              </div>
              <div className={styles.resultScore}>
                {index === 0 ? "Top Match" : `#${index + 1} Priority`}
              </div>
            </div>
            <p className={styles.resultDescription}>{service.description}</p>
            <div className={styles.resultServices}>
              {service.includes.map((item, idx) => (
                <div className={styles.resultService} key={idx}>
                  <div className={styles.resultServiceIcon}>✓</div>
                  <div>{item}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className={styles.ctaSection}>
          <h3>Ready to Get Started?</h3>
          <p>
            Let's discuss how our managed services can transform your organization with security-first
            infrastructure and guaranteed availability.
          </p>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onResetQuiz}>
            Retake Quiz
          </button>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => onNav("services")}>
            View All Services
          </button>
        </div>
      </div>
    </div>
  );
};

