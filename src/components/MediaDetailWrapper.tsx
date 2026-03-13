import BorderContainer from '@/components/BorderContainer';
import MediaPoster from '@/components/MediaPoster';
import { ReactNode } from 'react';

type Props = {
  posterPath?: string;
  posterTitle: string;
  step: number;
  isTablet: boolean;
  infoSlot: ReactNode;
  formSlot: ReactNode;
  className?: string;
};

export default function MediaDetailWrapper({
  posterPath,
  posterTitle,
  step,
  isTablet,
  infoSlot,
  formSlot,
  className,
}: Props) {
  return (
    <BorderContainer
      className={`flex gap-8 flex-col ${step === 1 ? 'md:flex-row' : 'lg:flex-row'} ${className ?? ''}`}
    >
      {(step === 1 || !isTablet) && (
        <MediaPoster posterPath={posterPath} title={posterTitle} />
      )}
      {step === 1 ? infoSlot : formSlot}
    </BorderContainer>
  );
}
