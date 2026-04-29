import { RocketIcon } from '@radix-ui/react-icons';
import React, { useEffect, useState } from 'react';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../app-details.module.css';

const TUTORIAL_STORAGE_KEY = 'app_deploy_tutorial_seen';

interface DeployTutorialProps {
  targetRef: React.RefObject<HTMLDivElement>;
}

export function DeployTutorial({ targetRef }: DeployTutorialProps) {
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
      el.classList.add(styles.deploySectionHighlighted);
    } else {
      el.classList.remove(styles.deploySectionHighlighted);
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
        className={styles.deployTutorialOverlay}
        onClick={dismiss}
        style={!tutorialDismissable ? { cursor: 'default' } : undefined}
      />
      <div className={styles.deployTutorialBox} style={tooltipStyle}>
        <div className={styles.deployTutorialTitle}>
          <RocketIcon className={styles.deployTutorialIcon} width={16} height={16} />
          {t('deployTutorial.title')}
        </div>
        <p className={styles.deployTutorialBody}>{t('deployTutorial.body')}</p>
        <button
          className={styles.deployTutorialButton}
          onClick={dismiss}
          disabled={!tutorialDismissable}
        >
          {t('deployTutorial.dismiss')}
        </button>
      </div>
    </>
  );
}
