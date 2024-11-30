function LoadingDots({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-primary-100 rounded-full animate-bounce" />
        <div className="w-3 h-3 bg-primary-100 rounded-full animate-bounce [animation-delay:-.3s]" />
        <div className="w-3 h-3 bg-primary-100 rounded-full animate-bounce [animation-delay:-.5s]" />
      </div>
      <div className="mt-4 text-text-200">{text}</div>
    </div>
  );
}

export default LoadingDots; 