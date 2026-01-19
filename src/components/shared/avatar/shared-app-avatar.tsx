import { Avatar } from '@radix-ui/themes';

interface SharedAppAvatarProps {
  size: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
  cpuSize?: string;
}

export function SharedAppAvatar(props: SharedAppAvatarProps) {
  const cpuSize = props.cpuSize || '48';

  return (
    <Avatar
      size={props.size}
      fallback={
        <svg
          width={cpuSize}
          height={cpuSize}
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
            stroke='#90caf9'
            strokeWidth='2'
            fill='rgba(144, 202, 249, 0.1)'
          />
          {/* CPU Corner Details */}
          <circle cx='8' cy='8' r='0.5' fill='#64b5f6' />
          <circle cx='16' cy='8' r='0.5' fill='#64b5f6' />
          <circle cx='8' cy='16' r='0.5' fill='#64b5f6' />
          <circle cx='16' cy='16' r='0.5' fill='#64b5f6' />
          {/* CPU Core */}
          <rect
            x='9'
            y='9'
            width='6'
            height='6'
            rx='1'
            stroke='#e3f2fd'
            strokeWidth='1.5'
            fill='rgba(227, 242, 253, 0.2)'
          />
          {/* Internal Circuits */}
          <line x1='10' y1='11' x2='14' y2='11' stroke='#64b5f6' strokeWidth='0.5' />
          <line x1='10' y1='12.5' x2='14' y2='12.5' stroke='#64b5f6' strokeWidth='0.5' />
          <line x1='10' y1='14' x2='14' y2='14' stroke='#64b5f6' strokeWidth='0.5' />
          <line x1='11' y1='10' x2='11' y2='14' stroke='#64b5f6' strokeWidth='0.5' />
          <line x1='13' y1='10' x2='13' y2='14' stroke='#64b5f6' strokeWidth='0.5' />
          {/* Core Activity Indicators */}
          <circle cx='11.5' cy='11.5' r='0.3' fill='#42a5f5' />
          <circle cx='12.5' cy='12.5' r='0.3' fill='#42a5f5' />
          <circle cx='11.5' cy='13.5' r='0.3' fill='#42a5f5' />
          <circle cx='12.5' cy='11.5' r='0.3' fill='#42a5f5' />
          {/* CPU Pins - Top */}
          <line
            x1='8'
            y1='6'
            x2='8'
            y2='3'
            stroke='#64b5f6'
            strokeWidth='2'
            strokeLinecap='round'
          />
          <circle cx='8' cy='4.5' r='0.4' fill='#42a5f5' />
          <line
            x1='12'
            y1='6'
            x2='12'
            y2='3'
            stroke='#64b5f6'
            strokeWidth='2'
            strokeLinecap='round'
          />
          <circle cx='12' cy='4.5' r='0.4' fill='#42a5f5' />
          <line
            x1='16'
            y1='6'
            x2='16'
            y2='3'
            stroke='#64b5f6'
            strokeWidth='2'
            strokeLinecap='round'
          />
          <circle cx='16' cy='4.5' r='0.4' fill='#42a5f5' />
          {/* CPU Pins - Bottom */}
          <line
            x1='8'
            y1='18'
            x2='8'
            y2='21'
            stroke='#64b5f6'
            strokeWidth='2'
            strokeLinecap='round'
          />
          <circle cx='8' cy='19.5' r='0.4' fill='#42a5f5' />
          <line
            x1='12'
            y1='18'
            x2='12'
            y2='21'
            stroke='#64b5f6'
            strokeWidth='2'
            strokeLinecap='round'
          />
          <circle cx='12' cy='19.5' r='0.4' fill='#42a5f5' />
          <line
            x1='16'
            y1='18'
            x2='16'
            y2='21'
            stroke='#64b5f6'
            strokeWidth='2'
            strokeLinecap='round'
          />
          <circle cx='16' cy='19.5' r='0.4' fill='#42a5f5' />
          {/* CPU Pins - Left */}
          <line
            x1='6'
            y1='8'
            x2='3'
            y2='8'
            stroke='#64b5f6'
            strokeWidth='2'
            strokeLinecap='round'
          />
          <circle cx='4.5' cy='8' r='0.4' fill='#42a5f5' />
          <line
            x1='6'
            y1='12'
            x2='3'
            y2='12'
            stroke='#64b5f6'
            strokeWidth='2'
            strokeLinecap='round'
          />
          <circle cx='4.5' cy='12' r='0.4' fill='#42a5f5' />
          <line
            x1='6'
            y1='16'
            x2='3'
            y2='16'
            stroke='#64b5f6'
            strokeWidth='2'
            strokeLinecap='round'
          />
          <circle cx='4.5' cy='16' r='0.4' fill='#42a5f5' />
          {/* CPU Pins - Right */}
          <line
            x1='18'
            y1='8'
            x2='21'
            y2='8'
            stroke='#64b5f6'
            strokeWidth='2'
            strokeLinecap='round'
          />
          <circle cx='19.5' cy='8' r='0.4' fill='#42a5f5' />
          <line
            x1='18'
            y1='12'
            x2='21'
            y2='12'
            stroke='#64b5f6'
            strokeWidth='2'
            strokeLinecap='round'
          />
          <circle cx='19.5' cy='12' r='0.4' fill='#42a5f5' />
          <line
            x1='18'
            y1='16'
            x2='21'
            y2='16'
            stroke='#64b5f6'
            strokeWidth='2'
            strokeLinecap='round'
          />
          <circle cx='19.5' cy='16' r='0.4' fill='#42a5f5' />

          {/* Share/Link Symbol (three connected nodes) */}
          <circle cx='18' cy='7' r='1' fill='#29b6f6' stroke='#e1f5fe' strokeWidth='0.5' />
          <circle cx='15' cy='12' r='1' fill='#29b6f6' stroke='#e1f5fe' strokeWidth='0.5' />
          <circle cx='21' cy='12' r='1' fill='#29b6f6' stroke='#e1f5fe' strokeWidth='0.5' />
          <line
            x1='18'
            y1='7'
            x2='15'
            y2='12'
            stroke='#4fc3f7'
            strokeWidth='1'
            strokeLinecap='round'
          />
          <line
            x1='18'
            y1='7'
            x2='21'
            y2='12'
            stroke='#4fc3f7'
            strokeWidth='1'
            strokeLinecap='round'
          />
        </svg>
      }
      style={{
        background:
          'linear-gradient(135deg, #0d47a1 0%, #1976d2 25%, #29b6f6 50%, #26c6da 75%, #00acc1 100%)',
        color: 'white',
        marginRight: '10px',
        border: '2px solid rgba(255, 255, 255, 0.25)',
        boxShadow:
          '0 8px 32px rgba(25, 118, 210, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
      }}
    />
  );
}
