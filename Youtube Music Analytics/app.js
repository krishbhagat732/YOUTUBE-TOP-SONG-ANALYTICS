// YouTube Top 100 Songs Analytics Dashboard

// Sample data - in a real app this would come from an API
const songsData = [
    {
        title: "ROSÉ & Bruno Mars - APT. (Official Music Video)",
        channel: "ROSÉ",
        view_count: 2009014557,
        duration: 173,
        duration_minutes: 2.88,
        channel_follower_count: 19200000,
        primary_genre: "pop",
        success_category: "Viral",
        view_efficiency: 104.635
    },
    {
        title: "Lady Gaga, Bruno Mars - Die With A Smile (Official Music Video)",
        channel: "Lady Gaga",
        view_count: 1324833300,
        duration: 252,
        duration_minutes: 4.2,
        channel_follower_count: 29600000,
        primary_genre: "pop",
        success_category: "Viral",
        view_efficiency: 44.758
    },
    {
        title: "Reneé Rapp - Leave Me Alone (Official Music Video)",
        channel: "Reneé Rapp",
        view_count: 2536628,
        duration: 160,
        duration_minutes: 2.67,
        channel_follower_count: 408000,
        primary_genre: "pop",
        success_category: "Low",
        view_efficiency: 6.218
    },
    {
        title: "Billie Eilish - BIRDS OF A FEATHER (Official Music Video)",
        channel: "Billie Eilish",
        view_count: 558329099,
        duration: 231,
        duration_minutes: 3.85,
        channel_follower_count: 56800000,
        primary_genre: "alternative",
        success_category: "Viral",
        view_efficiency: 9.827
    },
    {
        title: "Sabrina Carpenter - Espresso",
        channel: "Sabrina Carpenter",
        view_count: 472570966,
        duration: 175,
        duration_minutes: 2.92,
        channel_follower_count: 7580000,
        primary_genre: "pop",
        success_category: "Viral",
        view_efficiency: 62.371
    }
];

// Generate additional sample data to reach 100 songs
const genres = ['pop', 'alternative', 'rap', 'country', 'hip_hop', 'electronic', 'indie', 'rb', 'rock', 'other', 'unknown'];
const successCategories = ['Low', 'Medium', 'High', 'Viral'];
const channels = ['Taylor Swift', 'Drake', 'Ariana Grande', 'Ed Sheeran', 'The Weeknd', 'Dua Lipa', 'Post Malone', 'Olivia Rodrigo'];

// Generate 95 more songs
for (let i = 0; i < 95; i++) {
    const genre = genres[Math.floor(Math.random() * genres.length)];
    const success = successCategories[Math.floor(Math.random() * successCategories.length)];
    const channel = channels[Math.floor(Math.random() * channels.length)];
    
    let baseViews;
    switch (success) {
        case 'Viral': baseViews = 500000000 + Math.random() * 1500000000; break;
        case 'High': baseViews = 100000000 + Math.random() * 400000000; break;
        case 'Medium': baseViews = 10000000 + Math.random() * 90000000; break;
        case 'Low': baseViews = 1000000 + Math.random() * 9000000; break;
    }
    
    const followers = 1000000 + Math.random() * 50000000;
    const duration = 120 + Math.random() * 240;
    
    songsData.push({
        title: `${channel} - Song ${i + 6}`,
        channel: channel,
        view_count: Math.floor(baseViews),
        duration: Math.floor(duration),
        duration_minutes: duration / 60,
        channel_follower_count: Math.floor(followers),
        primary_genre: genre,
        success_category: success,
        view_efficiency: baseViews / followers
    });
}

// App state
let currentTab = 'overview';
let filteredSongs = [...songsData];
let comparisonSongs = [];
let charts = {};

// Chart colors
const chartColors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    initializeCharts();
    populateFilters();
    updateSongsTable();
    updateKeyStats();
});

// Event Listeners
function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Log scale toggle
    document.getElementById('logScaleToggle').addEventListener('change', updateDistributionChart);
    
    // Search and filters
    document.getElementById('songSearch').addEventListener('input', filterSongs);
    document.getElementById('successFilter').addEventListener('change', filterSongs);
    document.getElementById('genreFilterExplorer').addEventListener('change', filterSongs);
    document.getElementById('genreFilter').addEventListener('change', updateTopSongsByGenre);
    
    // Prediction form
    document.getElementById('durationSlider').addEventListener('input', updatePredictionInputs);
    document.getElementById('followersSlider').addEventListener('input', updatePredictionInputs);
    document.getElementById('predictButton').addEventListener('click', predictSuccess);
    
    // Export data
    document.getElementById('exportData').addEventListener('click', exportData);
    
    // Clear comparison
    document.getElementById('clearComparison').addEventListener('click', clearComparison);
    
    // Table sorting
    document.querySelectorAll('.songs-table th[data-sort]').forEach(th => {
        th.addEventListener('click', (e) => {
            const sortBy = e.target.dataset.sort;
            sortTable(sortBy);
        });
    });
}

// Tab switching
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    
    currentTab = tabName;
    
    // Initialize charts for the active tab
    setTimeout(() => {
        initializeTabCharts(tabName);
    }, 100);
}

// Theme toggle
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    
    if (body.dataset.colorScheme === 'dark') {
        body.dataset.colorScheme = 'light';
        themeToggle.textContent = '🌙 Dark Mode';
    } else {
        body.dataset.colorScheme = 'dark';
        themeToggle.textContent = '☀️ Light Mode';
    }
    
    // Recreate charts with new theme
    setTimeout(() => {
        Object.values(charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        charts = {};
        initializeCharts();
    }, 100);
}

// Initialize all charts
function initializeCharts() {
    if (currentTab === 'overview' || currentTab === '') {
        createScatterChart();
        createTopSongsChart();
        createDistributionChart();
    }
}

// Initialize charts for specific tabs
function initializeTabCharts(tabName) {
    switch (tabName) {
        case 'overview':
            createScatterChart();
            createTopSongsChart();
            createDistributionChart();
            break;
        case 'performance':
            createSuccessPieChart();
            createChannelEfficiencyChart();
            createDurationBoxChart();
            createCorrelationChart();
            break;
        case 'genre':
            createGenreDistChart();
            createGenreViewsChart();
            updateGenreMetrics();
            updateTopSongsByGenre();
            break;
        case 'predictive':
            createFeatureImportanceChart();
            updatePredictionInputs();
            break;
    }
}

// Scatter chart: View Count vs Channel Followers
function createScatterChart() {
    const ctx = document.getElementById('scatterChart');
    if (!ctx) return;
    
    if (charts.scatter) charts.scatter.destroy();
    
    const data = {
        datasets: [{
            label: 'Songs',
            data: songsData.map(song => ({
                x: song.channel_follower_count,
                y: song.view_count,
                genre: song.primary_genre,
                title: song.title,
                channel: song.channel
            })),
            backgroundColor: chartColors[0] + '80',
            borderColor: chartColors[0],
            borderWidth: 1,
            pointRadius: 5,
            pointHoverRadius: 7
        }]
    };
    
    charts.scatter = new Chart(ctx, {
        type: 'scatter',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'logarithmic',
                    title: {
                        display: true,
                        text: 'Channel Followers'
                    }
                },
                y: {
                    type: 'logarithmic',
                    title: {
                        display: true,
                        text: 'View Count'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return context[0].raw.title;
                        },
                        label: function(context) {
                            return [
                                `Channel: ${context.raw.channel}`,
                                `Views: ${formatNumber(context.raw.y)}`,
                                `Followers: ${formatNumber(context.raw.x)}`,
                                `Genre: ${context.raw.genre}`
                            ];
                        }
                    }
                },
                legend: {
                    display: false
                }
            }
        }
    });
}

// Top 10 songs chart
function createTopSongsChart() {
    const ctx = document.getElementById('topSongsChart');
    if (!ctx) return;
    
    if (charts.topSongs) charts.topSongs.destroy();
    
    const topSongs = [...songsData]
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, 10);
    
    charts.topSongs = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topSongs.map(song => song.title.split(' - ')[0].substring(0, 15) + '...'),
            datasets: [{
                data: topSongs.map(song => song.view_count),
                backgroundColor: chartColors.slice(0, 10),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return topSongs[context[0].dataIndex].title;
                        },
                        label: function(context) {
                            return `Views: ${formatNumber(context.raw)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'View Count'
                    }
                }
            }
        }
    });
}

// View count distribution chart
function createDistributionChart() {
    const ctx = document.getElementById('distributionChart');
    if (!ctx) return;
    
    if (charts.distribution) charts.distribution.destroy();
    
    const isLogScale = document.getElementById('logScaleToggle').checked;
    
    // Create bins for histogram
    const views = songsData.map(song => song.view_count);
    const bins = createHistogramBins(views, 15);
    
    charts.distribution = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: bins.map(bin => `${formatNumber(bin.start)} - ${formatNumber(bin.end)}`),
            datasets: [{
                data: bins.map(bin => bin.count),
                backgroundColor: chartColors[1] + 'AA',
                borderColor: chartColors[1],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'View Count Range'
                    }
                },
                y: {
                    type: isLogScale ? 'logarithmic' : 'linear',
                    title: {
                        display: true,
                        text: 'Number of Songs'
                    }
                }
            }
        }
    });
}

// Update distribution chart when log scale toggle changes
function updateDistributionChart() {
    createDistributionChart();
}

// Success category pie chart
function createSuccessPieChart() {
    const ctx = document.getElementById('successPieChart');
    if (!ctx) return;
    
    if (charts.successPie) charts.successPie.destroy();
    
    const successCounts = {};
    songsData.forEach(song => {
        successCounts[song.success_category] = (successCounts[song.success_category] || 0) + 1;
    });
    
    charts.successPie = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(successCounts),
            datasets: [{
                data: Object.values(successCounts),
                backgroundColor: chartColors.slice(0, 4)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: ${context.raw} songs (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Channel efficiency chart
function createChannelEfficiencyChart() {
    const ctx = document.getElementById('channelEfficiencyChart');
    if (!ctx) return;
    
    if (charts.channelEfficiency) charts.channelEfficiency.destroy();
    
    const channelStats = {};
    songsData.forEach(song => {
        if (!channelStats[song.channel]) {
            channelStats[song.channel] = {
                totalViews: 0,
                totalFollowers: song.channel_follower_count,
                songCount: 0
            };
        }
        channelStats[song.channel].totalViews += song.view_count;
        channelStats[song.channel].songCount++;
    });
    
    const topChannels = Object.entries(channelStats)
        .map(([channel, stats]) => ({
            channel,
            efficiency: stats.totalViews / stats.totalFollowers
        }))
        .sort((a, b) => b.efficiency - a.efficiency)
        .slice(0, 10);
    
    charts.channelEfficiency = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topChannels.map(item => item.channel),
            datasets: [{
                data: topChannels.map(item => item.efficiency),
                backgroundColor: chartColors[2] + 'AA',
                borderColor: chartColors[2],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Views per Follower'
                    }
                }
            }
        }
    });
}

// Duration box plot (simplified as grouped bar chart)
function createDurationBoxChart() {
    const ctx = document.getElementById('durationBoxChart');
    if (!ctx) return;
    
    if (charts.durationBox) charts.durationBox.destroy();
    
    const durationBySuccess = {};
    songsData.forEach(song => {
        if (!durationBySuccess[song.success_category]) {
            durationBySuccess[song.success_category] = [];
        }
        durationBySuccess[song.success_category].push(song.duration);
    });
    
    const avgDurations = {};
    Object.keys(durationBySuccess).forEach(category => {
        const durations = durationBySuccess[category];
        avgDurations[category] = durations.reduce((a, b) => a + b, 0) / durations.length;
    });
    
    charts.durationBox = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(avgDurations),
            datasets: [{
                label: 'Average Duration (seconds)',
                data: Object.values(avgDurations),
                backgroundColor: chartColors[3] + 'AA',
                borderColor: chartColors[3],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Duration (seconds)'
                    }
                }
            }
        }
    });
}

// Correlation heatmap (simplified)
function createCorrelationChart() {
    const ctx = document.getElementById('correlationChart');
    if (!ctx) return;
    
    if (charts.correlation) charts.correlation.destroy();
    
    // Simplified correlation display as a bar chart
    const correlations = [
        { metric: 'Duration vs Views', value: 0.12 },
        { metric: 'Followers vs Views', value: 0.34 },
        { metric: 'Efficiency vs Success', value: 0.67 },
        { metric: 'Genre vs Views', value: 0.23 }
    ];
    
    charts.correlation = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: correlations.map(c => c.metric),
            datasets: [{
                label: 'Correlation Coefficient',
                data: correlations.map(c => c.value),
                backgroundColor: correlations.map((_, i) => chartColors[i % chartColors.length] + 'AA'),
                borderColor: correlations.map((_, i) => chartColors[i % chartColors.length]),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    min: -1,
                    max: 1,
                    title: {
                        display: true,
                        text: 'Correlation (-1 to 1)'
                    }
                }
            }
        }
    });
}

// Genre distribution chart
function createGenreDistChart() {
    const ctx = document.getElementById('genreDistChart');
    if (!ctx) return;
    
    if (charts.genreDist) charts.genreDist.destroy();
    
    const genreCounts = {};
    songsData.forEach(song => {
        genreCounts[song.primary_genre] = (genreCounts[song.primary_genre] || 0) + 1;
    });
    
    charts.genreDist = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(genreCounts),
            datasets: [{
                data: Object.values(genreCounts),
                backgroundColor: chartColors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: ${context.raw} songs (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Genre average views chart
function createGenreViewsChart() {
    const ctx = document.getElementById('genreViewsChart');
    if (!ctx) return;
    
    if (charts.genreViews) charts.genreViews.destroy();
    
    const genreStats = {};
    songsData.forEach(song => {
        if (!genreStats[song.primary_genre]) {
            genreStats[song.primary_genre] = { totalViews: 0, count: 0 };
        }
        genreStats[song.primary_genre].totalViews += song.view_count;
        genreStats[song.primary_genre].count++;
    });
    
    const avgViewsByGenre = Object.entries(genreStats)
        .map(([genre, stats]) => ({
            genre,
            avgViews: stats.totalViews / stats.count
        }))
        .sort((a, b) => b.avgViews - a.avgViews);
    
    charts.genreViews = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: avgViewsByGenre.map(item => item.genre),
            datasets: [{
                data: avgViewsByGenre.map(item => item.avgViews),
                backgroundColor: chartColors[5] + 'AA',
                borderColor: chartColors[5],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Average Views'
                    }
                }
            }
        }
    });
}

// Feature importance chart
function createFeatureImportanceChart() {
    const ctx = document.getElementById('featureImportanceChart');
    if (!ctx) return;
    
    if (charts.featureImportance) charts.featureImportance.destroy();
    
    const features = [
        { feature: 'Duration', importance: 0.549 },
        { feature: 'Channel Followers', importance: 0.252 },
        { feature: 'Is Pop Genre', importance: 0.120 },
        { feature: 'Channel History', importance: 0.079 }
    ];
    
    charts.featureImportance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: features.map(f => f.feature),
            datasets: [{
                data: features.map(f => f.importance),
                backgroundColor: chartColors[6] + 'AA',
                borderColor: chartColors[6],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    max: 1,
                    title: {
                        display: true,
                        text: 'Feature Importance'
                    }
                }
            }
        }
    });
}

// Update key statistics
function updateKeyStats() {
    const totalViews = songsData.reduce((sum, song) => sum + song.view_count, 0);
    const avgViews = totalViews / songsData.length;
    const topSong = songsData.reduce((max, song) => 
        song.view_count > max.view_count ? song : max
    );
    
    const genreCounts = {};
    songsData.forEach(song => {
        genreCounts[song.primary_genre] = (genreCounts[song.primary_genre] || 0) + 1;
    });
    const topGenre = Object.entries(genreCounts)
        .reduce((max, [genre, count]) => count > max.count ? { genre, count } : max, { count: 0 });
    
    document.getElementById('totalSongs').textContent = songsData.length;
    document.getElementById('avgViews').textContent = formatNumber(avgViews);
    document.getElementById('topSong').textContent = topSong.title.split(' - ')[1]?.split(' ')[0] || 'APT.';
    document.getElementById('topGenre').textContent = topGenre.genre.charAt(0).toUpperCase() + topGenre.genre.slice(1);
}

// Populate filter dropdowns
function populateFilters() {
    const genres = [...new Set(songsData.map(song => song.primary_genre))].sort();
    
    const genreFilter = document.getElementById('genreFilter');
    const genreFilterExplorer = document.getElementById('genreFilterExplorer');
    
    genres.forEach(genre => {
        const option1 = new Option(genre.charAt(0).toUpperCase() + genre.slice(1), genre);
        const option2 = new Option(genre.charAt(0).toUpperCase() + genre.slice(1), genre);
        genreFilter.add(option1);
        genreFilterExplorer.add(option2);
    });
}

// Update genre metrics
function updateGenreMetrics() {
    const genreStats = {};
    songsData.forEach(song => {
        if (!genreStats[song.primary_genre]) {
            genreStats[song.primary_genre] = {
                totalViews: 0,
                totalDuration: 0,
                count: 0,
                avgEfficiency: 0
            };
        }
        genreStats[song.primary_genre].totalViews += song.view_count;
        genreStats[song.primary_genre].totalDuration += song.duration;
        genreStats[song.primary_genre].avgEfficiency += song.view_efficiency;
        genreStats[song.primary_genre].count++;
    });
    
    const metricsContainer = document.getElementById('genreMetrics');
    metricsContainer.innerHTML = '';
    
    Object.entries(genreStats).forEach(([genre, stats]) => {
        const avgViews = stats.totalViews / stats.count;
        const avgDuration = stats.totalDuration / stats.count;
        const avgEfficiency = stats.avgEfficiency / stats.count;
        
        const metricDiv = document.createElement('div');
        metricDiv.className = 'genre-metric-item';
        metricDiv.innerHTML = `
            <div class="genre-metric-name">${genre.charAt(0).toUpperCase() + genre.slice(1)}</div>
            <div class="genre-metric-value">${formatNumber(avgViews)} avg views</div>
        `;
        metricsContainer.appendChild(metricDiv);
    });
}

// Update top songs by genre
function updateTopSongsByGenre() {
    const selectedGenre = document.getElementById('genreFilter').value;
    const container = document.getElementById('topSongsByGenre');
    
    let filteredSongs = songsData;
    if (selectedGenre !== 'all') {
        filteredSongs = songsData.filter(song => song.primary_genre === selectedGenre);
    }
    
    const topSongs = filteredSongs
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, 10);
    
    container.innerHTML = '';
    topSongs.forEach(song => {
        const songDiv = document.createElement('div');
        songDiv.className = 'song-item';
        songDiv.innerHTML = `
            <div class="song-info">
                <div class="song-title">${song.title}</div>
                <div class="channel-name">${song.channel}</div>
            </div>
            <div class="song-views">${formatNumber(song.view_count)}</div>
        `;
        container.appendChild(songDiv);
    });
}

// Update prediction inputs display
function updatePredictionInputs() {
    const duration = document.getElementById('durationSlider').value;
    const followers = document.getElementById('followersSlider').value;
    
    document.getElementById('durationValue').textContent = `${duration}s`;
    document.getElementById('followersValue').textContent = formatNumber(followers);
}

// Predict success
function predictSuccess() {
    const duration = parseInt(document.getElementById('durationSlider').value);
    const followers = parseInt(document.getElementById('followersSlider').value);
    const genre = document.getElementById('genreSelect').value;
    
    // Simple prediction model based on the feature importance
    let score = 0;
    
    // Duration factor (0.549 importance)
    if (duration >= 150 && duration <= 250) {
        score += 0.549 * 0.8; // Optimal range
    } else if (duration >= 120 && duration <= 300) {
        score += 0.549 * 0.6; // Good range
    } else {
        score += 0.549 * 0.3; // Suboptimal
    }
    
    // Followers factor (0.252 importance)
    if (followers >= 5000000 && followers <= 30000000) {
        score += 0.252 * 0.9; // Sweet spot
    } else if (followers >= 1000000) {
        score += 0.252 * 0.7; // Good
    } else {
        score += 0.252 * 0.4; // Lower chance
    }
    
    // Genre factor (0.120 importance)
    if (genre === 'pop') {
        score += 0.120;
    } else if (['alternative', 'hip_hop', 'rap'].includes(genre)) {
        score += 0.120 * 0.8;
    } else {
        score += 0.120 * 0.6;
    }
    
    // Random factor for remaining importance
    score += 0.079 * Math.random();
    
    const percentage = Math.min(Math.max(score * 100, 10), 95);
    
    let category, color;
    if (percentage >= 75) {
        category = 'Viral';
        color = 'var(--color-success)';
    } else if (percentage >= 60) {
        category = 'High';
        color = 'var(--color-success)';
    } else if (percentage >= 40) {
        category = 'Medium';
        color = 'var(--color-warning)';
    } else {
        category = 'Low';
        color = 'var(--color-error)';
    }
    
    const resultDiv = document.getElementById('predictionResult');
    resultDiv.innerHTML = `
        <div style="background: rgba(${color.match(/\d+/g).join(', ')}, 0.1); border: 1px solid ${color}; color: ${color}; padding: 12px; border-radius: 8px;">
            <strong>Predicted Success: ${category}</strong><br>
            Probability: ${percentage.toFixed(1)}%
        </div>
    `;
}

// Filter songs
function filterSongs() {
    const searchTerm = document.getElementById('songSearch').value.toLowerCase();
    const successFilter = document.getElementById('successFilter').value;
    const genreFilter = document.getElementById('genreFilterExplorer').value;
    
    filteredSongs = songsData.filter(song => {
        const matchesSearch = song.title.toLowerCase().includes(searchTerm) || 
                            song.channel.toLowerCase().includes(searchTerm);
        const matchesSuccess = successFilter === 'all' || song.success_category === successFilter;
        const matchesGenre = genreFilter === 'all' || song.primary_genre === genreFilter;
        
        return matchesSearch && matchesSuccess && matchesGenre;
    });
    
    updateSongsTable();
}

// Update songs table
function updateSongsTable() {
    const tbody = document.getElementById('songsTableBody');
    tbody.innerHTML = '';
    
    filteredSongs.forEach(song => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="song-title">${song.title}</td>
            <td class="channel-name">${song.channel}</td>
            <td>${formatNumber(song.view_count)}</td>
            <td>${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}</td>
            <td>${song.primary_genre}</td>
            <td><span class="success-badge success-${song.success_category.toLowerCase()}">${song.success_category}</span></td>
            <td>${song.view_efficiency.toFixed(2)}</td>
            <td class="action-buttons">
                <button class="action-btn" onclick="addToComparison('${song.title}')">Compare</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Sort table
let currentSort = { column: '', direction: 'asc' };

function sortTable(column) {
    const direction = currentSort.column === column && currentSort.direction === 'asc' ? 'desc' : 'asc';
    
    filteredSongs.sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];
        
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        
        if (direction === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
    
    currentSort = { column, direction };
    updateSongsTable();
}

// Add song to comparison
function addToComparison(songTitle) {
    const song = songsData.find(s => s.title === songTitle);
    if (song && !comparisonSongs.find(s => s.title === songTitle) && comparisonSongs.length < 3) {
        comparisonSongs.push(song);
        updateComparisonPanel();
    }
}

// Update comparison panel
function updateComparisonPanel() {
    const panel = document.getElementById('comparisonPanel');
    const cards = document.getElementById('comparisonCards');
    
    if (comparisonSongs.length === 0) {
        panel.classList.remove('active');
        return;
    }
    
    panel.classList.add('active');
    cards.innerHTML = '';
    
    comparisonSongs.forEach((song, index) => {
        const card = document.createElement('div');
        card.className = 'comparison-card';
        card.innerHTML = `
            <h4>${song.title}</h4>
            <div class="comparison-metric">
                <span class="comparison-metric-label">Channel:</span>
                <span class="comparison-metric-value">${song.channel}</span>
            </div>
            <div class="comparison-metric">
                <span class="comparison-metric-label">Views:</span>
                <span class="comparison-metric-value">${formatNumber(song.view_count)}</span>
            </div>
            <div class="comparison-metric">
                <span class="comparison-metric-label">Duration:</span>
                <span class="comparison-metric-value">${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}</span>
            </div>
            <div class="comparison-metric">
                <span class="comparison-metric-label">Genre:</span>
                <span class="comparison-metric-value">${song.primary_genre}</span>
            </div>
            <div class="comparison-metric">
                <span class="comparison-metric-label">Success:</span>
                <span class="comparison-metric-value">${song.success_category}</span>
            </div>
            <div class="comparison-metric">
                <span class="comparison-metric-label">Efficiency:</span>
                <span class="comparison-metric-value">${song.view_efficiency.toFixed(2)}</span>
            </div>
        `;
        cards.appendChild(card);
    });
}

// Clear comparison
function clearComparison() {
    comparisonSongs = [];
    updateComparisonPanel();
}

// Export data
function exportData() {
    const csv = convertToCSV(filteredSongs);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'youtube-top-songs-filtered.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Utility functions
function formatNumber(num) {
    if (num >= 1e9) {
        return (num / 1e9).toFixed(1) + 'B';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(1) + 'M';
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(1) + 'K';
    }
    return num.toString();
}

function createHistogramBins(data, binCount) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binSize = (max - min) / binCount;
    
    const bins = [];
    for (let i = 0; i < binCount; i++) {
        const start = min + i * binSize;
        const end = start + binSize;
        const count = data.filter(val => val >= start && (i === binCount - 1 ? val <= end : val < end)).length;
        bins.push({ start, end, count });
    }
    
    return bins;
}

function convertToCSV(data) {
    const headers = ['Title', 'Channel', 'View Count', 'Duration', 'Genre', 'Success Category', 'View Efficiency'];
    const rows = data.map(song => [
        song.title,
        song.channel,
        song.view_count,
        song.duration,
        song.primary_genre,
        song.success_category,
        song.view_efficiency
    ]);
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            initializeCharts();
            updateKeyStats();
        }, 100);
    });
} else {
    setTimeout(() => {
        initializeCharts();
        updateKeyStats();
    }, 100);
}