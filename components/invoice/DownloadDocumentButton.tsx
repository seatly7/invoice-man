'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toPng, toJpeg } from 'html-to-image'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileImage, Loader2, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

export interface DownloadDocumentButtonProps {
  targetId: string
  filename: string
  label?: string
  className?: string
}

export function DownloadDocumentButton({
  targetId,
  filename,
  label = 'Unduh Gambar',
  className = '',
}: DownloadDocumentButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg' | null>(null)
  const searchParams = useSearchParams()

  async function handleDownload(format: 'png' | 'jpg') {
    if (isExporting) return

    const node = document.getElementById(targetId)
    if (!node) {
      toast.error('Lembar dokumen tidak ditemukan untuk diunduh.')
      return
    }

    setIsExporting(true)
    setExportFormat(format)
    const toastId = toast.loading(`Sedang memproses unduhan ${format.toUpperCase()} resolusi tinggi...`)

    try {
      // Tunggu font dan render frame stabil
      await new Promise((r) => setTimeout(r, 150))

      const options = {
        quality: 0.95,
        pixelRatio: 2, // 2x Retina Resolution untuk hasil tajam bebas blur
        backgroundColor: '#ffffff',
        style: {
          borderRadius: '0px',
          boxShadow: 'none',
          border: 'none',
          margin: '0px',
        },
        cacheBust: true,
      }

      let dataUrl: string
      if (format === 'jpg') {
        dataUrl = await toJpeg(node, options)
      } else {
        dataUrl = await toPng(node, options)
      }

      // Trigger download di browser
      const link = document.createElement('a')
      link.download = `${filename}.${format}`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success(`Dokumen berhasil diunduh (${format.toUpperCase()})!`, { id: toastId })
    } catch (err: any) {
      console.error('Download error:', err)
      toast.error('Gagal mengunduh gambar dokumen', {
        id: toastId,
        description: err?.message || 'Pastikan browser mendukung rendering canvas.',
      })
    } finally {
      setIsExporting(false)
      setExportFormat(null)
    }
  }

  // Auto-download jika URL memiliki query parameter e.g. ?download=png
  useEffect(() => {
    const autoFormat = searchParams.get('download')
    if (autoFormat === 'png' || autoFormat === 'jpg') {
      const timer = setTimeout(() => {
        handleDownload(autoFormat)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isExporting}
        className={`inline-flex items-center justify-center gap-1.5 h-10 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-medium transition-colors shadow-2xs cursor-pointer disabled:opacity-60 ${className}`}
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
            <span>Memproses {exportFormat?.toUpperCase()}...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <span>{label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-0.5" />
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={() => handleDownload('png')}
          disabled={isExporting}
          className="cursor-pointer py-2.5"
        >
          <FileImage className="w-4 h-4 mr-2.5 text-blue-600 dark:text-blue-400" />
          <div className="flex flex-col">
            <span className="font-medium text-xs sm:text-sm">Unduh Gambar PNG</span>
            <span className="text-[11px] text-zinc-400">Kualitas tajam (Recommended)</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleDownload('jpg')}
          disabled={isExporting}
          className="cursor-pointer py-2.5"
        >
          <FileImage className="w-4 h-4 mr-2.5 text-amber-600 dark:text-amber-400" />
          <div className="flex flex-col">
            <span className="font-medium text-xs sm:text-sm">Unduh Gambar JPG</span>
            <span className="text-[11px] text-zinc-400">Ukuran file lebih ringan</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
