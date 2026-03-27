'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RotateCcw, Check } from 'lucide-react';
import { Button } from './ui/button';
import Image from 'next/image';
import { toast } from 'sonner';

interface LivePictureCaptureProps {
  onCapture: (imageData: string) => void;
  capturedImage: string | null;
}

export function LivePictureCapture({
  onCapture,
  capturedImage,
}: LivePictureCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isVideoReady, setIsVideoReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // START CAMERA
  const startCamera = useCallback(async () => {
    try {
      setError('');
      setIsVideoReady(false);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setStream(mediaStream);
    } catch (err: unknown) {
      let errorMessage = 'Unable to access camera. ';
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError')
          errorMessage += 'Permission denied.';
        else if (err.name === 'NotFoundError')
          errorMessage += 'No camera found.';
        else if (err.name === 'NotReadableError')
          errorMessage += 'Camera in use.';
      } else {
        errorMessage += 'Please check your settings.';
      }
      setError(errorMessage);
    }
  }, []);

  // STOP CAMERA
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsVideoReady(false);
    }
  }, [stream]);

  // ATTACH STREAM TO VIDEO
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;

      videoRef.current
        .play()
        .catch((e) => console.error('Video play failed:', e));

      videoRef.current.onloadedmetadata = () => {
        setIsVideoReady(true);
      };
    }
  }, [stream]);

  // CAPTURE
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current || !isVideoReady) {
      toast.error('Camera not ready', {
        description: 'Please wait for the video stream to initialize.',
      });
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (ctx && video.videoWidth > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL('image/jpeg', 0.92);
      onCapture(imageData);
      stopCamera();

      toast.success('Photo captured successfully!');
    }
  };

  const retake = () => {
    onCapture('');
  };

  // CLEANUP
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="space-y-5">
      <div className="relative w-full max-w-md mx-auto">
        {/* Placeholder / Start screen */}
        {!stream && !capturedImage && (
          <div className="aspect-square bg-muted/30 rounded-2xl flex flex-col items-center justify-center p-10 border-2 border-dashed border-border">
            <Camera className="h-16 w-16 text-muted-foreground mb-5" />
            <p className="text-sm text-muted-foreground text-center mb-6">
              Take a live picture for verification
            </p>
            <Button
              onClick={startCamera}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Camera className="h-4 w-4 mr-2" />
              Open Camera
            </Button>
          </div>
        )}

        {/* Live video preview with overlay */}
        {stream && !capturedImage && (
          <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-primary">
            {/* Face guide overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 border-4 border-primary/60 rounded-full" />
                <div className="absolute inset-0 border-2 border-dashed border-primary/40 rounded-full animate-pulse" />
              </div>
            </div>

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Captured image preview */}
        {capturedImage && (
          <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-green-500 dark:border-green-400">
            <Image
              src={capturedImage}
              alt="Captured"
              fill
              unoptimized
              className="object-cover"
            />
            <div className="absolute top-4 right-4 bg-green-500 dark:bg-green-600 text-white p-2.5 rounded-full shadow-md">
              <Check className="h-5 w-5" />
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          <p>{error}</p>
        </div>
      )}

      {/* Controls */}
      {stream && !capturedImage && (
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={stopCamera}>
            Cancel
          </Button>
          <Button
            onClick={captureImage}
            disabled={!isVideoReady}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Camera className="h-4 w-4 mr-2" />
            {isVideoReady ? 'Capture Photo' : 'Waiting for camera...'}
          </Button>
        </div>
      )}

      {capturedImage && (
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={retake}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Photo
          </Button>
        </div>
      )}
    </div>
  );
}
