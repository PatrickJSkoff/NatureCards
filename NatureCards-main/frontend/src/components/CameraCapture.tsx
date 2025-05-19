import { useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  isProcessing?: boolean;
}

export function CameraCapture({ onCapture, isProcessing = false }: CameraCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onCapture(file);
    }
    // Reset the input value so the same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="relative w-36 sm:w-48 h-36 sm:h-48">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        className="hidden"
      />
      <Card 
        className="w-full h-full flex flex-col items-center justify-center gap-2 sm:gap-4 hover:bg-slate-100 transition-colors p-4 cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        {isProcessing ? (
          <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 animate-spin" />
        ) : (
          <Camera className="w-8 h-8 sm:w-12 sm:h-12" />
        )}
        <h2 className="text-sm sm:text-xl font-semibold text-center">
          {isProcessing ? 'Processing...' : 'Take Picture'}
        </h2>
      </Card>
    </div>
  );
} 