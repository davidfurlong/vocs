import { createVar, style } from '@vanilla-extract/css';
export const arrowColor = createVar('arrowColor');
export const iconUrl = createVar('iconUrl');
export const root = style({
    selectors: {
        '&::after': {
            backgroundColor: 'currentColor',
            content: '',
            color: arrowColor,
            display: 'inline-block',
            height: '0.5em',
            marginBottom: '0.1em',
            marginLeft: '0.325em',
            marginRight: '0.25em',
            width: '0.5em',
            mask: `${iconUrl} no-repeat center / contain`,
        },
    },
});
//# sourceMappingURL=ExternalLink.css.js.map