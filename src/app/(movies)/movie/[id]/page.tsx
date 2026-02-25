'use client';

import BorderContainer from '@/components/BorderContainer';
import Loader from '@/components/Loader';
import { useIsTablet } from '@/hooks/useIsTablet';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Step1 from './Step1';
import Step2 from './Step2';

export default function Page() {
  const params = useParams();
  const idRaw = params?.id;
  const id =
    typeof idRaw === 'string'
      ? idRaw.split('-')[0]
      : Array.isArray(idRaw) && idRaw.length > 0
        ? idRaw[0].split('-')[0]
        : undefined;
  const router = useRouter();

  useEffect(() => {
  if (!id) {
    router.push('/');
  }}, [id, router]);

  const [step, setStep] = useState(1);
  const isTablet = useIsTablet();

  const fetchMovieDetails = async () => {
    const res = await fetch(`/api/movie?id=${id}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error || 'Failed to fetch movie details');
    }
    return res.json();
  };

  const {
    data: movie,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['movie', id],
    queryFn: fetchMovieDetails,
    enabled: id !== undefined,
  });

  useEffect(() => {
    if (error) {
      toast.error((error as Error).message);
    }
  }, [error]);

  const addToWatched = () => {
    setStep(2);
  };

  return (
    <>
      {isLoading && <Loader fullScreen={true} />}
      {movie && (
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
            <Step1
              movie={movie}
              addToWatched={addToWatched}
              isTablet={isTablet}
            />
          ) : (
            <Step2 movie={movie} />
          )}
        </BorderContainer>
      )}
    </>
  );
}
