'use client';

import Button from '@/components/Button';
import DatePicker from '@/components/DatePicker';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import { Movie, MovieWatchedType } from '@/types';
import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';

type Props = {
  movie: Movie;
};

const Step2: FC<Props> = ({ movie }) => {
  const [selectedDate, setSelectedDate] = useState<Date>();

  const { register, handleSubmit } = useForm<MovieWatchedType>();

  return (
    <form
      onSubmit={handleSubmit((data) => console.log(data))}
      className="w-full lg:w-2/5 h-full mx-auto flex flex-col justify-between"
    >
      <p className="text-2xl lg:text-3xl text-center">
        Adding <span className="font-bold">&quot;{movie.title}&quot;</span>{' '}
      </p>
      <div className="flex gap-8 flex-col">
        <div>
          <label htmlFor="watched_date">When did you watch it?</label>
          <DatePicker
            id="watched_date"
            {...register('watched_date')}
            className="mt-3 lg:mt-6"
            handleChange={setSelectedDate}
            selected={selectedDate}
          />
        </div>
        <div>
          <label htmlFor="rating">How did you like it?</label>
          <div className="mt-3 lg:mt-6">
            <Input
              id="rating"
              variant="rating"
              type="number"
              {...register('rating')}
            />
          </div>
        </div>
        <div>
          <label htmlFor="review">Any thoughts?</label>
          <Textarea
            id="review"
            {...register('review')}
            className="mt-3 lg:mt-6"
          />
        </div>
      </div>
      <Button
        type="submit"
        text="SAVE"
        size="small"
      />
    </form>
  );
};

export default Step2;
