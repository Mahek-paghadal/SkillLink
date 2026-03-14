import { createContext, useContext, useEffect, useState } from 'react';
import { isAuthenticated } from '../utils/auth';
import { getPreferences, updatePreferences } from '../api/authApi';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('system');

    useEffect(() => {
        let isMounted = true;

        const loadPreferences = async () => {
            if (!isAuthenticated()) return;
            try {
                const res = await getPreferences();
                const nextTheme = res.data?.theme;
                if (isMounted && typeof nextTheme === 'string') {
                    setTheme(nextTheme);
                }
            } catch (error) {
                // ignore preference load errors
            }
        };

        loadPreferences();
        const handleAuthChange = () => loadPreferences();
        window.addEventListener('auth-changed', handleAuthChange);

        return () => {
            isMounted = false;
            window.removeEventListener('auth-changed', handleAuthChange);
        };
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        
        // Remove existing theme classes
        root.classList.remove('light', 'dark');
        
        if (theme === 'system') {
            // Use system preference
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }
        
    }, [theme]);

    // Listen for system theme changes
    useEffect(() => {
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e) => {
                const root = window.document.documentElement;
                root.classList.remove('light', 'dark');
                root.classList.add(e.matches ? 'dark' : 'light');
            };
            
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => {
            let nextTheme = 'light';
            if (prev === 'light') nextTheme = 'dark';
            else if (prev === 'dark') nextTheme = 'system';

            if (isAuthenticated()) {
                updatePreferences({ theme: nextTheme }).catch(() => {
                    // ignore update errors
                });
            }

            return nextTheme;
        });
    };

    const setThemeMode = (mode) => {
        setTheme(mode);
        if (isAuthenticated()) {
            updatePreferences({ theme: mode }).catch(() => {
                // ignore update errors
            });
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
};
