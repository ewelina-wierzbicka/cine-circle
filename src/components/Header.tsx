import Image from 'next/image';
import Link from 'next/link';
import Input from './Input';

type Props = {
  searchProps?: {
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    handleIconClick: () => void;
    error?: string;
  };
};

const Header = ({ searchProps }: Props) => {
  return (
    <header>
      <div className="mx-auto p-6 w-full max-w-content flex align-start justify-between">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="logo"
            width={40}
            height={40}
            style={{ objectFit: 'contain' }}
          />
        </Link>
        {searchProps && (
          <div className="w-50">
            <Input
              id="searchMovie"
              type="search"
              handleChange={searchProps.handleChange}
              handleKeyDown={searchProps.handleKeyDown}
              handleIconClick={searchProps.handleIconClick}
              error={searchProps.error}
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
