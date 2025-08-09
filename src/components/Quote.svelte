<script lang="ts">
	// Props for the quote section
	export let quote: string =
		'Hidupmu adalah cerminan dari pikiranmu. Jika kamu berpikir positif, maka hidupmu akan positif juga. Jika kamu berpikir negatif, maka hidupmu akan negatif juga.';
	export let cite: string = '- Dr. Wayne Dyer';
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
