import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

export function AscendWealthLogo({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="Dashboard">
      <div className={cn("flex items-center", className)}>
        <Image
          src="/finarray-logo.png"
          alt="FinArray"
          width={140}
          height={36}
          priority
          style={{ height: 36, width: 'auto', objectFit: "contain" }}
        />
      </div>
    </Link>
  )
}
