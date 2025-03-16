"use client"

import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import type { Point, Area } from "react-easy-crop"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

interface ImageCropperProps {
  image: string
  onCropComplete: (croppedImage: string) => void
  onCancel: () => void
  open: boolean
}

export function ImageCropper({ image, onCropComplete, onCancel, open }: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropChange = (crop: Point) => {
    setCrop(crop)
  }

  const onZoomChange = (zoom: number) => {
    setZoom(zoom)
  }

  const onRotationChange = (rotation: number) => {
    setRotation(rotation)
  }

  const onCropCompleteHandler = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener("load", () => resolve(image))
      image.addEventListener("error", (error) => reject(error))
      image.crossOrigin = "anonymous" // Важно для работы с canvas
      image.src = url
    })

  const getCroppedImg = async (imageSrc: string, pixelCrop: Area, rotation = 0): Promise<string> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("No 2d context")
    }

    // Устанавливаем размеры canvas для квадратного изображения
    const size = Math.min(pixelCrop.width, pixelCrop.height)
    canvas.width = size
    canvas.height = size

    // Рисуем с учетом поворота
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-canvas.width / 2, -canvas.height / 2)

    // Рисуем только обрезанную часть
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, size, size)

    ctx.restore()

    // Преобразуем canvas в base64
    return canvas.toDataURL("image/jpeg", 0.9)
  }

  const handleSave = async () => {
    if (croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation)
        onCropComplete(croppedImage)
      } catch (e) {
        console.error("Error cropping image:", e)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Обрезать изображение</DialogTitle>
        </DialogHeader>

        <div className="relative w-full h-[300px] my-4">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={onZoomChange}
          />
        </div>

        <div className="space-y-4 px-1">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="zoom">Масштаб</Label>
              <span className="text-sm text-muted-foreground">{zoom.toFixed(1)}x</span>
            </div>
            <Slider id="zoom" min={1} max={3} step={0.1} value={[zoom]} onValueChange={(value) => setZoom(value[0])} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="rotation">Поворот</Label>
              <span className="text-sm text-muted-foreground">{rotation}°</span>
            </div>
            <Slider
              id="rotation"
              min={0}
              max={360}
              step={1}
              value={[rotation]}
              onValueChange={(value) => setRotation(value[0])}
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onCancel}>
            Отмена
          </Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

