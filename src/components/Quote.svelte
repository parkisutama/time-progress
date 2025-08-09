<script lang="ts">
	// Props for the quote section
	export let quote: string =
		'We know the world only through the window of our mind. When our mind is noisy, the world is as well.And when our mind is peaceful, the world is, too.Knowing our minds is just as important as trying to change the world.';
	export let cite: string = '- Haemin Sunim';
</script>

<!-- Quote Section -->
<blockquote class="mx-auto max-w-sm text-center text-gray-700 italic md:max-w-2xl md:pl-8">
	<p class="py-4 text-xs font-semibold">{quote}</p>
	<cite class="block py-2 text-center text-xs text-gray-600">{cite}</cite>
</blockquote>

<style>
	blockquote {
		padding-left: 1rem;
	}
</style>
