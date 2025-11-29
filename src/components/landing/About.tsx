import React from "react";
import styles from "../../styles/landing/About.module.css";

interface AboutProps {
  isActive: boolean;
}

export const About: React.FC<AboutProps> = ({ isActive }) => {
  return (
    <div className={`${styles.view} ${isActive ? styles.active : ""}`} id="about">
      <div className={styles.resultCard}>
        <h2>About iShareHow Labs LLC</h2>
        <p>
          We're building the future of managed services by combining Security Operations Center (SOC)
          expertise with a comprehensive SaaS platform. Our mission is to become the best SOC company
          while delivering end-to-end managed services across infrastructure, security, production,
          applications, and support.
        </p>
        <h3>Our Approach</h3>
        <ul className={styles.serviceFeatures}>
          <li>
            <strong>Security-First Everything:</strong> Every service includes integrated SOC
            monitoring and security oversight
          </li>
          <li>
            <strong>Unified Platform:</strong> Manage all services through a single, intuitive SaaS
            platform
          </li>
          <li>
            <strong>Guaranteed Availability:</strong> SLA-backed uptime commitments across all service
            tiers
          </li>
          <li>
            <strong>Vertical Expertise:</strong> Deep specialization in cybersecurity, media, and
            technology sectors
          </li>
          <li>
            <strong>Continuous Improvement:</strong> Regular performance reviews and proactive
            optimization
          </li>
        </ul>
        <h3>Why Choose Us</h3>
        <p>
          Unlike traditional MSPs, we integrate cybersecurity expertise into every service we offer.
          Our unique combination of SOC capabilities, production services, and comprehensive
          infrastructure management means you get enterprise-grade protection alongside operational
          excellence—all through one unified partner.
        </p>
      </div>
    </div>
  );
};

