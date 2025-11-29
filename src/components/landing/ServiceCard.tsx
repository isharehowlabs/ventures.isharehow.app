import React from "react";
import styles from "../../styles/landing/ServiceCard.module.css";
import { Service } from "../../types/landing";

interface ServiceCardProps {
  service: Service & { key: string };
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  return (
    <div className={styles.serviceCard} data-service={service.key}>
      <div className={styles.serviceIcon}>{service.icon}</div>
      <h3>{service.name}</h3>
      <p>{service.description}</p>
      <ul className={styles.serviceFeatures}>
        {service.includes.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
    </div>
  );
};

