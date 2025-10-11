export default function KakaoLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 3C6.48 3 2 6.58 2 11c0 2.89 1.97 5.43 4.93 6.88-.2.73-.76 2.77-.87 3.22-.13.54.2.53.42.39.17-.11 2.67-1.82 3.1-2.12.46.06.93.1 1.42.1 5.52 0 10-3.58 10-8S17.52 3 12 3z" />
    </svg>
  );
}
