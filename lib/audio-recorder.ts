/**
 * Audio recording utilities for TalkFlo
 */

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private audioStream: MediaStream | null = null
  private audioChunks: Blob[] = []
  private onDataAvailable?: (event: BlobEvent) => void
  private onStop?: (audioBlob: Blob) => void
  private onError?: (error: Error) => void
  private isPaused: boolean = false
  private isCanceled: boolean = false
  private startTime: number = 0
  private pausedDuration: number = 0
  private pauseStartTime: number = 0

  /**
   * Request microphone permission and start recording
   */
  async startRecording(): Promise<void> {
    try {
      // Request microphone access
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      })

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType: this.getSupportedMimeType()
      })

      // Reset chunks
      this.audioChunks = []

      // Set up event handlers
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
          this.onDataAvailable?.(event)
        }
      }

      this.mediaRecorder.onstop = () => {
        // Only trigger onStop callback if recording wasn't canceled
        if (!this.isCanceled) {
          const audioBlob = new Blob(this.audioChunks, { 
            type: this.getSupportedMimeType() 
          })
          this.onStop?.(audioBlob)
        }
        this.cleanup()
      }

      this.mediaRecorder.onerror = (event) => {
        const error = new Error('MediaRecorder error: ' + (event instanceof ErrorEvent ? event.error : 'Unknown error'))
        this.onError?.(error)
        this.cleanup()
      }

      // Reset canceled flag and timing
      this.isCanceled = false
      this.startTime = Date.now()
      this.pausedDuration = 0
      this.pauseStartTime = 0
      this.mediaRecorder.start(1000) // Collect data every second
      
    } catch (error) {
      this.cleanup()
      throw new Error('Failed to start recording: ' + (error as Error).message)
    }
  }

  /**
   * Stop recording and get audio blob
   */
  stopRecording(): void {
    if (this.mediaRecorder && (this.mediaRecorder.state === 'recording' || this.mediaRecorder.state === 'paused')) {
      this.mediaRecorder.stop()
    }
  }

  /**
   * Pause recording
   */
  pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause()
      this.isPaused = true
      this.pauseStartTime = Date.now()
    }
  }

  /**
   * Resume recording
   */
  resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume()
      this.isPaused = false
      // Add paused time to total paused duration
      if (this.pauseStartTime > 0) {
        this.pausedDuration += Date.now() - this.pauseStartTime
        this.pauseStartTime = 0
      }
    }
  }

  /**
   * Cancel recording and discard audio
   */
  cancelRecording(): void {
    if (this.mediaRecorder && (this.mediaRecorder.state === 'recording' || this.mediaRecorder.state === 'paused')) {
      // Set canceled flag to prevent onStop callback
      this.isCanceled = true
      // Clear chunks to discard audio
      this.audioChunks = []
      this.mediaRecorder.stop()
    } else {
      // If not recording, just cleanup
      this.cleanup()
    }
  }

  /**
   * Check if recording is active
   */
  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }

  /**
   * Check if recording is paused
   */
  isPausedRecording(): boolean {
    return this.mediaRecorder?.state === 'paused' || this.isPaused
  }

  /**
   * Get the current audio stream for visualization
   */
  getAudioStream(): MediaStream | null {
    return this.audioStream
  }

  /**
   * Get the active recording duration in seconds (excluding paused time)
   */
  getActiveRecordingDuration(): number {
    if (!this.startTime) return 0
    
    const now = Date.now()
    const totalElapsed = now - this.startTime
    const currentPausedTime = this.isPaused && this.pauseStartTime > 0 ? now - this.pauseStartTime : 0
    const activeTime = totalElapsed - this.pausedDuration - currentPausedTime
    
    return Math.floor(activeTime / 1000)
  }

  /**
   * Set callback for when audio data is available
   */
  setOnDataAvailable(callback: (event: BlobEvent) => void): void {
    this.onDataAvailable = callback
  }

  /**
   * Set callback for when recording stops
   */
  setOnStop(callback: (audioBlob: Blob) => void): void {
    this.onStop = callback
  }

  /**
   * Set callback for errors
   */
  setOnError(callback: (error: Error) => void): void {
    this.onError = callback
  }

  /**
   * Clean up resources
   */
  private cleanup(): void {
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop())
      this.audioStream = null
    }
    this.mediaRecorder = null
    this.isPaused = false
    this.isCanceled = false
    this.startTime = 0
    this.pausedDuration = 0
    this.pauseStartTime = 0
  }

  /**
   * Get supported MIME type for recording
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/wav'
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    return 'audio/webm' // fallback
  }

  /**
   * Check if audio recording is supported
   */
  static isSupported(): boolean {
    return !!(navigator.mediaDevices && 
             typeof navigator.mediaDevices.getUserMedia === 'function' &&
             window.MediaRecorder)
  }

  /**
   * Request microphone permission
   */
  static async requestPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch (error) {
      console.error('Microphone permission denied:', error)
      return false
    }
  }
}