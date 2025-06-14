import { resolve } from 'node:path';
import { default as fs } from 'fs-extra';
import pc from 'picocolors';
const deadlinksPath = resolve(import.meta.dirname, '../.vocs/cache/deadlinks.json');
export function postbuild({ logger } = {}) {
    return {
        name: 'postbuild',
        closeBundle() {
            if (!fs.existsSync(deadlinksPath))
                return;
            const deadlinks = fs.readJSONSync(deadlinksPath);
            logger?.error([
                'found dead links:',
                '',
                ...deadlinks.map(([link, path]) => `${pc.red(link)} in ${pc.blue(path)}`),
                pc.italic(pc.gray('skip by setting link to "#TODO".')),
                '\n',
            ].join('\n'), {
                clear: true,
                timestamp: true,
            });
            throw new Error('deadlinks found.');
        },
    };
}
//# sourceMappingURL=postbuild.js.map