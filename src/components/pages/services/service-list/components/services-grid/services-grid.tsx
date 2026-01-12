import React from 'react';

import styles from '../../service-list.module.css';
import { ServiceListItem } from '../../types';
import { ServiceCard } from '../service-card/service-card';
import { ServiceCardSkeleton } from '../service-card-skeleton/service-card-skeleton';

interface ServicesGridProps {
  servicesList: ServiceListItem[];
  isMobile: boolean;
}

export function ServicesGrid({ servicesList, isMobile }: ServicesGridProps) {
  return (
    <div className={styles.servicesGrid}>
      {servicesList.map((serviceItem) => {
        if (serviceItem.loading || serviceItem.error || !serviceItem.serviceData) {
          return (
            <ServiceCardSkeleton
              key={`${serviceItem.pluginType}-${serviceItem.serviceName}`}
              pluginType={serviceItem.pluginType}
              serviceName={serviceItem.serviceName}
              isMobile={isMobile}
            />
          );
        }

        return (
          <ServiceCard
            key={`${serviceItem.pluginType}-${serviceItem.serviceName}`}
            item={serviceItem}
            isMobile={isMobile}
          />
        );
      })}
    </div>
  );
}
