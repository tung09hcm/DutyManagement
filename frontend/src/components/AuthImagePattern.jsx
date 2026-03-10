const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-primary/20 via-base-200 to-base-100 p-12 relative overflow-hidden">
      <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-primary/5 blur-2xl" />
      <div className="absolute bottom-10 left-10 w-56 h-56 rounded-full bg-secondary/5 blur-3xl" />
      <div className="max-w-md text-center relative z-10">
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-2xl ${
                i % 2 === 0 ? "bg-primary/20 animate-pulse" : "bg-base-300/60"
              }`}
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-base-content/60 leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;
