import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMounted } from '../hooks/useMounted.js';
import { useTheme } from '../hooks/useTheme.js';
import { Icon } from './Icon.js';
import * as styles from './ThemeToggle.css.js';
import { Moon } from './icons/Moon.js';
import { Sun } from './icons/Sun.js';
export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const mounted = useMounted();
    if (!mounted)
        return null;
    if (!theme)
        return null;
    return (_jsxs("div", { className: styles.root, children: [_jsx("button", { "data-active": theme === 'light', type: "button", className: styles.themeToggleButton, onClick: () => setTheme('light'), children: _jsx(Icon, { label: "Light Mode", icon: Sun, size: "16px" }) }), _jsx("button", { "data-active": theme === 'dark', type: "button", className: styles.themeToggleButton, onClick: () => setTheme('dark'), children: _jsx(Icon, { label: "Dark Mode", icon: Moon, size: "16px" }) })] }));
}
//# sourceMappingURL=ThemeToggle.js.map