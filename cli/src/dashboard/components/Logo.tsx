// Longrein mark: a stylised "L" whose cross-stroke extends into a long,
// slack rein — the "long rein" the product is named for. Geometry only, so it
// inherits the current text color and stays crisp at any size.
export function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 5.5 V22.5 H14.5" />
      <path d="M14.5 22.5 C19 22.5 20 19 23.5 19 C25.6 19 27 20.4 27.6 22.6" />
    </svg>
  );
}
