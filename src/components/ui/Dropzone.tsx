import { Upload, X } from 'lucide-react';
import { useState, useRef } from 'react';

interface DropzoneProps {
    onFileSelect: (file: File) => void;
    onFileRemove?: () => void;
    currentImageUrl?: string | null;
    accept?: string;
}

export function Dropzone({ onFileSelect, onFileRemove, currentImageUrl, accept = 'image/*' }: DropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFile(file);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleFile = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        onFileSelect(file);
    };

    const handleRemove = () => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onFileRemove?.();
    };

    const displayImage = preview || currentImageUrl;

    return (
        <div>
            {displayImage ? (
                <div className="relative">
                    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                        <img
                            src={displayImage}
                            alt="Preview"
                            className="mx-auto object-contain"
                            style={{ maxWidth: '240px', maxHeight: '80px' }}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/logo.jpg';
                            }}
                        />
                    </div>
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="btn-secondary flex-1"
                        >
                            Trocar
                        </button>
                        <button
                            onClick={handleRemove}
                            className="btn-ghost px-4"
                            title="Remover"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                        transition-all
                        ${isDragging
                            ? 'border-gray-400 bg-gray-100'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                        }
                    `}
                >
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <Upload size={24} className="text-gray-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">
                                Clique ou arraste uma imagem
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                PNG, JPG até 2MB
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileInput}
                className="hidden"
            />
        </div>
    );
}
