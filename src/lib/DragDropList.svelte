<script lang="ts">
	// In Svelte 5, declare the bindable prop with $props.
	let { data = $bindable() } = $props<{ data: any[] }>();

	// Use $state for local, reactive UI state.
	let draggingIndex = $state(-1);
	let dragOverIndex = $state(-1);

	function handleDragStart(index: number) {
		draggingIndex = index;
	}

	function handleDragOver(event: DragEvent, index: number) {
		event.preventDefault(); // Necessary to allow the `drop` event to fire.
		dragOverIndex = index;
	}

	function handleDrop(event: DragEvent, dropIndex: number) {
		event.preventDefault();
		if (draggingIndex === -1 || draggingIndex === dropIndex) {
			resetDragState();
			return;
		}

		const items = [...data];
		const [draggedItem] = items.splice(draggingIndex, 1);
		items.splice(dropIndex, 0, draggedItem);

		// Update the data
		data = items;

		resetDragState();
	}

	function handleDragEnd() {
		resetDragState();
	}
	
	function resetDragState() {
		draggingIndex = -1;
		dragOverIndex = -1;
	}
</script>

<style>
	.list-container {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 10px;
		border: 1px solid #ccc;
		border-radius: 8px;
	}
	.list-item {
		padding: 12px;
		border: 1px solid var(--quizdown-color-primary);
		border-radius: 4px;
		cursor: grab;
		transition: background-color 0.2s, box-shadow 0.2s;
		user-select: none;
	}
	.list-item:active {
		cursor: grabbing;
	}
	.list-item.dragging {
		opacity: 0.5;
		box-shadow: 0 4px 8px rgba(0,0,0,0.2);
	}
	.list-item.dragover {
		background-color: #e0f7fa;
		border-style: dashed;
	}
</style>

<div class="list-container" role="list">
	{#each data as item, index (item)}
		<div
			role="listitem"
			draggable="true"
			ondragstart={() => handleDragStart(index)}
			ondragover={(e) => handleDragOver(e, index)}
			ondrop={(e) => handleDrop(e, index)}
			ondragend={handleDragEnd}
			class="list-item"
			class:dragging={draggingIndex === index}
			class:dragover={dragOverIndex === index && draggingIndex !== index}
		>
			{@html item.html}
		</div>
	{/each}
</div>