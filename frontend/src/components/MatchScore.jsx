export default function MatchScore({ score, size = 'md' }) {
  const color =
    score >= 80 ? 'text-green-600 bg-green-50 border-green-200' :
    score >= 60 ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
    'text-red-500 bg-red-50 border-red-200';

  const sizes = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-base',
    lg: 'w-20 h-20 text-xl',
  };

  return (
    <div className={`${sizes[size]} ${color} border-2 rounded-full flex items-center justify-center font-bold flex-shrink-0`}>
      {Math.round(score)}%
    </div>
  );
}
