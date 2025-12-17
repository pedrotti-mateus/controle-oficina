// Constants
export const MAX_LOGO_WIDTH = 240;
export const MAX_LOGO_HEIGHT = 80;
export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];

interface ProcessedImage {
    blob: Blob;
    type: string;
    url: string;
    width: number;
    height: number;
}

interface ValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Validate image file (type and size)
 */
export function validateImageFile(file: File): ValidationResult {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: 'Formato inválido. Use PNG, JPG ou SVG.',
        };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        return {
            valid: false,
            error: `Arquivo muito grande (${sizeMB}MB). O tamanho máximo é 2MB.`,
        };
    }

    return { valid: true };
}

/**
 * Validate SVG file
 */
export async function validateSVG(file: File): Promise<ValidationResult> {
    try {
        const text = await file.text();

        // Basic SVG validation
        if (!text.includes('<svg')) {
            return {
                valid: false,
                error: 'Arquivo SVG inválido.',
            };
        }

        // Check for potentially malicious content
        const dangerousPatterns = ['<script', 'javascript:', 'onerror=', 'onload='];
        for (const pattern of dangerousPatterns) {
            if (text.toLowerCase().includes(pattern)) {
                return {
                    valid: false,
                    error: 'SVG contém conteúdo não permitido.',
                };
            }
        }

        return { valid: true };
    } catch (error) {
        return {
            valid: false,
            error: 'Erro ao ler arquivo SVG.',
        };
    }
}

/**
 * Calculate new dimensions maintaining aspect ratio
 */
function calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
): { width: number; height: number } {
    let width = originalWidth;
    let height = originalHeight;

    // Scale down if needed
    if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
    }

    if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
    }

    return {
        width: Math.round(width),
        height: Math.round(height),
    };
}

/**
 * Resize raster image (PNG/JPG) using canvas
 */
export async function resizeImage(
    file: File,
    maxWidth: number = MAX_LOGO_WIDTH,
    maxHeight: number = MAX_LOGO_HEIGHT
): Promise<ProcessedImage> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.onload = () => {
                try {
                    // Calculate new dimensions
                    const { width, height } = calculateDimensions(
                        img.width,
                        img.height,
                        maxWidth,
                        maxHeight
                    );

                    // If image is already smaller than max dimensions, use original
                    if (img.width <= maxWidth && img.height <= maxHeight) {
                        file.arrayBuffer().then((buffer) => {
                            const blob = new Blob([buffer], { type: file.type });
                            resolve({
                                blob,
                                type: file.type,
                                url: URL.createObjectURL(blob),
                                width: img.width,
                                height: img.height,
                            });
                        });
                        return;
                    }

                    // Create canvas and resize
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Falha ao criar contexto canvas'));
                        return;
                    }

                    // Use better image smoothing
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';

                    // Draw resized image
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to blob
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('Falha ao processar imagem'));
                                return;
                            }

                            resolve({
                                blob,
                                type: 'image/png',
                                url: URL.createObjectURL(blob),
                                width,
                                height,
                            });
                        },
                        'image/png',
                        0.95 // Quality
                    );
                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => {
                reject(new Error('Falha ao carregar imagem'));
            };

            img.src = e.target?.result as string;
        };

        reader.onerror = () => {
            reject(new Error('Falha ao ler arquivo'));
        };

        reader.readAsDataURL(file);
    });
}

/**
 * Process image file based on type
 */
export async function processImageFile(file: File): Promise<ProcessedImage | File> {
    // Validate file first
    const validation = validateImageFile(file);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    // Handle SVG separately (don't resize)
    if (file.type === 'image/svg+xml') {
        const svgValidation = await validateSVG(file);
        if (!svgValidation.valid) {
            throw new Error(svgValidation.error);
        }
        // Return original SVG file
        return file;
    }

    // Resize raster images (PNG/JPG)
    return resizeImage(file);
}
