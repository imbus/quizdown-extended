export const defaultShadowRootId = "quizdownShadowRoot";

// Internal map to simulate context outside Svelte's lifecycle
const shadowRootMap = new Map<string, ShadowRoot>();

/**
 * Creates or clears a ShadowRoot on the given node and tracks it by ID.
 */
export function createShadowRoot(node: Element): ShadowRoot {
    if (shadowRootMap.has(node.id)) {
        console.error(`ShadowRoot in node with ID "${node.id}" already exists.`);
        return shadowRootMap.get(node.id)!;
    }

    // Clear the node's content before attaching shadow DOM
    node.innerHTML = '';

    let root: ShadowRoot;
    if (node.shadowRoot) {
        root = node.shadowRoot;
        root.innerHTML = '';
    } else {
        root = node.attachShadow({ mode: 'open' });
    }

    shadowRootMap.set(node.id, root);
    return root;
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
