import { Image, ImageProps } from '@/components';

export function WebsiteLogo(props: Omit<ImageProps, 'width' | 'src' | 'alt'>) {
  return <Image src='/logo.png' alt='Logo' {...props} />;
}
