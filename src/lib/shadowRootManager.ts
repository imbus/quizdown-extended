export const defaultShadowRootId = "quizdownShadowRoot";

// Internal map to simulate context outside Svelte's lifecycle
const shadowRootMap = new Map<string, ShadowRoot>();

/**
 * Creates or clears a ShadowRoot on the given node and tracks it by ID.
 */
export function createShadowRoot(node: Element, shadowRootId: string = defaultShadowRootId): ShadowRoot {
    if (shadowRootMap.has(shadowRootId)) {
        console.error(`ShadowRoot with ID "${shadowRootId}" already created`);
        return shadowRootMap.get(shadowRootId)!;
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

    shadowRootMap.set(shadowRootId, root);
    return root;
}

/**
 * Retrieves a previously created ShadowRoot by its ID.
 */
export function getShadowRoot(shadowRootId: string = defaultShadowRootId): ShadowRoot | undefined {
    if (!shadowRootMap.has(shadowRootId)) {
        console.error(`ShadowRoot with ID "${shadowRootId}" wasn't created before`);
        return undefined;
    }
    return shadowRootMap.get(shadowRootId);
}
