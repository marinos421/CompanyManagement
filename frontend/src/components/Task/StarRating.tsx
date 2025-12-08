import React from "react";

interface Props {
  rating: number;
  onRate?: (rating: number) => void; // Optional: Αν υπάρχει, γίνεται interactive
  size?: "sm" | "md" | "lg";
}

const StarRating: React.FC<Props> = ({ rating, onRate, size = "md" }) => {
  const iconSize = size === "sm" ? "w-3 h-3" : size === "md" ? "w-5 h-5" : "w-6 h-6";

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate && onRate(star)}
          disabled={!onRate}
          className={`${onRate ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition duration-150`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className={`${iconSize} ${star <= rating ? 'text-yellow-400' : 'text-slate-600'}`}
          >
            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
          </svg>
        </button>
      ))}
    </div>
  );
};

export default StarRating;