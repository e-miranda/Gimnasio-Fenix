import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  aspectRatio?: 'video' | 'square' | 'wide' | 'auto';
  autoPlay?: boolean;
  interval?: number;
  showThumbnails?: boolean;
  className?: string;
  badge?: string;
  title?: string;
  subtitle?: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  alt,
  aspectRatio = 'square',
  autoPlay = false,
  interval = 4000,
  showThumbnails = false,
  className = '',
  badge,
  title,
  subtitle,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (!autoPlay || isPaused || images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, isPaused, images.length, interval]);

  if (!images || images.length === 0) return null;

  const nextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-16/9 sm:aspect-21/9',
    auto: 'h-64 sm:h-80',
  }[aspectRatio];

  return (
    <div
      className={`relative overflow-hidden group select-none ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Image Container */}
      <div className={`relative w-full ${aspectClasses} overflow-hidden bg-slate-950`}>
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`${alt} - Foto ${idx + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out ${
              idx === currentIndex
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105 pointer-events-none'
            }`}
          />
        ))}

        {/* Gradient Overlay for text readability */}
        {(title || subtitle || badge) && (
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-4 sm:p-6">
            {badge && (
              <span className="self-start text-[10px] font-mono uppercase font-black px-2 py-0.5 rounded bg-red-600 text-white mb-1.5 shadow-md">
                {badge}
              </span>
            )}
            {title && (
              <h3 className="text-lg sm:text-2xl font-black text-white font-mono leading-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl line-clamp-2">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Counter Badge */}
        {images.length > 1 && (
          <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 border border-slate-800 z-10">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-red-600 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm z-10 active:scale-90"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Foto siguiente"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-red-600 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm z-10 active:scale-90"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {images.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(dotIdx);
                }}
                aria-label={`Ir a imagen ${dotIdx + 1}`}
                className={`transition-all rounded-full ${
                  dotIdx === currentIndex
                    ? 'w-5 h-1.5 bg-red-500'
                    : 'w-1.5 h-1.5 bg-white/50 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Optional Thumbnail Strip */}
      {showThumbnails && images.length > 1 && (
        <div className="flex items-center gap-2 mt-2 px-1 overflow-x-auto scrollbar-none py-1">
          {images.map((img, tIdx) => (
            <button
              key={tIdx}
              onClick={() => setCurrentIndex(tIdx)}
              className={`relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                tIdx === currentIndex
                  ? 'border-red-500 scale-105 shadow-md shadow-red-500/20'
                  : 'border-slate-800 opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`Miniatura ${tIdx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
