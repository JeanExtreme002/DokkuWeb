export const PadLockIcon = ({ isUnlocked }: { isUnlocked?: boolean }) => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
    {isUnlocked ? (
      <path
        d='M6 10V8C6 5.79086 7.79086 4 10 4H14C16.2091 4 18 5.79086 18 8M6 10H18M6 10V18C6 19.1046 6.89543 20 8 20H16C17.1046 20 18 19.1046 18 18V10'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    ) : (
      <>
        <rect
          x='3'
          y='11'
          width='18'
          height='11'
          rx='2'
          ry='2'
          stroke='currentColor'
          strokeWidth='2'
          fill='none'
        />
        <path
          d='M7 11V7C7 4.79086 8.79086 3 11 3H13C15.2091 3 17 4.79086 17 7V11'
          stroke='currentColor'
          strokeWidth='2'
          fill='none'
        />
      </>
    )}
  </svg>
);
