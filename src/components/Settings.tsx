import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Dropzone } from './ui/Dropzone';
import { Palette, Save, RotateCcw, AlertCircle } from 'lucide-react';
import { processImageFile, MAX_LOGO_WIDTH, MAX_LOGO_HEIGHT } from '../utils/imageProcessor';

export function Settings() {
    const { logoUrl, primaryColor, secondaryColor, updateSettings, uploadLogo } = useTheme();
    const [localPrimaryColor, setLocalPrimaryColor] = useState(primaryColor);
    const [localSecondaryColor, setLocalSecondaryColor] = useState(secondaryColor);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = async (file: File | null) => {
        setError(null);

        if (!file) {
            setSelectedFile(null);
            return;
        }

        setIsProcessing(true);
        try {
            // Process and validate the image
            await processImageFile(file);
            // If validation passes, set the file
            setSelectedFile(file);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao processar imagem');
            setSelectedFile(null);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);

        try {
            let newLogoUrl = logoUrl;

            if (selectedFile) {
                setIsUploading(true);

                try {
                    // Process the image before uploading
                    const processed = await processImageFile(selectedFile);

                    // Upload the processed image
                    let fileToUpload: File;

                    if (processed instanceof File) {
                        // SVG file - upload as-is
                        fileToUpload = processed;
                    } else {
                        // Raster image - create File from processed blob
                        fileToUpload = new File(
                            [processed.blob],
                            selectedFile.name.replace(/\.[^.]+$/, '.png'),
                            { type: 'image/png' }
                        );
                    }

                    const uploadedUrl = await uploadLogo(fileToUpload);
                    if (uploadedUrl) {
                        newLogoUrl = uploadedUrl;
                    }
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Erro ao processar imagem');
                    return;
                } finally {
                    setIsUploading(false);
                }
            }

            await updateSettings({
                logoUrl: newLogoUrl,
                primaryColor: localPrimaryColor,
                secondaryColor: localSecondaryColor,
            });

            setSelectedFile(null);
            alert('Configurações salvas com sucesso!');
        } catch (error) {
            console.error('Error saving settings:', error);
            setError('Erro ao salvar configurações.');
        } finally {
            setIsSaving(false);
            setIsUploading(false);
        }
    };

    const handleReset = () => {
        setLocalPrimaryColor('#FCE300');
        setLocalSecondaryColor('#231f20');
        setSelectedFile(null);
    };

    return (
        <div className="max-w-4xl">
            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-red-800">Erro no Upload</p>
                        <p className="text-sm text-red-600 mt-1">{error}</p>
                    </div>
                </div>
            )}

            <div className="grid gap-6 mb-6">
                {/* Logo Card */}
                <Card
                    title="Logotipo"
                    description="Faça upload do logotipo que será exibido no sistema"
                >
                    <Dropzone
                        onFileSelect={handleFileSelect}
                        onFileRemove={() => {
                            setSelectedFile(null);
                            setError(null);
                        }}
                        currentImageUrl={logoUrl}
                        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                    />
                    <p className="text-xs text-gray-500 mt-3">
                        Formatos aceitos: JPG, PNG, SVG. Tamanho máximo: 2MB.
                        {isProcessing && <span className="text-blue-600 ml-2">Processando...</span>}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Imagens maiores que {MAX_LOGO_WIDTH}×{MAX_LOGO_HEIGHT}px serão redimensionadas automaticamente.
                    </p>
                </Card>

                {/* Colors Card */}
                <Card
                    title="Cores do Tema"
                    description="Personalize as cores principais do sistema"
                >
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Primary Color */}
                        <div>
                            <label className="block mb-3">
                                Cor Primária
                                <span className="label-description">
                                    Usada em botões e elementos principais
                                </span>
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={localPrimaryColor}
                                    onChange={(e) => setLocalPrimaryColor(e.target.value)}
                                    className="w-16 h-16 rounded-lg cursor-pointer border border-gray-200"
                                />
                                <input
                                    type="text"
                                    value={localPrimaryColor}
                                    onChange={(e) => setLocalPrimaryColor(e.target.value)}
                                    className="flex-1 font-mono text-sm"
                                    placeholder="#FCE300"
                                />
                            </div>
                        </div>

                        {/* Secondary Color */}
                        <div>
                            <label className="block mb-3">
                                Cor Secundária
                                <span className="label-description">
                                    Usada em textos e elementos secundários
                                </span>
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={localSecondaryColor}
                                    onChange={(e) => setLocalSecondaryColor(e.target.value)}
                                    className="w-16 h-16 rounded-lg cursor-pointer border border-gray-200"
                                />
                                <input
                                    type="text"
                                    value={localSecondaryColor}
                                    onChange={(e) => setLocalSecondaryColor(e.target.value)}
                                    className="flex-1 font-mono text-sm"
                                    placeholder="#231f20"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <Palette size={16} />
                            Prévia das Cores
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <button
                                className="px-6 py-3 rounded-lg font-semibold shadow-sm transition-all hover:shadow-md"
                                style={{
                                    backgroundColor: localPrimaryColor,
                                    color: localSecondaryColor,
                                }}
                            >
                                Botão Primário
                            </button>
                            <button
                                className="px-6 py-3 rounded-lg font-semibold shadow-sm transition-all hover:shadow-md"
                                style={{
                                    backgroundColor: localSecondaryColor,
                                    color: localPrimaryColor,
                                }}
                            >
                                Botão Secundário
                            </button>
                            <button
                                className="px-6 py-3 rounded-lg font-semibold border transition-all hover:bg-gray-50"
                                style={{
                                    borderColor: localPrimaryColor,
                                    color: localSecondaryColor,
                                }}
                            >
                                Botão Outline
                            </button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
                <Button
                    variant="ghost"
                    onClick={handleReset}
                    disabled={isSaving || isUploading || isProcessing}
                >
                    <RotateCcw size={16} className="mr-2" />
                    Restaurar Padrões
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={isSaving || isUploading || isProcessing}
                >
                    <Save size={16} className="mr-2" />
                    {isSaving || isUploading ? 'Salvando...' : isProcessing ? 'Processando...' : 'Salvar Configurações'}
                </Button>
            </div>
        </div>
    );
}
