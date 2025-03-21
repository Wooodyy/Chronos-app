"use client"

import { Mic } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function VoiceInputButton() {
  const [isRecording, setIsRecording] = useState(false)

  const handleVoiceInput = () => {
    setIsRecording(!isRecording)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleVoiceInput}
            className={cn("fixed bottom-20 left-6 z-50 md:hidden", isRecording && "text-primary-foreground")}
          >
            <Mic className="h-5 w-5" />
            {isRecording && (
              <motion.div
                className="absolute -inset-2 rounded-full border-2 border-primary/30"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Голосовой ввод</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

