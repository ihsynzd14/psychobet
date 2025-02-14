import { useMemo, useRef } from 'react';

interface Color {
  r: number;
  g: number;
  b: number;
}

interface TeamJerseyProps {
  color1: Color;
  color2: Color;
  className?: string;
  type: 'home' | 'away';
}

function areColorsEqual(color1: Color, color2: Color): boolean {
    return (
        color1.r === color2.r &&
        color1.g === color2.g &&
        color1.b === color2.b
    );
}

export function TeamJersey({ color1, color2, className = '', type }: TeamJerseyProps) {
  const prevColor1Ref = useRef<Color | null>(null);
  const prevColor2Ref = useRef<Color | null>(null);

  const primaryColor = useMemo(() => {
    if (prevColor1Ref.current && areColorsEqual(prevColor1Ref.current, color1)) {
        return `rgb(${prevColor1Ref.current.r}, ${prevColor1Ref.current.g}, ${prevColor1Ref.current.b})`;
    }
    prevColor1Ref.current = color1;
    return `rgb(${color1.r}, ${color1.g}, ${color1.b})`;
  }, [color1]);

  const secondaryColor = useMemo(() => {
    if (prevColor2Ref.current && areColorsEqual(prevColor2Ref.current, color2)) {
        return `rgb(${prevColor2Ref.current.r}, ${prevColor2Ref.current.g}, ${prevColor2Ref.current.b})`;
    }
    prevColor2Ref.current = color2;
    return `rgb(${color2.r}, ${color2.g}, ${color2.b})`;
  }, [color2]);

  return (
      <div className={className}>
        {type === 'home' ? (
          <div className="inline-block w-12 h-20"> {/* Adjust w and h as needed */}
            <svg viewBox="0 0 769 951" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M143.069 559H625.553L671 940.69H408.28L387.494 728.686L364.078 940.69H97L143.069 559Z" fill={secondaryColor} stroke="black" strokeWidth="20" strokeLinejoin="round"/>
                <path d="M307.276 10L135.398 55.9955L72.6991 136.609L10 217.222L96.6652 287.91L135.398 250.629V522.729H631.665V250.629L681.05 287.91L759 217.222L631.665 55.9955L457.851 10C448.974 25.3318 421.635 55.9955 383.29 55.9955C344.944 55.9955 316.637 25.3318 307.276 10Z" fill={primaryColor} stroke="black" strokeWidth="20" strokeLinejoin="round"/>
            </svg>
           </div>
        ) : (
           <div className="inline-block w-12 h-20"> {/* Adjust w and h as needed */}
                <svg viewBox="0 0 769 951" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <path d="M143.069 559H625.553L671 940.69H408.28L387.494 728.686L364.078 940.69H97L143.069 559Z" fill={secondaryColor} stroke="black" strokeWidth="20" strokeLinejoin="round"/>
                    <path d="M307.276 10L135.398 55.9955L72.6991 136.609L10 217.222L96.6652 287.91L135.398 250.629V522.729H631.665V250.629L681.05 287.91L759 217.222L631.665 55.9955L457.851 10C448.974 25.3318 421.635 55.9955 383.29 55.9955C344.944 55.9955 316.637 25.3318 307.276 10Z" fill={primaryColor} stroke="black" strokeWidth="20" strokeLinejoin="round"/>
               </svg>
           </div>
        )}
    </div>
  );
}