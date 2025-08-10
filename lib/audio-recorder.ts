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
        const audioBlob = new Blob(this.audioChunks, { 
          type: this.getSupportedMimeType() 
        })
        this.onStop?.(audioBlob)
        this.cleanup()
      }

      this.mediaRecorder.onerror = (event) => {
        const error = new Error('MediaRecorder error: ' + (event instanceof ErrorEvent ? event.error : 'Unknown error'))
        this.onError?.(error)
        this.cleanup()
      }

      // Start recording
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
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop()
    }
  }

  /**
   * Check if recording is active
   */
  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
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