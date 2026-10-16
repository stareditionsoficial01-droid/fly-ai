import React, { useState } from 'react';

interface FlyLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
  className?: string;
  variant?: 'full' | 'icon-only';
}

export const FlyLogo: React.FC<FlyLogoProps> = ({
  size = 'md',
  showSlogan = false,
  className = '',
  variant = 'full',
}) => {
  const [imgError, setImgError] = useState(false);

  const iconSizes = {
    xs: 'w-6 h-6 rounded-lg',
    sm: 'w-7 h-7 sm:w-8 sm:h-8 rounded-xl',
    md: 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl',
    lg: 'w-12 h-12 sm:w-14 sm:h-14 rounded-2xl',
    xl: 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl',
  };

  const textSizes = {
    xs: 'text-sm font-bold',
    sm: 'text-base font-extrabold tracking-tight',
    md: 'text-lg sm:text-xl font-black tracking-tight',
    lg: 'text-2xl sm:text-3xl font-black tracking-tight',
    xl: 'text-3xl sm:text-4xl font-black tracking-tight',
  };

  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 ${className}`}>
      {/* Official Fly AI Aerodynamic Origami Emblem */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white shadow-md shadow-blue-500/25 transition-all transform overflow-hidden shrink-0 group-hover:scale-105`}
      >
        {!imgError ? (
          <img
            src="/src/assets/images/fly_ai_logo_1792106562585.jpg"
            alt="Logotipo Oficial Fly AI"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300"
          />
        ) : (
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[78%] h-[78%] transform -rotate-12 translate-x-[2%] translate-y-[2%] drop-shadow-sm"
          >
            <path d="M83 17L31 71L18 48Z" fill="#1D4ED8" fillOpacity="0.25" />
            <path d="M31 73L36 60L83 17Z" fill="#CBD5E1" />
            <path d="M17 47L31 73L83 17Z" fill="#E2E8F0" />
            <path d="M31 73L49 53L83 17Z" fill="#CBD5E1" />
            <path d="M36 60L83 17L50 51Z" fill="#E0F2FE" />
            <path d="M83 17L36 60L59 81L83 17Z" fill="#FFFFFF" />
            <path d="M83 17L50 51L64 36Z" fill="#FFFFFF" fillOpacity="0.6" />
          </svg>
        )}
      </div>

      {variant === 'full' && (
        <div className="flex flex-col justify-center select-none">
          <div className="flex items-center gap-1 leading-none">
            <span className={`${textSizes[size]} text-slate-900 dark:text-white`}>
              Fly
            </span>
            <span className={`${textSizes[size]} text-blue-600 dark:text-blue-400`}>
              AI
            </span>
          </div>
          {showSlogan && (
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 tracking-normal">
              Sua ideia. Nossa inteligência.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
