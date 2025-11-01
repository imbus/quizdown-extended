export const defaultShadowRootId = "quizdownShadowRoot";

// Internal map to simulate context outside Svelte's lifecycle
const shadowRootMap = new Map<string, ShadowRoot>();

export interface ShadowRootOptions {
    fontFamily?: string;
    fontFamilyHeading?: string;
    fontUrl?: string;
    customStyles?: string;
}

/**
 * Creates or clears a ShadowRoot on the given node and tracks it by ID.
 * Optionally injects fonts and custom styles into the shadow root.
 */
export function createShadowRoot(node: Element, options?: ShadowRootOptions): ShadowRoot {
    // if (shadowRootMap.has(node.id)) {
    //     console.error(`ShadowRoot in node with ID "${node.id}" already exists.`);
    //     return shadowRootMap.get(node.id)!;
    // }

    // Clear the node's content before attaching shadow DOM
    node.innerHTML = '';

    let root: ShadowRoot;
    if (node.shadowRoot) {
        root = node.shadowRoot;
        root.innerHTML = '';
    } else {
        root = node.attachShadow({ mode: 'open' });
    }

    // Inject fonts and custom styles if provided
    if (options && (options.fontFamily || options.fontUrl || options.customStyles || options.fontFamilyHeading)) {
        injectStylesIntoShadowRoot(root, options);
    }

    shadowRootMap.set(node.id, root);
    return root;
}

/**
 * Injects fonts and custom styles into the shadow root
 */
function injectStylesIntoShadowRoot(root: ShadowRoot, options: ShadowRootOptions) {
    const styleElement = document.createElement('style');
    let styles = '';

    // Add font import if URL provided
    if (options.fontUrl) {
        styles += `@import url('${options.fontUrl}');\n\n`;
    }

    // Add font family to all elements
    if (options.fontFamily) {
        styles += `
            * {
                font-family: ${options.fontFamily};
            }
        \n`;
    }

        // Add separate font family for headings
    if (options.fontFamilyHeading) {
        styles += `
            h1, h2, h3, h4, h5, h6 {
                font-family: ${options.fontFamilyHeading};
            }
        \n`;
    }

    // Add custom styles
    if (options.customStyles) {
        styles += '\n' + options.customStyles;
    }

    styleElement.textContent = styles;
    root.prepend(styleElement);
}

/**
 * Retrieves a previously created ShadowRoot by its ID.
 */
export function getShadowRoots(): Array<ShadowRoot> {
    if (shadowRootMap.size === 0) {
        console.error(`No ShadowRoots have been created.`);
        return [];
    }
    return Array.from(shadowRootMap.values());
}