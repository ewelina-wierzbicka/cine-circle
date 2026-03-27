import Header from '@/components/Header';
import Image from 'next/image';
import { ReactNode } from 'react';

interface AuthFormLayoutProps {
  children: ReactNode;
}

export default function AuthFormLayout({ children }: AuthFormLayoutProps) {
  return (
    <div className="flex w-full h-full">
      <div className="flex flex-col w-full lg:w-1/2">
        <Header />
        <div className="flex items-center justify-center h-full-screen px-4">
          <div className="w-full sm:w-3/4 xl:w-2/3 p-16 xl:p-24 h-[calc(100vh-240px)] sm:h-auto border border-primary flex items-center justify-center rounded-3xl flex-col">
            {children}
          </div>
        </div>
      </div>
      <div className="hidden lg:flex w-1/2 h-full relative">
        <Image
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
          }}
          fill={true}
          src={'/registration-image.jpg'}
          sizes="(max-width: 1023px) 512px, 586px"
          alt="decorative image"
        />
      </div>
    </div>
  );
}
