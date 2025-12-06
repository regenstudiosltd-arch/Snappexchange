"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, RotateCcw, Check } from "lucide-react";
import { Button } from "./ui/button";

interface LivePictureCaptureProps {
  onCapture: (imageData: string) => void;
  capturedImage: string | null;
}

export function LivePictureCapture({ onCapture, capturedImage }: LivePictureCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      setError("");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      // Handle different types of camera errors
      let errorMessage = "Unable to access camera. ";
      
      if (err.name === "NotAllowedError") {
        errorMessage += "Camera permission was denied. Please allow camera access in your browser settings and try again.";
      } else if (err.name === "NotFoundError") {
        errorMessage += "No camera device found. Please connect a camera and try again.";
      } else if (err.name === "NotReadableError") {
        errorMessage += "Camera is being used by another application. Please close other apps and try again.";
      } else {
        errorMessage += "Please check your camera settings and try again.";
      }
      
      setError(errorMessage);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        onCapture(imageData);
        stopCamera();
      }
    }
  };

  const retake = () => {
    onCapture("");
    startCamera();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-md mx-auto">
        {!stream && !capturedImage && (
          <div className="aspect-square bg-gray-100 rounded-2xl flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300">
            <Camera className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-sm text-muted-foreground text-center mb-4">
              Take a live picture for verification
            </p>
            <Button onClick={startCamera} className="bg-cyan-500 hover:bg-cyan-600">
              <Camera className="h-4 w-4 mr-2" />
              Open Camera
            </Button>
          </div>
        )}

        {stream && !capturedImage && (
          <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-cyan-500">
            {/* Face Guide Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="relative w-64 h-64">
                {/* Rounded square guide */}
                <div className="absolute inset-0 border-4 border-cyan-500 rounded-full opacity-50" />
                <div className="absolute inset-0 border-2 border-dashed border-white rounded-full" />
                
                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-3xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-3xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-3xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-3xl" />
              </div>
            </div>

            {/* Helper text */}
            <div className="absolute top-4 left-0 right-0 text-center z-10">
              <div className="inline-block bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                Position your face within the circle
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

        {capturedImage && (
          <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-green-500">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4">
              <div className="bg-green-500 text-white p-2 rounded-full">
                <Check className="h-5 w-5" />
              </div>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm space-y-3">
          <p>{error}</p>
          <Button 
            onClick={startCamera} 
            variant="outline" 
            className="w-full border-red-300 text-red-700 hover:bg-red-100"
          >
            <Camera className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <div className="text-xs text-red-600 space-y-1">
            <p className="font-semibold">Troubleshooting tips:</p>
            <p>• Check browser permissions (click the lock icon in address bar)</p>
            <p>• Allow camera access when prompted</p>
            <p>• Make sure no other app is using the camera</p>
            <p>• Try refreshing the page</p>
          </div>
        </div>
      )}

      {stream && !capturedImage && (
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={stopCamera}>
            Cancel
          </Button>
          <Button onClick={captureImage} className="bg-cyan-500 hover:bg-cyan-600">
            <Camera className="h-4 w-4 mr-2" />
            Capture Photo
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

      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>• Ensure good lighting</p>
        <p>• Face the camera directly</p>
        <p>• Remove sunglasses or face coverings</p>
      </div>
    </div>
  );
}
