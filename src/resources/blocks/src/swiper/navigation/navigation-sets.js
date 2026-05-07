import { ReactComponent as PrevDefault } from './default/prev.svg';
import { ReactComponent as NextDefault } from './default/next.svg';

import { ReactComponent as PrevBold } from './bold/prev.svg';
import { ReactComponent as NextBold } from './bold/next.svg';

import { ReactComponent as PrevCircle } from './circle/prev.svg';
import { ReactComponent as NextCircle } from './circle/next.svg';

export const NavigationSets = {
    default: {
        prev: PrevDefault,
        next: NextDefault
    },
    bold: {
        prev: PrevBold,
        next: NextBold
    },
    circle: {
        prev: PrevCircle,
        next: NextCircle
    }
};