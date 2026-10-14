import { useEffect, useRef, useState } from 'react'
import authCancel from '../../assets/icons/auth-cancel.svg'
import GradientButton from './GradientButton'
import { describeError, uploads } from '../../services/earthApi'
import { jakarta } from '../../utils/styles'

interface SelfieCaptureModalProps {
  onUploaded: (url: string) => void
  onClose: () => void
}

/**
 * The selfie the API needs before a store can go live. The design jumps from "Next, take selfie"
 * straight to the verified dialog, so this step borrows that dialog's frame: the camera when the
 * browser grants it, otherwise a photo from the device.
 */
export default function SelfieCaptureModal({ onUploaded, onClose }: SelfieCaptureModalProps) {
  const video = useRef<HTMLVideoElement>(null)
  const stream = useRef<MediaStream | null>(null)
  const [camera, setCamera] = useState<'starting' | 'live' | 'unavailable'>('starting')
  const [shot, setShot] = useState<Blob | null>(null)
  const [preview, setPreview] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let live = true
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'user', width: 720, height: 720 } })
      .then((s) => {
        if (!live) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        stream.current = s
        if (video.current) video.current.srcObject = s
        setCamera('live')
      })
      .catch(() => live && setCamera('unavailable'))
    return () => {
      live = false
      stream.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function capture() {
    const v = video.current
    if (!v) return
    const size = Math.min(v.videoWidth, v.videoHeight) || 720
    const c = document.createElement('canvas')
    c.width = size
    c.height = size
    const ctx = c.getContext('2d')!
    // Mirror so the saved photo matches what the person saw.
    ctx.translate(size, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(v, (v.videoWidth - size) / 2, (v.videoHeight - size) / 2, size, size, 0, 0, size, size)
    c.toBlob(
      (b) => {
        if (!b) return
        setShot(b)
        setPreview(URL.createObjectURL(b))
      },
      'image/jpeg',
      0.9,
    )
  }

  function pick(file: File | undefined) {
    if (!file) return
    if (!/^image\/(jpeg|png)$/.test(file.type)) return setError('Use a JPG or PNG photo.')
    if (file.size > 5 * 1024 * 1024) return setError('The photo must be under 5 MB.')
    setError('')
    setShot(file)
    setPreview(URL.createObjectURL(file))
  }

  async function upload() {
    if (!shot) return
    setBusy(true)
    setError('')
    try {
      const file = shot instanceof File ? shot : new File([shot], 'selfie.jpg', { type: 'image/jpeg' })
      const { url } = await uploads.image(file, 'SELFIE')
      onUploaded(url)
    } catch (err) {
      setError(describeError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="bg-white relative flex flex-col gap-[10px] items-start overflow-clip p-[24px] rounded-[24px]"
        style={{ width: '480px' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="selfie-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-[24px] top-[24px] flex items-center justify-center size-[24px]"
          aria-label="Close"
        >
          <img src={authCancel} alt="" className="size-[24px]" />
        </button>

        <div className="flex flex-col gap-[24px] items-center w-full">
          <div className="flex flex-col gap-[8px] items-center text-center w-full pt-[24px]">
            <p id="selfie-title" className="text-[#101604] text-[24px] leading-[32px]" style={jakarta(600)}>
              Take a selfie
            </p>
            <p className="text-[#807e7e] text-[16px] leading-[28px]" style={jakarta(400)}>
              Look straight at the camera in good light. We check it against your ID.
            </p>
          </div>

          {/* 240px round frame: the live camera, or the chosen photo */}
          <div className="relative size-[240px] rounded-full overflow-hidden bg-[#f7f7f7]">
            {preview ? (
              <img src={preview} alt="Your selfie" className="size-full object-cover" />
            ) : (
              <video
                ref={video}
                autoPlay
                playsInline
                muted
                className="size-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
            )}
            {camera === 'unavailable' && !preview && (
              <p
                className="absolute inset-0 flex items-center justify-center px-[24px] text-center text-[#807e7e] text-[13px] leading-[20px]"
                style={jakarta(400)}
              >
                No camera here. Choose a photo instead.
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="text-[#b13b3b] text-[13px] leading-[20px] text-center" style={jakarta(400)}>
              {error}
            </p>
          )}

          <div className="flex flex-col gap-[16px] w-full">
            {preview ? (
              <>
                <GradientButton onClick={upload} className="w-full">
                  {busy ? 'Uploading…' : 'Use this photo'}
                </GradientButton>
                <button
                  type="button"
                  onClick={() => {
                    setShot(null)
                    setPreview('')
                  }}
                  disabled={busy}
                  className="bg-[#f7f7f7] flex h-[48px] items-center justify-center rounded-[30px] w-full text-[#101604] text-[14px]"
                  style={jakarta(500)}
                >
                  Retake
                </button>
              </>
            ) : (
              <>
                {camera === 'live' && (
                  <GradientButton onClick={capture} className="w-full">
                    Take photo
                  </GradientButton>
                )}
                <label
                  className="bg-[#f7f7f7] flex h-[48px] items-center justify-center rounded-[30px] w-full text-[#101604] text-[14px] cursor-pointer"
                  style={jakarta(500)}
                >
                  {camera === 'live' ? 'Choose a photo instead' : 'Choose a photo'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    capture="user"
                    className="sr-only"
                    onChange={(e) => pick(e.target.files?.[0])}
                  />
                </label>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
