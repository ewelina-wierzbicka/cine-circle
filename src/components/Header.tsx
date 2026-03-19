'use client';

import { MEDIA_TYPE_OPTIONS } from '@/lib/constants';
import { FilterMediaType } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import Input from './Input';
import Select from './Select';

type Props = {
  searchProps?: {
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    handleIconClick: () => void;
    error?: string;
  };
  mediaType?: FilterMediaType;
  setMediaType?: React.Dispatch<React.SetStateAction<FilterMediaType>>;
};

export default function Header({
  searchProps,
  mediaType,
  setMediaType,
}: Props) {
  return (
    <header>
      <div className="mx-auto px-4 py-6 w-full max-w-content flex align-start justify-between">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="logo"
            width={40}
            height={40}
            style={{ objectFit: 'contain' }}
          />
        </Link>
        {searchProps && mediaType && setMediaType && (
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="w-50">
              <Input
                id="searchMediaHeader"
                variant="search"
                handleChange={searchProps.handleChange}
                handleKeyDown={searchProps.handleKeyDown}
                handleIconClick={searchProps.handleIconClick}
                error={searchProps.error}
              />
            </div>
            <div className="w-full sm:w-39">
              <Select
                value={mediaType}
                options={MEDIA_TYPE_OPTIONS}
                onChange={setMediaType}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
