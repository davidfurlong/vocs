/// <reference types="mdast-util-to-hast" />
/// <reference types="mdast-util-directive" />
import { h } from 'hastscript';
import { visit } from 'unist-util-visit';
export function remarkSteps() {
    return (tree) => {
        visit(tree, (node) => {
            if (node.type !== 'containerDirective')
                return;
            if (node.name !== 'steps')
                return;
            const data = node.data || (node.data = {});
            const tagName = 'div';
            node.attributes = {
                ...node.attributes,
                'data-vocs-steps': 'true',
            };
            data.hName = tagName;
            data.hProperties = h(tagName, node.attributes || {}).properties;
            const depth = node.children.find((child) => child.type === 'heading')?.depth ?? 2;
            let currentChild;
            const children = [];
            for (const child of node.children) {
                if (child.type === 'heading' && child.depth === depth) {
                    if (currentChild && currentChild.children.length > 0)
                        children.push(currentChild);
                    currentChild = {
                        type: 'paragraph',
                        children: [],
                        data: {
                            hName: 'div',
                            hProperties: {
                                'data-depth': depth,
                            },
                        },
                    };
                }
                currentChild.children.push(child);
            }
            children.push(currentChild);
            node.children = children;
        });
    };
}
//# sourceMappingURL=steps.js.map