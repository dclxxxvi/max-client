import type { SVGProps } from 'react';

const base: SVGProps<SVGSVGElement> = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export const SendIcon = () => (
  <svg {...base} fill="currentColor" stroke="none">
    <path d="M3.4 20.4 21.3 12.8a.9.9 0 0 0 0-1.6L3.4 3.6a.9.9 0 0 0-1.2 1.1L4.6 11 13 12l-8.4 1-2.4 6.3a.9.9 0 0 0 1.2 1.1Z" />
  </svg>
);

export const PlusIcon = () => (
  <svg {...base}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const BackIcon = () => (
  <svg {...base}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const LogoutIcon = () => (
  <svg {...base}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);

export const CheckIcon = ({ double }: { double?: boolean }) => (
  <svg {...base} width={16} height={16} viewBox="0 0 18 12" strokeWidth={1.6}>
    <path d="m1 6.5 3.5 3.5L11 2" />
    {double && <path d="m7.5 10 .5.5L16.5 2" />}
  </svg>
);

export const ClockIcon = () => (
  <svg {...base} width={13} height={13} strokeWidth={2.2}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const AlertIcon = () => (
  <svg {...base} width={14} height={14} strokeWidth={2.2}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4M12 16h.01" />
  </svg>
);
