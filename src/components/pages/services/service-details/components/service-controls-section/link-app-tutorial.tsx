import { Link1Icon } from '@radix-ui/react-icons';
import React, { useEffect, useState } from 'react';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../service-details.module.css';

const TUTORIAL_STORAGE_KEY = 'service_link_app_tutorial_seen';

interface LinkAppTutorialProps {
  targetRef: React.RefObject<HTMLDivElement>;
}

export function LinkAppTutorial({ targetRef }: LinkAppTutorialProps) {
  const { t } = usePageTranslation();
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialDismissable, setTutorialDismissable] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (!seen) {
      const timer = setTimeout(() => {
        if (window.innerWidth > 800) setShowTutorial(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!showTutorial) return;
    setTutorialDismissable(false);
    const timer = setTimeout(() => setTutorialDismissable(true), 1500);
    return () => clearTimeout(timer);
  }, [showTutorial]);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;
    if (showTutorial) {
      el.classList.add(styles.linkAppButtonHighlighted);
    } else {
      el.classList.remove(styles.linkAppButtonHighlighted);
    }
  }, [showTutorial, targetRef]);

  useEffect(() => {
    if (!showTutorial || !targetRef.current) return;

    const updatePosition = () => {
      if (!targetRef.current) return;
      const rect = targetRef.current.getBoundingClientRect();
      const boxWidth = 340;
      const margin = 16;
      let left = rect.right - boxWidth - 64;
      if (left < margin) left = margin;
      if (left + boxWidth > window.innerWidth - margin)
        left = window.innerWidth - boxWidth - margin;
      setTooltipStyle({ top: rect.bottom + 12, left });
    };

    updatePosition();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, { passive: true });
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [showTutorial, targetRef]);

  const dismiss = () => {
    if (!tutorialDismissable) return;
    if (typeof window !== 'undefined') localStorage.setItem(TUTORIAL_STORAGE_KEY, '1');
    setShowTutorial(false);
  };

  if (!showTutorial) return null;

  return (
    <>
      <div
        className={styles.linkAppTutorialOverlay}
        onClick={dismiss}
        style={!tutorialDismissable ? { cursor: 'default' } : undefined}
      />
      <div className={styles.linkAppTutorialBox} style={tooltipStyle}>
        <div className={styles.linkAppTutorialTitle}>
          <Link1Icon className={styles.linkAppTutorialIcon} width={16} height={16} />
          {t('services.s.controls.linkTutorial.title')}
        </div>
        <p className={styles.linkAppTutorialBody}>{t('services.s.controls.linkTutorial.body')}</p>
        <button
          className={styles.linkAppTutorialButton}
          onClick={dismiss}
          disabled={!tutorialDismissable}
        >
          {t('services.s.controls.linkTutorial.dismiss')}
        </button>
      </div>
    </>
  );
}
