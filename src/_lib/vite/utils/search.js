import { readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { compile, run } from '@mdx-js/mdx';
import debug_ from 'debug';
import { default as fs } from 'fs-extra';
import { globby } from 'globby';
import MiniSearch from 'minisearch';
import pLimit from 'p-limit';
import { Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as runtime from 'react/jsx-runtime';
import { getRehypePlugins, getRemarkPlugins } from '../plugins/mdx.js';
import * as cache_ from './cache.js';
import { hash } from './hash.js';
import { slash } from './slash.js';
const limit = pLimit(30);
export const debug = debug_('vocs:search');
export async function buildIndex({ baseDir, cacheDir, }) {
    const cache = cache_.search({ cacheDir });
    const pagesPaths = await globby(`${resolve(baseDir, 'pages')}/**/*.{md,mdx}`);
    const rehypePlugins = getRehypePlugins({ cacheDir, rootDir: baseDir, twoslash: false });
    const documents = await Promise.all(pagesPaths.map((pagePath) => limit(async (pagePath) => {
        const mdx = readFileSync(pagePath, 'utf-8');
        const key = `index.${hash(pagePath)}`;
        const pageCache = cache.get(key) ?? {};
        if (pageCache.mdx === mdx)
            return pageCache.document;
        const html = await processMdx(pagePath, mdx, { rehypePlugins });
        const sections = splitPageIntoSections(html);
        if (sections.length === 0) {
            cache.set(key, { mdx, document: [] });
            return [];
        }
        const fileId = getDocId(baseDir, pagePath);
        const relFile = slash(relative(baseDir, fileId));
        const href = relFile
            .replace(relative(baseDir, resolve(baseDir, 'pages')), '')
            .replace(/\.(.*)/, '')
            .replace(/\/index$/, '');
        const document = sections.map((section) => ({
            href: `${href}#${section.anchor}`,
            html: section.html,
            id: `${fileId}#${section.anchor}`,
            isPage: section.isPage,
            text: section.text,
            title: section.titles.at(-1),
            titles: section.titles.slice(0, -1),
        }));
        cache.set(key, { mdx, document });
        return document;
    }, pagePath)));
    const index = new MiniSearch({
        fields: ['title', 'titles', 'text'],
        storeFields: ['href', 'html', 'isPage', 'text', 'title', 'titles'],
        // TODO
        // ...options.miniSearch?.options,
    });
    await index.addAllAsync(documents.flat());
    debug(`vocs:search > indexed ${pagesPaths.length} files`);
    return index;
}
export function saveIndex(outDir, index, { cacheDir } = {}) {
    const cache = cache_.search({ cacheDir });
    const json = index.toJSON();
    const hash_ = cache.get('hash') || hash(JSON.stringify(json), 8);
    const dir = join(outDir, '.vocs');
    fs.ensureDirSync(dir);
    fs.writeJSONSync(join(dir, `search-index-${hash_}.json`), json);
    return hash_;
}
const remarkPlugins = getRemarkPlugins();
export async function processMdx(filePath, file, options) {
    const { rehypePlugins } = options;
    try {
        const compiled = await compile(file, {
            baseUrl: pathToFileURL(filePath).href,
            outputFormat: 'function-body',
            remarkPlugins,
            rehypePlugins,
        });
        const { default: MDXContent } = await run(compiled, { ...runtime, Fragment });
        const html = renderToStaticMarkup(MDXContent({
        // TODO: Pass components - vanilla extract and virtual module errors
        // components,
        }));
        return html;
    }
    catch (error) {
        // TODO: Resolve imports (e.g. virtual modules)
        return '';
    }
}
export function getDocId(baseDir, file) {
    const relFile = slash(relative(baseDir, file));
    let id = slash(join(baseDir, relFile));
    id = id.replace(/(^|\/)index\.(mdx|html)?$/, '$1');
    return id;
}
const headingRegex = /<h(\d*).*?>(.*?<a.*? href=".*?".*?>.*?<\/a>)<\/h\1>/gi;
// Extracts heading content and anchor ID from heading HTML.
// Matches the LAST anchor tag with a hash in href (the heading's own anchor link),
// ignoring any markdown links with hashes within the heading content.
// Group 1: heading content before the anchor, Group 2: anchor ID after the #
const headingContentRegex = /(.*)<a[^>]*? href="[^"]*?#([^"]*?)"[^>]*?>.*?<\/a>$/i;
export function splitPageIntoSections(html) {
    const result = html.split(headingRegex);
    result.shift();
    let parentTitles = [];
    const sections = [];
    for (let i = 0; i < result.length; i += 3) {
        const level = Number.parseInt(result[i]) - 1;
        const heading = result[i + 1];
        const headingResult = headingContentRegex.exec(heading);
        const title = clearHtmlTags(headingResult?.[1] ?? '').trim();
        const anchor = headingResult?.[2] ?? '';
        const content = result[i + 2];
        if (!title || !content)
            continue;
        const titles = parentTitles.slice(0, level);
        titles[level] = title;
        sections.push({
            anchor,
            html: content,
            isPage: i === 0,
            titles,
            text: getSearchableText(content),
        });
        if (level === 0)
            parentTitles = [title];
        else
            parentTitles[level] = title;
    }
    return sections;
}
function getSearchableText(content) {
    return clearHtmlTags(content);
}
function clearHtmlTags(str) {
    return str.replace(/<[^>]*>/g, '');
}
//# sourceMappingURL=search.js.map