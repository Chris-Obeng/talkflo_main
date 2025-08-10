"use client";

import React, { useEffect, useRef, useCallback } from 'react';

interface AudioVisualizerProps {
  audioStream: MediaStream | null;
  isActive: boolean;
  className?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  audioStream,
  isActive,
  className = ""
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const initializeAudioContext = useCallback(() => {
    if (!audioStream || !canvasRef.current) return;

    try {
      // Create audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioContext = audioContextRef.current;

      // Create analyser node
      analyserRef.current = audioContext.createAnalyser();
      const analyser = analyserRef.current;
      
      // Configure analyser
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      
      // Create source from stream
      const source = audioContext.createMediaStreamSource(audioStream);
      source.connect(analyser);
      
      // Create data array for frequency data
      const bufferLength = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      console.log('🎵 Audio visualizer initialized');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }, [audioStream]);

  const draw = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    
    // Get frequency data
    analyser.getByteFrequencyData(dataArray);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate bar dimensions
    const barCount = 45; // Match the original bar count
    const barWidth = canvas.width / barCount;
    const maxBarHeight = canvas.height * 0.8;
    const minBarHeight = canvas.height * 0.1;
    
    // Draw bars
    for (let i = 0; i < barCount; i++) {
      // Sample frequency data (spread across the available data)
      const dataIndex = Math.floor((i / barCount) * dataArray.length);
      const amplitude = dataArray[dataIndex] / 255; // Normalize to 0-1
      
      // Calculate bar height with some smoothing
      const barHeight = minBarHeight + (amplitude * (maxBarHeight - minBarHeight));
      
      // Calculate position
      const x = i * barWidth + barWidth * 0.1; // Small gap between bars
      const y = canvas.height - barHeight;
      const width = barWidth * 0.8;
      
      // Set color (white with some transparency)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      
      // Draw rounded rectangle (fallback for browsers without roundRect)
      ctx.beginPath();
      const radius = Math.min(width / 2, 2);
      
      if (ctx.roundRect) {
        ctx.roundRect(x, y, width, barHeight, radius);
      } else {
        // Fallback: draw rectangle with rounded corners manually
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + barHeight - radius);
        ctx.quadraticCurveTo(x + width, y + barHeight, x + width - radius, y + barHeight);
        ctx.lineTo(x + radius, y + barHeight);
        ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
      }
      ctx.fill();
    }
    
    // Continue animation if active
    if (isActive) {
      animationRef.current = requestAnimationFrame(draw);
    }
  }, [isActive]);

  // Initialize audio context when stream becomes available
  useEffect(() => {
    if (audioStream && isActive) {
      initializeAudioContext();
    }
  }, [audioStream, isActive, initializeAudioContext]);

  // Start/stop animation based on active state
  useEffect(() => {
    if (isActive && analyserRef.current) {
      draw();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, draw]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Fallback bars when no audio data is available
  const renderFallbackBars = () => {
    if (!isActive) return null;
    
    return (
      <div className="flex justify-center items-end space-x-1 h-20">
        {Array.from({ length: 45 }).map((_, i) => (
          <div
            key={i}
            className="w-1 bg-white/80 rounded-full animate-pulse"
            style={{
              height: `${Math.random() * 60 + 15}px`,
              animationDelay: `${i * 0.05}s`,
              animationDuration: `${0.8 + Math.random() * 0.4}s`
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={360}
        height={80}
        className="w-full h-20"
        style={{ display: audioStream && isActive ? 'block' : 'none' }}
      />
      {(!audioStream || !isActive) && renderFallbackBars()}
    </div>
  );
};