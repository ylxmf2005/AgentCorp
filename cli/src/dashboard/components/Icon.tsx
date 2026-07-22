import type { SVGProps } from 'react';

export type IconName =
  | 'alert-triangle'
  | 'alert-circle'
  | 'arrow-left'
  | 'check'
  | 'check-circle'
  | 'chevron-down'
  | 'chevron-right'
  | 'circle'
  | 'clock'
  | 'copy'
  | 'external-link'
  | 'file-text'
  | 'file'
  | 'folder'
  | 'layers'
  | 'maximize'
  | 'refresh'
  | 'search'
  | 'sun'
  | 'moon'
  | 'x-circle'
  | 'zap';

// Minimal stroke icon set (24x24 grid, 1.6px stroke, round joins). Chosen for
// a consistent, professional look that matches the design system without any
// external icon dependency or network fetch.
const PATHS: Record<IconName, JSX.Element> = {
  'alert-triangle': (
    <>
      <path d="M12 4.2 2.8 19.4h18.4L12 4.2Z" />
      <path d="M12 10v4" />
      <path d="M12 17.2h.01" />
    </>
  ),
  'alert-circle': (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v4.5" />
      <path d="M12 16h.01" />
    </>
  ),
  'arrow-left': (
    <>
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5 10-11" />,
  'check-circle': (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12.3 2.4 2.4 4.6-5.4" />
    </>
  ),
  'chevron-down': <path d="m6 9.5 6 6 6-6" />,
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
      <path d="M15.5 8.5V6a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2.5" />
    </>
  ),
  'chevron-right': <path d="m9.5 6 6 6-6 6" />,
  'external-link': (
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M18 13.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4.5" />
    </>
  ),
  folder: <path d="M3 7a2 2 0 0 1 2-2h3.6l1.8 2H19a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />,
  maximize: (
    <>
      <path d="M8 3.5H5.5a2 2 0 0 0-2 2V8" />
      <path d="M16 3.5h2.5a2 2 0 0 1 2 2V8" />
      <path d="M20.5 16v2.5a2 2 0 0 1-2 2H16" />
      <path d="M3.5 16v2.5a2 2 0 0 0 2 2H8" />
    </>
  ),
  circle: <circle cx="12" cy="12" r="8.5" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  'file-text': (
    <>
      <path d="M13.5 3H7a1.5 1.5 0 0 0-1.5 1.5v15A1.5 1.5 0 0 0 7 21h10a1.5 1.5 0 0 0 1.5-1.5V8.5L13.5 3Z" />
      <path d="M13.5 3v5.5H19" />
      <path d="M9 13h6M9 16.5h6" />
    </>
  ),
  file: (
    <>
      <path d="M13.5 3H7a1.5 1.5 0 0 0-1.5 1.5v15A1.5 1.5 0 0 0 7 21h10a1.5 1.5 0 0 0 1.5-1.5V8.5L13.5 3Z" />
      <path d="M13.5 3v5.5H19" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 5v4.2h-4.2" />
      <path d="M4 19v-4.2h4.2" />
      <path d="M19.4 9.2A8 8 0 0 0 5.9 6.1L4 8.4M4.6 14.8a8 8 0 0 0 13.5 3.1l1.9-2.3" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.6-4.6" />
    </>
  ),
  'x-circle': (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m9 9 6 6M15 9l-6 6" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
    </>
  ),
  moon: <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z" />,
  zap: <path d="M13 2.5 4.5 13.5H11l-.9 8L18.6 10.5H12l1-8Z" />,
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 16, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
