'use client';

import { useEffect } from 'react';
import { toast } from 'react-toastify';

type Props = {
  message: string;
};

export default function ErrorToast({ message }: Props) {
  useEffect(() => {
    toast.error(message);
  }, [message]);

  return null;
}
