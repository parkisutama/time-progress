<script lang="ts">
    import { timeData } from '../lib/stores.js';

    // Props for the quote section
    export let quote: string = "Hidupmu adalah cerminan dari pikiranmu. Jika kamu berpikir positif, maka hidupmu akan positif juga. Jika kamu berpikir negatif, maka hidupmu akan negatif juga.";
    export let cite: string = "- Dr. Wayne Dyer";
</script>

<header class="text-center py-4 mt-4 bg-gray-100 shadow-md">
    <!-- Quote Section -->
    <blockquote class="italic text-gray-700 text-center pl-2 md:pl-8 py-2 mx-auto max-w-sm md:max-w-2xl">
        <p class="text-xs font-semibold">{quote}</p>
        <cite class="block text-xs text-center mt-2 text-gray-600">{cite}</cite>
    </blockquote>
    <!-- Live Clock -->
    <div>
        <h2 >{$timeData.time}</h2>
        <h3 >{$timeData.date}</h3>
    </div>
</header>

<style>
    blockquote { 
        padding-left: 1rem;
    }

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
