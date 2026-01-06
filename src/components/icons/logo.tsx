import { cn } from "@/lib/utils"
import Image from "next/image";

export function AscendWealthLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/finarray-logo.png"
        alt="Logo"
        width={36}
        height={36}
        style={{ objectFit: "contain" }}
      />
    </div>
  )
}
