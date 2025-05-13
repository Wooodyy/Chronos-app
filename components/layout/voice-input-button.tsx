"use client"

import { Mic } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { VoiceInputOverlay } from "./voice-input-overlay"

export function VoiceInputButton() {
  const [isVoiceOverlayOpen, setIsVoiceOverlayOpen] = useState(false)

  const handleVoiceInput = () => {
    setIsVoiceOverlayOpen(true)
  }

  const handleVoiceOverlayClose = () => {
    setIsVoiceOverlayOpen(false)
  }

  const handleTextRecognized = (text: string) => {
    console.log("Распознанный текст:", text)
    // Здесь можно добавить логику обработки распознанного текста
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleVoiceInput}
              className="fixed bottom-20 left-6 z-50 md:hidden"
            >
              <Mic className="h-5 w-5" />
              <div className="absolute inset-0 rounded-full shadow-[0_0_15px_3px_rgba(139,92,246,0.5),inset_0_0_5px_rgba(139,92,246,0.5)]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Голосовой ввод</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Voice Input Overlay */}
      <VoiceInputOverlay
        isOpen={isVoiceOverlayOpen}
        onClose={handleVoiceOverlayClose}
        onTextRecognized={handleTextRecognized}
      />
    </>
  )
}
