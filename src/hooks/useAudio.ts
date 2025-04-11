import { useState, useEffect, useCallback } from 'react';

export const useAudio = () => {
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('gameVolume');
    return savedVolume ? parseFloat(savedVolume) : 0.5;
  });
  const [bgm, setBgm] = useState<HTMLAudioElement | null>(null);
  const [rareSound, setRareSound] = useState<HTMLAudioElement | null>(null);
  const [legendarySound, setLegendarySound] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const backgroundMusic = new Audio('/sounds/background.mp3');
    backgroundMusic.loop = true;
    setBgm(backgroundMusic);

    const rare = new Audio('/sounds/rare.mp3');
    setRareSound(rare);

    const legendary = new Audio('/sounds/legendary.mp3');
    setLegendarySound(legendary);

    return () => {
      backgroundMusic.pause();
      rare.pause();
      legendary.pause();
    };
  }, []);

  useEffect(() => {
    if (bgm) {
      bgm.volume = volume;
    }
    if (rareSound) {
      rareSound.volume = volume;
    }
    if (legendarySound) {
      legendarySound.volume = volume;
    }
    localStorage.setItem('gameVolume', volume.toString());
  }, [volume, bgm, rareSound, legendarySound]);

  const playRareSound = useCallback(() => {
    if (rareSound) {
      rareSound.currentTime = 0;
      rareSound.play();
    }
  }, [rareSound]);

  const playLegendarySound = useCallback(() => {
    if (legendarySound) {
      legendarySound.currentTime = 0;
      legendarySound.play();
    }
  }, [legendarySound]);

  const toggleBgm = useCallback(() => {
    if (bgm) {
      if (bgm.paused) {
        bgm.play();
      } else {
        bgm.pause();
      }
    }
  }, [bgm]);

  return {
    volume,
    setVolume,
    playRareSound,
    playLegendarySound,
    toggleBgm,
    isBgmPlaying: bgm ? !bgm.paused : false
  };
};
