import { Avatar } from '@radix-ui/themes';

import styles from '../../app-list.module.css';

export function AppAvatar() {
  return (
    <Avatar
      size='6'
      fallback={
        <svg
          width='48'
          height='48'
          viewBox='0 0 24 24'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          {/* CPU Body */}
          <rect
            x='6'
            y='6'
            width='12'
            height='12'
            rx='2'
            stroke='#e1bee7'
            strokeWidth='2'
            fill='rgba(225, 190, 231, 0.1)'
          />
          {/* CPU Corner Details */}
          <circle cx='8' cy='8' r='0.5' fill='#ce93d8' />
          <circle cx='16' cy='8' r='0.5' fill='#ce93d8' />
          <circle cx='8' cy='16' r='0.5' fill='#ce93d8' />
          <circle cx='16' cy='16' r='0.5' fill='#ce93d8' />
          {/* CPU Core */}
          <rect
            x='9'
            y='9'
            width='6'
            height='6'
            rx='1'
            stroke='#f3e5f5'
            strokeWidth='1.5'
            fill='rgba(243, 229, 245, 0.2)'
          />
          {/* Internal Circuits */}
          <line x1='10' y1='11' x2='14' y2='11' stroke='#ce93d8' strokeWidth='0.5' />
          <line x1='10' y1='12.5' x2='14' y2='12.5' stroke='#ce93d8' strokeWidth='0.5' />
          <line x1='10' y1='14' x2='14' y2='14' stroke='#ce93d8' strokeWidth='0.5' />
          <line x1='11' y1='10' x2='11' y2='14' stroke='#ce93d8' strokeWidth='0.5' />
          <line x1='13' y1='10' x2='13' y2='14' stroke='#ce93d8' strokeWidth='0.5' />
          {/* Core Activity Indicators */}
          <circle cx='11.5' cy='11.5' r='0.3' fill='#ba68c8' />
          <circle cx='12.5' cy='12.5' r='0.3' fill='#ba68c8' />
          <circle cx='11.5' cy='13.5' r='0.3' fill='#ba68c8' />
          <circle cx='12.5' cy='11.5' r='0.3' fill='#ba68c8' />
          {/* CPU Pins - Top */}
          <line
            x1='8'
            y1='6'
            x2='8'
            y2='3'
            stroke='#ce93d8'
            strokeWidth='2'
            strokeLinecap='round'
            className={styles.energyLine}
          />
          <circle cx='8' cy='4.5' r='0.4' fill='#ba68c8' />
          <line
            x1='12'
            y1='6'
            x2='12'
            y2='3'
            stroke='#ce93d8'
            strokeWidth='2'
            strokeLinecap='round'
            className={styles.energyLine}
          />
          <circle cx='12' cy='4.5' r='0.4' fill='#ba68c8' />
          <line
            x1='16'
            y1='6'
            x2='16'
            y2='3'
            stroke='#ce93d8'
            strokeWidth='2'
            strokeLinecap='round'
            className={styles.energyLine}
          />
          <circle cx='16' cy='4.5' r='0.4' fill='#ba68c8' />
          {/* CPU Pins - Bottom */}
          <line
            x1='8'
            y1='18'
            x2='8'
            y2='21'
            stroke='#ce93d8'
            strokeWidth='2'
            strokeLinecap='round'
            className={styles.energyLine}
          />
          <circle cx='8' cy='19.5' r='0.4' fill='#ba68c8' />
          <line
            x1='12'
            y1='18'
            x2='12'
            y2='21'
            stroke='#ce93d8'
            strokeWidth='2'
            strokeLinecap='round'
            className={styles.energyLine}
          />
          <circle cx='12' cy='19.5' r='0.4' fill='#ba68c8' />
          <line
            x1='16'
            y1='18'
            x2='16'
            y2='21'
            stroke='#ce93d8'
            strokeWidth='2'
            strokeLinecap='round'
            className={styles.energyLine}
          />
          <circle cx='16' cy='19.5' r='0.4' fill='#ba68c8' />
          {/* CPU Pins - Left */}
          <line
            x1='6'
            y1='8'
            x2='3'
            y2='8'
            stroke='#ce93d8'
            strokeWidth='2'
            strokeLinecap='round'
            className={styles.energyLine}
          />
          <circle cx='4.5' cy='8' r='0.4' fill='#ba68c8' />
          <line
            x1='6'
            y1='12'
            x2='3'
            y2='12'
            stroke='#ce93d8'
            strokeWidth='2'
            strokeLinecap='round'
            className={styles.energyLine}
          />
          <circle cx='4.5' cy='12' r='0.4' fill='#ba68c8' />
          <line
            x1='6'
            y1='16'
            x2='3'
            y2='16'
            stroke='#ce93d8'
            strokeWidth='2'
            strokeLinecap='round'
            className={styles.energyLine}
          />
          <circle cx='4.5' cy='16' r='0.4' fill='#ba68c8' />
          {/* CPU Pins - Right */}
          <line
            x1='18'
            y1='8'
            x2='21'
            y2='8'
            stroke='#ce93d8'
            strokeWidth='2'
            strokeLinecap='round'
            className={styles.energyLine}
          />
          <circle cx='19.5' cy='8' r='0.4' fill='#ba68c8' />
          <line
            x1='18'
            y1='12'
            x2='21'
            y2='12'
            stroke='#ce93d8'
            strokeWidth='2'
            strokeLinecap='round'
            className={styles.energyLine}
          />
          <circle cx='19.5' cy='12' r='0.4' fill='#ba68c8' />
          <line
            x1='18'
            y1='16'
            x2='21'
            y2='16'
            stroke='#ce93d8'
            strokeWidth='2'
            strokeLinecap='round'
            className={styles.energyLine}
          />
          <circle cx='19.5' cy='16' r='0.4' fill='#ba68c8' />
        </svg>
      }
      style={{
        background:
          'linear-gradient(135deg, #6a1b9a 0%, #8e24aa 25%, #ab47bc 50%, #9c5cb5 75%, #7b1fa2 100%)',
        color: 'white',
        marginRight: '10px',
        border: '2px solid rgba(255, 255, 255, 0.25)',
        boxShadow:
          '0 8px 32px rgba(142, 36, 170, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
      }}
    />
  );
}
