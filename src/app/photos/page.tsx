'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import { ImageIcon, Grid3X3 } from 'lucide-react'
import { fetcher } from '@/lib/fetcher'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

interface Album {
  id: string
  title: string
  description: string | null
  cover: string | null
  _count: { photos: number }
}

interface Photo {
  id: string
  url: string
  caption: string | null
  albumId: string
}

function PhotosContent() {
  const searchParams = useSearchParams()
  const albumParam = searchParams.get('album')

  const { data: albums } = useSWR<Album[]>('/api/albums', fetcher, { refreshInterval: 30000 })
  const { data: photos } = useSWR<Photo[]>('/api/photos', fetcher, { refreshInterval: 30000 })
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(albumParam)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  useEffect(() => {
    setSelectedAlbum(albumParam)
  }, [albumParam])

  const filteredPhotos = selectedAlbum
    ? (photos || []).filter((p) => p.albumId === selectedAlbum)
    : (photos || [])

  if (!albums || !photos) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl animate-pulse bg-white/10" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">照片墙</h1>
        <p className="text-[#86868b] mt-2">{photos.length} 张照片</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedAlbum(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedAlbum === null
              ? 'bg-[#0071e3] text-white shadow-md shadow-blue-500/15'
              : 'glass text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1a6] dark:hover:text-[#f5f5f7]'
          }`}
        >
          <span className="flex items-center gap-2">
            <Grid3X3 size={14} />
            全部
          </span>
        </button>
        {albums.map((album) => (
          <button
            key={album.id}
            onClick={() => setSelectedAlbum(album.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedAlbum === album.id
                ? 'bg-[#0071e3] text-white shadow-md shadow-blue-500/15'
                : 'glass text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1a6] dark:hover:text-[#f5f5f7]'
            }`}
          >
            {album.title}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPhotos.map((photo, i) => (
          <div
            key={photo.id}
            className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer glass-card border-0"
            onClick={() => {
              setLightboxIndex(i)
              setLightboxOpen(true)
            }}
          >
            <img
              src={photo.url}
              alt={photo.caption || ''}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            {photo.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-sm font-medium translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                {photo.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredPhotos.length === 0 && (
        <div className="text-center py-20 text-[#86868b]">暂无照片</div>
      )}

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={filteredPhotos.map((p) => ({ src: p.url }))}
        index={lightboxIndex}
      />
    </div>
  )
}

export default function PhotosPage() {
  return (
    <Suspense fallback={<div className="max-w-5xl mx-auto py-20 text-center text-[#86868b]">加载中...</div>}>
      <PhotosContent />
    </Suspense>
  )
}
