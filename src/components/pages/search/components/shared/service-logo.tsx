import NextImage from 'next/image';

interface ServiceLogoProps {
  src: string;
  alt: string;
  imgSize?: number;
  className?: string;
}

export function ServiceLogo({ src, alt, imgSize = 56, className }: ServiceLogoProps) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <NextImage
        src={src}
        alt={alt}
        width={imgSize}
        height={imgSize}
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
}
