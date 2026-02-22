const Loader = ({ fullScreen }: { fullScreen?: boolean }) => {
  return (
    <div
      className={`flex items-center justify-center ${fullScreen ? 'h-full-screen' : ''} w-full`}
    >
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;
