import { useMemo, useRef, useState, useEffect } from 'react'
import { Howler } from 'howler'
import { useAudioPlayer } from 'react-use-audio-player'
import { useLatestMessage } from '@/hooks/messages/useLatestMessage'
import { useSuperinterfaceContext } from '@/hooks/core/useSuperinterfaceContext'
import { AudioEngine } from '@/types'
import { input as getInput } from './lib/input'
import { isHtmlAudioSupported } from './lib/isHtmlAudioSupported'

type Args = {
  onEnd: () => void
}

export const useMessageAudio = ({
  onEnd,
}: Args) => {
  const [playedMessageIds, setPlayedMessageIds] = useState<string[]>([])
  const audioPlayer = useAudioPlayer()
  const superinterfaceContext = useSuperinterfaceContext()

  const latestMessageProps = useLatestMessage()

  useEffect(() => {
    if (audioPlayer.playing) return
    if (!latestMessageProps.latestMessage) return
    if (latestMessageProps.latestMessage.role !== 'assistant') return
    if (playedMessageIds.includes(latestMessageProps.latestMessage.id)) return

    const input = getInput({
      message: latestMessageProps.latestMessage,
    })

    if (!input) return

    setPlayedMessageIds((prev) => [...prev, latestMessageProps.latestMessage.id])

    audioPlayer.load(`${superinterfaceContext.baseUrl}/tts?input=${input}`, {
      format: 'mp3',
      autoplay: true,
      html5: isHtmlAudioSupported,
      onend: onEnd,
    })
  }, [
    superinterfaceContext,
    latestMessageProps,
    audioPlayer,
    playedMessageIds,
    onEnd,
  ])


  const isInited = useRef(false)
  const [audioEngine, setAudioEngine] = useState<AudioEngine | null>(null)

  useEffect(() => {
    if (!audioPlayer.playing) return
    if (isInited.current) return
    isInited.current = true

    if (isHtmlAudioSupported) {
      const audioContext = new AudioContext()
      setAudioEngine({
        // @ts-ignore-next-line
        source: audioContext.createMediaElementSource(Howler._howls[0]._sounds[0]._node),
        audioContext,
      })
    } else {
      setAudioEngine({
        source: Howler.masterGain,
        audioContext: Howler.ctx,
      })
    }
  }, [audioPlayer, isInited])

  const visualizationAnalyser = useMemo(() => {
    if (!audioEngine) return null

    const result = audioEngine.audioContext.createAnalyser()

    audioEngine.source.connect(audioEngine.audioContext.destination)
    audioEngine.source.connect(result)
    return result
  }, [audioEngine])

  return {
    ...audioPlayer,
    visualizationAnalyser,
  }
}
