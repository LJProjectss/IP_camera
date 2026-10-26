import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import type { Camera } from '../types'
import { youtubeEmbedUrl } from '../lib/streams'

type Props = { camera: Camera }

/** Toont het beeld van een camera, ongeacht het streamformaat. Het beeld komt rechtstreeks van de aanbieder. */
export function CameraPlayer({ camera }: Props) {
  // key zorgt dat de speler opnieuw start als je een andere camera kiest.
  return (
    <div className="player">
      <PlayerBody key={camera.id} camera={camera} />
    </div>
  )
}

function PlayerBody({ camera }: Props) {
  switch (camera.streamType) {
    case 'hls':
      return <HlsPlayer url={camera.streamUrl} />
    case 'youtube': {
      const src = youtubeEmbedUrl(camera.streamUrl)
      return src ? <EmbedPlayer url={src} title={camera.name} /> : <Failed />
    }
    case 'embed':
      return <EmbedPlayer url={camera.streamUrl} title={camera.name} />
    case 'mjpeg':
      return <ImagePlayer url={camera.streamUrl} alt={camera.name} />
    case 'snapshot':
      return <SnapshotPlayer url={camera.streamUrl} alt={camera.name} seconds={camera.refreshSeconds ?? 30} />
  }
}

function Failed({ text = 'Het beeld kon niet geladen worden.' }: { text?: string }) {
  return <div className="player-message">{text}</div>
}

function HlsPlayer({ url }: { url: string }) {
  const video = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)
  // Safari speelt HLS zelf af; andere browsers via hls.js.
  const [native] = useState(() => document.createElement('video').canPlayType('application/vnd.apple.mpegurl') !== '')
  const supported = native || Hls.isSupported()

  useEffect(() => {
    const el = video.current
    if (!el || !supported) return
    if (native) {
      el.src = url
      return
    }
    const hls = new Hls({ liveDurationInfinity: true })
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) setFailed(true)
    })
    hls.loadSource(url)
    hls.attachMedia(el)
    return () => hls.destroy()
  }, [url, native, supported])

  if (failed || !supported) return <Failed />
  return <video ref={video} autoPlay muted playsInline controls />
}

function EmbedPlayer({ url, title }: { url: string; title: string }) {
  return (
    <iframe
      src={url}
      title={title}
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
    />
  )
}

function ImagePlayer({ url, alt }: { url: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <Failed />
  return <img src={url} alt={alt} onError={() => setFailed(true)} />
}

function SnapshotPlayer({ url, alt, seconds }: { url: string; alt: string; seconds: number }) {
  const [tick, setTick] = useState(() => Date.now())
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setTick(Date.now()), seconds * 1000)
    return () => clearInterval(timer)
  }, [seconds])

  if (failed) return <Failed />
  const src = `${url}${url.includes('?') ? '&' : '?'}t=${tick}`
  return (
    <>
      <img src={src} alt={alt} onError={() => setFailed(true)} />
      <span className="player-stamp">
        Bijgewerkt {new Date(tick).toLocaleTimeString('nl-NL')} · elke {seconds} s
      </span>
    </>
  )
}
