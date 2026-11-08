import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Gauge, Repeat, SkipBack, SkipForward, Eye, EyeOff, Headphones } from 'lucide-react';
import { formatTime } from '../../utils/timeFormat';

const YouTubePlayer = forwardRef(function YouTubePlayer(
  {
    videoId,
    activeSegment,
    isLooping = false,
    playbackSpeed = 1,
    onChangeSpeed,
    onTimeUpdate,
    autoPauseAtSegmentEnd = true,
    onSegmentEnd,
    onNextSegment,
    onPrevSegment,
    language = 'de',
    hideVideo: propHideVideo,
    onToggleHideVideo: propOnToggleHideVideo
  },
  ref
) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [localHideVideo, setLocalHideVideo] = useState(() => {
    try {
      return localStorage.getItem('polyglot_hide_video') === 'true';
    } catch (e) {
      return false;
    }
  });

  const isHideVideo = propHideVideo !== undefined ? propHideVideo : localHideVideo;

  const handleToggleHideVideo = () => {
    if (propOnToggleHideVideo) {
      propOnToggleHideVideo(!isHideVideo);
    } else {
      setLocalHideVideo((prev) => {
        const next = !prev;
        try { localStorage.setItem('polyglot_hide_video', String(next)); } catch (e) {}
        return next;
      });
    }
  };

  // Interval ticker for tracking time
  const timeTickerRef = useRef(null);

  // Expose methods to parent components via ref
  useImperativeHandle(ref, () => ({
    seekTo: (sec) => playerRef.current?.seekTo?.(sec, true),
    play: () => playerRef.current?.playVideo?.(),
    pause: () => playerRef.current?.pauseVideo?.(),
    replaySegment: () => {
      if (activeSegment && playerRef.current) {
        playerRef.current.seekTo(activeSegment.start, true);
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    },
    setSpeed: (speed) => playerRef.current?.setPlaybackRate?.(speed),
    toggleHideVideo: handleToggleHideVideo,
    isHideVideo
  }));

  // Initialize YouTube Player
  useEffect(() => {
    if (!videoId) return;

    let destroyed = false;

    const initPlayer = () => {
      if (destroyed || !containerRef.current) return;

      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }

      const playerDivId = `yt-player-${videoId}`;
      containerRef.current.innerHTML = `<div id="${playerDivId}" class="w-full h-full"></div>`;

      playerRef.current = new window.YT.Player(playerDivId, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            if (destroyed) return;
            setIsReady(true);
            setDuration(event.target.getDuration() || 0);
            event.target.setPlaybackRate(playbackSpeed);
          },
          onStateChange: (event) => {
            if (destroyed) return;
            if (event.data === 1) {
              setIsPlaying(true);
            } else {
              setIsPlaying(false);
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      destroyed = true;
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }
      setIsReady(false);
    };
  }, [videoId]);

  // Update playback speed when prop changes
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setPlaybackRate === 'function') {
      playerRef.current.setPlaybackRate(playbackSpeed);
    }
  }, [playbackSpeed]);

  // Time ticker & Segment loop / auto-pause monitor
  useEffect(() => {
    if (timeTickerRef.current) clearInterval(timeTickerRef.current);

    timeTickerRef.current = setInterval(() => {
      if (!playerRef.current || typeof playerRef.current.getCurrentTime !== 'function') return;

      const curr = playerRef.current.getCurrentTime() || 0;
      setCurrentTime(curr);
      if (onTimeUpdate) onTimeUpdate(curr);

      if (activeSegment && isPlaying) {
        if (curr >= activeSegment.end) {
          if (isLooping) {
            playerRef.current.seekTo(activeSegment.start, true);
          } else if (autoPauseAtSegmentEnd) {
            playerRef.current.pauseVideo();
            setIsPlaying(false);
            if (onSegmentEnd) onSegmentEnd();
          }
        }
      }
    }, 100);

    return () => {
      if (timeTickerRef.current) clearInterval(timeTickerRef.current);
    };
  }, [activeSegment, isLooping, autoPauseAtSegmentEnd, isPlaying, onSegmentEnd, onTimeUpdate]);

  const handleTogglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      const currentSec = typeof playerRef.current.getCurrentTime === 'function' ? playerRef.current.getCurrentTime() : currentTime;
      if (activeSegment && (currentSec < activeSegment.start || currentSec >= activeSegment.end)) {
        playerRef.current.seekTo(activeSegment.start, true);
      }
      playerRef.current.playVideo();
    }
  };

  const handleReplaySegment = () => {
    if (activeSegment && playerRef.current) {
      playerRef.current.seekTo(activeSegment.start, true);
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const handleToggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden bg-surface-container border border-outline-variant/30 shadow-xl transition-all">
      {/* 16:9 Video Frame / Audio-Only Focus Card */}
      <div className="relative w-full overflow-hidden bg-black transition-all">
        {/* Real YouTube player container - ALWAYS kept in DOM for audio playback & API control */}
        <div className={isHideVideo ? 'absolute -top-[9999px] -left-[9999px] w-1 h-1 opacity-0 pointer-events-none' : 'relative w-full pb-[56.25%]'}>
          <div ref={containerRef} className="absolute inset-0 w-full h-full" />
        </div>

        {/* Audio-only Focus Card */}
        {isHideVideo && (
          <div className="relative w-full py-10 px-6 sm:py-12 bg-gradient-to-br from-[#0b101e] via-[#0f172a] to-[#090d16] border-b border-outline-variant/30 flex flex-col items-center justify-center text-center gap-3 overflow-hidden animate-fade-in">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-secondary/25 to-primary/20 flex items-center justify-center border border-secondary/30 shadow-lg ${isPlaying ? 'scale-105 shadow-secondary/25' : ''} transition-all`}>
                <Headphones className={`w-7 h-7 sm:w-8 sm:h-8 text-secondary ${isPlaying ? 'animate-pulse' : ''}`} />
              </div>
              {isPlaying && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
                </span>
              )}
            </div>

            <div className="space-y-1 max-w-md z-10">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary/15 text-secondary border border-secondary/20">
                🎧 Chế độ Nghe thuần âm thanh (Audio-Only)
              </span>
              <h3 className="text-sm sm:text-base font-headline font-bold text-on-surface">
                Đã ẩn video để tập trung nghe chép
              </h3>
              <p className="text-xs text-outline leading-relaxed max-w-sm mx-auto">
                Tránh nhìn phụ đề in sẵn trên video. Hãy chỉ dùng đôi tai để cảm nhận và ghi chép!
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleHideVideo}
              className="mt-1 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-bright text-on-surface border border-outline-variant/40 text-xs font-semibold transition-all cursor-pointer shadow-xs hover:scale-105 z-10"
              title="Bấm để hiển thị lại khung hình video"
            >
              <Eye className="w-3.5 h-3.5 text-secondary" />
              <span>Hiện lại video</span>
            </button>
          </div>
        )}
      </div>

      {/* Clean Control Bar */}
      <div className="p-3 sm:p-4 bg-surface-container-high/90 border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Left: Playback controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={handleTogglePlay}
            className="px-3.5 py-1.5 rounded-full bg-primary-container text-on-primary-container hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
            title="Phát / Dừng (Space)"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Tạm dừng' : 'Phát'}</span>
            <kbd className="hidden sm:inline px-1 py-0.2 rounded bg-black/20 text-[10px] font-mono">Space</kbd>
          </button>

          {/* Replay Segment Button */}
          {activeSegment && (
            <button
              type="button"
              onClick={handleReplaySegment}
              className="px-3 py-1.5 rounded-full bg-surface-container text-secondary hover:text-on-surface hover:bg-surface-bright active:scale-95 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-outline-variant/30"
              title="Nghe lại câu hiện tại"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Nghe lại</span>
            </button>
          )}

          {/* Speed Selector */}
          <button
            type="button"
            onClick={() => onChangeSpeed(playbackSpeed === 0.75 ? 1 : 0.75)}
            className={`px-2.5 py-1.5 rounded-full transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer border ${
              playbackSpeed === 0.75
                ? 'bg-secondary-container text-on-secondary-container border-secondary/50 shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface border-outline-variant/30'
            }`}
            title="Đổi tốc độ phát: 0.75x / 1.0x"
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>{playbackSpeed}x</span>
          </button>

          {/* Loop Segment Button */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                const evt = new KeyboardEvent('keydown', { key: 'l' });
                window.dispatchEvent(evt);
              }
            }}
            className={`px-2.5 py-1.5 rounded-full transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer border ${
              isLooping
                ? 'bg-primary-container text-on-primary-container border-primary/50 shadow-xs'
                : 'bg-surface-container text-outline hover:text-on-surface border-outline-variant/30'
            }`}
            title="Lặp câu liên tục (Phím L)"
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>{isLooping ? 'Đang lặp' : 'Lặp câu'}</span>
          </button>

          {/* Hide / Show Video Toggle (Audio-only dictation) */}
          <button
            type="button"
            onClick={handleToggleHideVideo}
            className={`px-2.5 py-1.5 rounded-full transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer border ${
              isHideVideo
                ? 'bg-secondary-container text-on-secondary-container border-secondary/50 shadow-xs'
                : 'bg-surface-container text-outline hover:text-on-surface border-outline-variant/30'
            }`}
            title={isHideVideo ? 'Hiện lại video' : 'Ẩn video để chỉ tập trung nghe chép (Audio-only)'}
          >
            {isHideVideo ? <Eye className="w-3.5 h-3.5 text-secondary" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{isHideVideo ? 'Hiện video' : 'Ẩn video'}</span>
          </button>
        </div>

        {/* Right: Navigation & Mute & Segment Time */}
        <div className="flex items-center gap-2">
          {activeSegment && (
            <span className="text-[11px] font-mono text-outline px-2 py-0.5 rounded-md bg-surface-container border border-outline-variant/20 hidden sm:inline">
              {formatTime(activeSegment.start)} - {formatTime(activeSegment.end)}
            </span>
          )}

          {onPrevSegment && (
            <button
              type="button"
              onClick={onPrevSegment}
              className="w-8 h-8 rounded-full bg-surface-container text-outline hover:text-on-surface hover:bg-surface-bright flex items-center justify-center transition-all cursor-pointer border border-outline-variant/30"
              title="Câu trước (J)"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>
          )}

          {onNextSegment && (
            <button
              type="button"
              onClick={onNextSegment}
              className="w-8 h-8 rounded-full bg-surface-container text-outline hover:text-on-surface hover:bg-surface-bright flex items-center justify-center transition-all cursor-pointer border border-outline-variant/30"
              title="Câu tiếp theo (K)"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleMute}
            className="w-8 h-8 rounded-full bg-surface-container text-outline hover:text-on-surface hover:bg-surface-bright flex items-center justify-center transition-all cursor-pointer border border-outline-variant/30"
            title={isMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-error" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>
    </div>
  );
});

export default YouTubePlayer;
