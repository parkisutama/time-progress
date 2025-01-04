<script lang="ts">
	import { timeData } from '../lib/stores.js';
</script>

<header class="mt-aut mx-auto px-2 py-8 text-center">
	<!-- Live Clock -->
	<div class="rounded-md bg-white px-4 py-4 shadow-md">
		<h2>{$timeData.time}</h2>
		<h3>{$timeData.date}</h3>
	</div>
</header>

<style>
	h2 {
		font-size: 2rem;
		font-weight: 600;
		color: #1f2937;
		margin-bottom: 1rem;
		text-align: center;
	}
	h3 {
		font-size: 1rem;
		font-weight: 400;
		color: #1f2937;
		margin-bottom: 1rem;
		text-align: center;
	}
</style>
