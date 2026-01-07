import { cn } from "@/lib/utils"
import Image from "next/image";

export function AscendWealthLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/FinArray Logo (2).png"
        alt="Logo"
        width={60}
        height={80}
        style={{ objectFit: "contain" }}
      />
    </div>
  )
}
