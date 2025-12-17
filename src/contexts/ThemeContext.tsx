import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface ThemeSettings {
    logoUrl: string;
    primaryColor: string;
    secondaryColor: string;
}

interface ThemeContextType extends ThemeSettings {
    updateSettings: (settings: Partial<ThemeSettings>) => Promise<void>;
    uploadLogo: (file: File) => Promise<string | null>;
}

const defaultSettings: ThemeSettings = {
    logoUrl: '/logo.jpg',
    primaryColor: '#FCE300',
    secondaryColor: '#231f20',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        // Apply theme colors to CSS variables
        document.documentElement.style.setProperty('--brand-yellow', settings.primaryColor);
        document.documentElement.style.setProperty('--brand-black', settings.secondaryColor);
    }, [settings]);

    const loadSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('settings')
                .select('*')
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
                console.error('Error loading settings:', error);
                return;
            }

            if (data) {
                setSettings({
                    logoUrl: data.logo_url || defaultSettings.logoUrl,
                    primaryColor: data.primary_color || defaultSettings.primaryColor,
                    secondaryColor: data.secondary_color || defaultSettings.secondaryColor,
                });
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const uploadLogo = async (file: File): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `logo-${Date.now()}.${fileExt}`;
            const filePath = fileName;

            const { error: uploadError } = await supabase.storage
                .from('logos')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                console.error('Error uploading logo:', uploadError);
                return null;
            }

            const { data } = supabase.storage.from('logos').getPublicUrl(filePath);
            return data.publicUrl;
        } catch (error) {
            console.error('Error uploading logo:', error);
            return null;
        }
    };

    const updateSettings = async (newSettings: Partial<ThemeSettings>) => {
        try {
            // Check if settings exist
            const { data: existing } = await supabase
                .from('settings')
                .select('id')
                .limit(1)
                .single();

            const updateData = {
                logo_url: newSettings.logoUrl,
                primary_color: newSettings.primaryColor,
                secondary_color: newSettings.secondaryColor,
                updated_at: new Date().toISOString(),
            };

            if (existing) {
                // Update existing
                const { error } = await supabase
                    .from('settings')
                    .update(updateData)
                    .eq('id', existing.id);

                if (error) {
                    console.error('Error updating settings:', error);
                    return;
                }
            } else {
                // Insert new
                const { error } = await supabase
                    .from('settings')
                    .insert([updateData]);

                if (error) {
                    console.error('Error inserting settings:', error);
                    return;
                }
            }

            // Update local state
            setSettings(prev => ({ ...prev, ...newSettings }));
        } catch (error) {
            console.error('Error updating settings:', error);
        }
    };

    return (
        <ThemeContext.Provider value={{ ...settings, updateSettings, uploadLogo }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
