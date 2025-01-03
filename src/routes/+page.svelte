<script>
    import Header from '../components/Header.svelte';
    import TodayProgress from '../components/TodayProgress.svelte';
    import WeekProgress from '../components/WeekProgress.svelte';
	import MonthProgress from '../components/MonthProgress.svelte';
    import QuarterProgress from '../components/QuarterProgress.svelte';
    import YearProgress from '../components/YearProgress.svelte';

</script>

<main class=" dashboard container mx-auto px-4 mt-4 my-4 bg-gray-100 shadow-md">
    <Header 
    ></Header>
    <section class="widget">
        <TodayProgress  />
    </section>
    <section class="widget">
        <WeekProgress />
    <section>
        <MonthProgress />
    </section>
    <section>
        <QuarterProgress />
    </section>
    <section>
        <YearProgress />
    </section>
</main>
<style>
    @media (max-width: 640px) {
    .dashboard {
        padding: 1rem;
    }

    .widget {
        align-items: flex-start;
    }
}
</style>
