import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Custom hook for managing audio playback
 */
export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  /**
   * Play audio from a URL
   */
  const playAudio = useCallback(
    async (audioUrl: string) => {
      // Don't start a new audio if already playing or URL is empty
      if (!audioUrl || isPlaying) return;

      // Stop previous audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Update state to indicate playing
      setIsPlaying(true);
      setCurrentAudioUrl(audioUrl);

      // Create and play the audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      try {
        // Play the audio and wait for it to finish
        await audio.play();
        await new Promise((resolve) => {
          audio.onended = resolve;
        });
      } catch (err) {
        console.error("Failed to play audio:", err);
      } finally {
        // Clean up state when audio finishes
        setIsPlaying(false);
        setCurrentAudioUrl(null);
        audioRef.current = null;
      }
    },
    [isPlaying],
  );

  /**
   * Stop currently playing audio
   */
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      setCurrentAudioUrl(null);
    }
  }, []);

  return {
    isPlaying,
    currentAudioUrl,
    playAudio,
    stopAudio,
    isPlayingUrl: (url: string) => isPlaying && currentAudioUrl === url,
  };
}
