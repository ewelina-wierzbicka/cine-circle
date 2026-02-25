const BorderContainer = ({
  children,
  className,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) => {
  return (
    <div
      className={`w-full min-h-full-screen border border-primary rounded-3xl px-4 lg:px-14 py-4 md:py-10 ${className ? className : ''}`}
    >
      {children}
    </div>
  );
};

export default BorderContainer;
