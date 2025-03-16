import type React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

type StatusType = "success" | "warning" | "error" | "default"

interface StatusBadgeProps {
  status: StatusType
  children: React.ReactNode
  className?: string
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <Badge
      className={cn(
        className,
        status === "success" && "bg-success text-success-foreground",
        status === "warning" && "bg-warning text-warning-foreground",
        status === "error" && "bg-destructive text-destructive-foreground",
      )}
    >
      {children}
    </Badge>
  )
}

