import BorderContainer from '@/components/BorderContainer';
import MoviePoster from '@/components/MoviePoster';
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

export default function MovieDetailWrapper({
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
        <MoviePoster posterPath={posterPath} title={posterTitle} />
      )}
      {step === 1 ? infoSlot : formSlot}
    </BorderContainer>
  );
}
