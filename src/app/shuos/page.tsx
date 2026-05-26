'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { StickyNote, ZoomIn } from 'lucide-react'
import { fetcher } from '@/lib/fetcher'
import { formatDate } from '@/lib/utils'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

interface Shuo {
  id: string
  content: string
  images: string[]
  color: string
  createdAt: string
}

export default function ShuosPage() {
  const { data: rawShuos } = useSWR<any[]>('/api/shuos', fetcher, {
    refreshInterval: 30000,
  })
  const shuos: Shuo[] = (rawShuos || []).map((s) => ({
    ...s,
    images: s.images ? JSON.parse(s.images) : [],
  }))

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [lightboxImages, setLightboxImages] = useState<{ src: string }[]>([])

  function openLightbox(images: string[], index: number) {
    setLightboxImages(images.map((src) => ({ src })))
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  if (!shuos.length && !rawShuos) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card h-48 animate-pulse bg-white/10" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">说说</h1>
        <p className="text-[#86868b] mt-2">记录生活点滴</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {shuos.map((shuo) => (
          <div key={shuo.id} className="glass-card p-5 relative">
            <div className="absolute top-0 left-5 right-5 h-1 rounded-full" style={{ backgroundColor: shuo.color }} />
            <p className="text-sm text-[#424245] dark:text-[#a1a1a6] mt-3 leading-relaxed whitespace-pre-wrap line-clamp-4">
              {shuo.content}
            </p>
            {shuo.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {shuo.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => openLightbox(shuo.images, idx)}
                    className="relative aspect-square rounded-xl overflow-hidden group border border-black/5"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                      <ZoomIn size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            )}
            <span className="text-[11px] text-[#86868b] mt-4 block">{formatDate(shuo.createdAt)}</span>
          </div>
        ))}
      </div>

      <Lightbox open={lightboxOpen} close={() => setLightboxOpen(false)} slides={lightboxImages} index={lightboxIndex} />
    </div>
  )
}
