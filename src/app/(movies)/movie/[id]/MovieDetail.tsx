'use client';

import BorderContainer from '@/components/BorderContainer';
import { useIsTablet } from '@/hooks/useIsTablet';
import { Movie } from '@/types';
import Image from 'next/image';
import { useState } from 'react';
import Step1 from './Step1';
import Step2 from './Step2';

type Props = {
  movie: Movie;
};

export default function MovieDetail({ movie }: Props) {
  const [step, setStep] = useState(1);
  const isTablet = useIsTablet();

  const addToWatched = () => setStep(2);

  return (
    <BorderContainer
      className={`flex gap-8 h-full-screen flex-col ${step === 1 ? 'md:flex-row' : 'lg:flex-row'}`}
    >
      {(step === 1 || !isTablet) && (
        <div className="h-3/5 md:h-full aspect-3/4 relative overflow-hidden rounded-2xl shrink-0 md:shrink lg:shrink-0">
          <div className="bg-linear-to-b from-transparent via-dark/30 via-30% to-dark to-80% absolute bottom-0 left-0 w-full h-3/4 z-10 pointer-events-none" />
          <Image
            style={{
              objectFit: 'cover',
              objectPosition: 'top center',
            }}
            fill={true}
            src={
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
                : '/no-image.jpg'
            }
            sizes="(max-width: 767px) 701px, (max-width: 1023px) 351px, 586px"
            alt={movie.title}
          />
        </div>
      )}
      {step === 1 ? (
        <Step1 movie={movie} addToWatched={addToWatched} isTablet={isTablet} />
      ) : (
        <Step2 movie={movie} />
      )}
    </BorderContainer>
  );
}
