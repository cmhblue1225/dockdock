export default function KakaoLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 3C6.48 3 2 6.58 2 11c0 2.76 1.84 5.18 4.58 6.56-.18.68-.68 2.54-.78 2.96-.12.52.19.51.4.37.17-.11 2.54-1.73 3.48-2.37.44.06.89.1 1.34.1 5.52 0 10-3.58 10-8S17.52 3 12 3zm-3.5 10.5h-2v-5h2v5zm3.5 0h-2v-5h2v5zm3.5 0h-2v-5h2v5z" />
    </svg>
  );
}
