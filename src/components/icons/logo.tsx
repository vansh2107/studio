import { cn } from "@/lib/utils"

export function AscendWealthLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="28" height="28" rx="6" fill="#F78E1E" />
        <path
          d="M8.5 13.9999L12.5 18.9999L20.5 9.99994"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-headline font-bold text-lg text-gray-800">
        FinArray
      </span>
    </div>
  )
}
