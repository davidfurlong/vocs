import { style } from '@vanilla-extract/css';
import { fontWeightVars, primitiveColorVars, semanticColorVars, spaceVars, } from '../styles/vars.css.js';
import { arrowColor } from './ExternalLink.css.js';
export const root = style({});
export const accent = style({
    color: semanticColorVars.link,
    fontWeight: fontWeightVars.medium,
    textUnderlineOffset: spaceVars['2'],
    textDecoration: 'underline',
    transition: 'color 0.1s',
    selectors: {
        '&:hover': {
            color: semanticColorVars.linkHover,
        },
    },
}, 'accent');
export const styleless = style({
    vars: {
        [arrowColor]: primitiveColorVars.text3,
    },
}, 'styleless');
//# sourceMappingURL=Link.css.js.map