import Image from "next/image";

const Header = () => {
  return (
    <header>
      <div className="mx-auto p-4 w-full max-w-7xl h-[70] flex align-center">
        <Image src="/logo.png" alt="logo" width={40} height={40} />
      </div>
    </header>
  );
};

export default Header;