import type { StreamType } from '../types'

/** Raadt het streamtype aan de hand van de URL. */
export function detectStreamType(url: string): StreamType {
  const u = url.toLowerCase()
  if (u.includes('.m3u8')) return 'hls'
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube'
  if (u.includes('mjpg') || u.includes('mjpeg')) return 'mjpeg'
  if (/\.(jpe?g|png|webp)(\?|$)/.test(u)) return 'snapshot'
  return 'embed'
}

/** Zet een YouTube-link om naar een embed-URL; null als er geen video-id in staat. */
export function youtubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    let id: string | null = null
    if (u.hostname === 'youtu.be') id = u.pathname.slice(1)
    else if (u.pathname.startsWith('/embed/')) id = u.pathname.split('/')[2]
    else if (u.pathname.startsWith('/live/')) id = u.pathname.split('/')[2]
    else id = u.searchParams.get('v')
    if (!id) return null
    return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1`
  } catch {
    return null
  }
}
