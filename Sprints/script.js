class SprintDashboard {
    constructor() {
        this.sprints = [];
        this.currentSprint = null;
        this.sprintData = {};
        this.sprintReports = {};
        this.reportCache = {};
        this.loadingStates = {};
        this.currentTheme = this.getStoredTheme();
        this.charts = {};
        this.currentChartTab = 'overview';
        this.init();
    }

    async init() {
        this.initializeTheme();
        await this.loadSprintIndex();
        await this.loadAllSprintData();
        await this.checkSprintReports();
        this.renderNavigation();
    }

    async loadSprintIndex() {
        if (this.loadingStates.index) return;
        this.loadingStates.index = true;
        
        try {
            const response = await fetch('./Data/index.json', {
                cache: 'no-cache'
            });
            this.sprints = await response.json();
        } catch (error) {
            console.error('Không thể tải danh sách sprint:', error);
        } finally {
            this.loadingStates.index = false;
        }
    }

    async loadAllSprintData() {
        const loadPromises = this.sprints.map(async (sprintFile) => {
            try {
                const response = await fetch(`./Data/${sprintFile}`, {
                    cache: 'no-cache'
                });
                const data = await response.json();
                const sprintName = sprintFile.replace('.json', '');
                this.sprintData[sprintName] = data;
            } catch (error) {
                console.error(`Không thể tải dữ liệu sprint ${sprintFile}:`, error);
            }
        });

        // Chờ tất cả requests hoàn thành song song
        await Promise.all(loadPromises);
    }

    async checkSprintReports() {
        const checkPromises = this.sprints.map(async (sprintFile) => {
            const sprintName = sprintFile.replace('.json', '');
            const reportFile = `./Data/${sprintName}..md`;
            
            try {
                const response = await fetch(reportFile, {
                    cache: 'no-cache'
                });
                this.sprintReports[sprintName] = response.ok;
            } catch (error) {
                // Report doesn't exist, that's okay
                this.sprintReports[sprintName] = false;
            }
        });

        // Chờ tất cả checks hoàn thành song song
        await Promise.all(checkPromises);
    }

    isSprintPast(startDate, duration) {
        const sprintStart = new Date(startDate);
        const sprintEnd = new Date(sprintStart);
        sprintEnd.setDate(sprintStart.getDate() + duration);
        const today = new Date();
        return today > sprintEnd;
    }

    renderNavigation() {
        const navContainer = document.getElementById('sprint-navigation');
        
        if (this.sprints.length === 0) {
            navContainer.innerHTML = '<div class="empty-state">Không có sprint nào</div>';
            return;
        }

        const navHTML = this.sprints.map(sprintFile => {
            const sprintName = sprintFile.replace('.json', '');
            const sprintData = this.sprintData[sprintName] || [];
            const startDate = sprintData.length > 0 ? sprintData[0].sprint.startDate : 'N/A';
            const duration = sprintData.length > 0 ? sprintData[0].sprint.duration : 0;
            const hasReport = this.sprintReports[sprintName];
            const isPast = startDate !== 'N/A' ? this.isSprintPast(startDate, duration) : false;
            
            const reportButton = hasReport ? 
                `<div class="report-button" onclick="event.stopPropagation(); dashboard.openReportModal('${sprintName}')">
                    📊 Xem báo cáo
                </div>` : '';
            
            return `
                <div class="sprint-nav-item ${isPast ? 'past' : ''}" onclick="dashboard.selectSprint('${sprintName}')">
                    <h3>Sprint ${sprintName.split('-').slice(1).join('-')} ${isPast ? '(Đã kết thúc)' : ''}</h3>
                    <p>📅 ${startDate} • ⏰ ${duration} ngày • 📋 ${sprintData.length} items</p>
                    ${reportButton}
                </div>
            `;
        }).join('');

        navContainer.innerHTML = navHTML;
    }

    selectSprint(sprintName) {
        // Remove active class from all nav items
        document.querySelectorAll('.sprint-nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to selected item
        event.target.closest('.sprint-nav-item').classList.add('active');

        this.currentSprint = sprintName;
        this.renderSprintContent();
    }

    switchChartTab(tabName) {
        // Remove active class from all tabs
        document.querySelectorAll('.chart-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Hide all tab contents
        document.querySelectorAll('.chart-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Show selected tab
        document.querySelector(`[onclick="dashboard.switchChartTab('${tabName}')"]`).classList.add('active');
        document.getElementById(`${tabName}-charts`).classList.add('active');
        
        this.currentChartTab = tabName;
        
        // Re-render charts for the current tab
        if (this.currentSprint) {
            this.renderCharts(this.sprintData[this.currentSprint]);
        }
    }

    renderSprintContent() {
        if (!this.currentSprint) return;

        const sprintData = this.sprintData[this.currentSprint] || [];
        const startDate = sprintData.length > 0 ? sprintData[0].sprint.startDate : 'N/A';
        const duration = sprintData.length > 0 ? sprintData[0].sprint.duration : 0;

        // Update header
        document.getElementById('sprint-title').textContent = `Sprint ${this.currentSprint.split('-').slice(1).join('-')}`;
        document.getElementById('sprint-subtitle').textContent = `Bắt đầu: ${startDate} • Thời gian: ${duration} ngày`;

        // Calculate stats
        const totalItems = sprintData.length;
        const openItems = sprintData.filter(item => item.content.state === 'OPEN').length;
        const closedItems = sprintData.filter(item => item.content.state === 'CLOSED').length;
        const completionRate = totalItems > 0 ? Math.round((closedItems / totalItems) * 100) : 0;
        
        // Calculate repository breakdown
        const repoStats = {};
        sprintData.forEach(item => {
            const repoName = item.content.url.split('/')[4]; // Extract repo name from URL
            if (!repoStats[repoName]) {
                repoStats[repoName] = { total: 0, closed: 0 };
            }
            repoStats[repoName].total++;
            if (item.content.state === 'CLOSED') {
                repoStats[repoName].closed++;
            }
        });

        // Calculate author breakdown
        const authorStats = {};
        sprintData.forEach(item => {
            const author = item.content.author.login;
            if (!authorStats[author]) {
                authorStats[author] = { total: 0, closed: 0 };
            }
            authorStats[author].total++;
            if (item.content.state === 'CLOSED') {
                authorStats[author].closed++;
            }
        });

        // Render main stats
        const statsHTML = this.renderMainStats(totalItems, closedItems, openItems, completionRate, repoStats, authorStats);
        
        // Create detailed breakdown
        const detailedStatsHTML = this.renderDetailedStats(repoStats, authorStats, sprintData);

        document.getElementById('sprint-stats').innerHTML = statsHTML + detailedStatsHTML;
        document.getElementById('sprint-stats').style.display = 'block';

        // Show charts section
        document.getElementById('charts-section').style.display = 'block';
        
        // Render charts
        this.renderCharts(sprintData);

        // Render sprint items
        if (sprintData.length === 0) {
            document.getElementById('sprint-content').innerHTML = 
                '<div class="empty-state">Sprint này không có items nào</div>';
            document.getElementById('charts-section').style.display = 'none';
            return;
        }

        const itemsHTML = this.renderSprintItems(sprintData);
        document.getElementById('sprint-content').innerHTML = 
            `<div class="sprint-items-grid">${itemsHTML}</div>`;
    }

    renderMainStats(totalItems, closedItems, openItems, completionRate, repoStats, authorStats) {
        return `
            <div class="main-stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${totalItems}</div>
                    <div class="stat-label">Tổng Tickets</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${closedItems}</div>
                    <div class="stat-label">Hoàn Thành</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${openItems}</div>
                    <div class="stat-label">Đang Làm</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${completionRate}%</div>
                    <div class="stat-label">Tỷ Lệ Hoàn Thành</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${Object.keys(repoStats).length}</div>
                    <div class="stat-label">Repositories</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${Object.keys(authorStats).length}</div>
                    <div class="stat-label">Contributors</div>
                </div>
            </div>
        `;
    }

    renderDetailedStats(repoStats, authorStats, sprintData) {
        const repoBreakdownHTML = Object.entries(repoStats)
            .sort(([,a], [,b]) => b.total - a.total)
            .map(([repo, stats]) => {
                const repoCompletion = stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0;
                return `
                    <div class="breakdown-item">
                        <div class="breakdown-header">
                            <span class="breakdown-name">📁 ${repo}</span>
                            <span class="breakdown-completion">${repoCompletion}%</span>
                        </div>
                        <div class="breakdown-bar">
                            <div class="breakdown-progress" style="width: ${repoCompletion}%"></div>
                        </div>
                        <div class="breakdown-details">${stats.closed}/${stats.total} tickets hoàn thành</div>
                    </div>
                `;
            }).join('');

        // Get author avatars
        const authorAvatars = {};
        sprintData.forEach(item => {
            const author = item.content.author.login;
            if (!authorAvatars[author]) {
                authorAvatars[author] = item.content.author.avatarUrl;
            }
        });

        const authorBreakdownHTML = Object.entries(authorStats)
            .sort(([,a], [,b]) => b.total - a.total)
            .map(([author, stats]) => {
                const authorCompletion = stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0;
                const avatarUrl = authorAvatars[author];
                return `
                    <div class="breakdown-item">
                        <div class="breakdown-header">
                            <div class="author-with-avatar">
                                <img src="${avatarUrl}" alt="${author}" class="avatar" onerror="this.style.display='none'">
                                <span class="breakdown-name">${author}</span>
                            </div>
                            <span class="breakdown-completion">${authorCompletion}%</span>
                        </div>
                        <div class="breakdown-bar">
                            <div class="breakdown-progress" style="width: ${authorCompletion}%"></div>
                        </div>
                        <div class="breakdown-details">${stats.closed}/${stats.total} tickets hoàn thành</div>
                    </div>
                `;
            }).join('');

        return `
            <div class="detailed-stats">
                <div class="breakdown-section">
                    <h3 class="breakdown-title">Thống kê theo Repository</h3>
                    ${repoBreakdownHTML}
                </div>
                <div class="breakdown-section">
                    <h3 class="breakdown-title">Thống kê theo Contributor</h3>
                    ${authorBreakdownHTML}
                </div>
            </div>
        `;
    }

    renderSprintItems(sprintData) {
        return sprintData.map(item => `
            <div class="sprint-item" onclick="window.open('${item.content.url}', '_blank')">
                <div class="item-header">
                    <div>
                        <h3 class="item-title">${item.content.title}</h3>
                        <a href="${item.content.url}" target="_blank" class="item-url" onclick="event.stopPropagation()">
                            🔗 Issue #${item.content.number}
                        </a>
                    </div>
                    <span class="item-number">#${item.content.number}</span>
                </div>
                
                <div class="item-meta">
                    <div class="item-author">
                        <img src="${item.content.author.avatarUrl}" alt="${item.content.author.login}" class="avatar" onerror="this.style.display='none'">
                        <span>${item.content.author.login}</span>
                    </div>
                    <span class="item-state ${item.content.state.toLowerCase()}">${item.content.state}</span>
                </div>
            </div>
        `).join('');
    }

    // Chart Methods
    renderCharts(sprintData) {
        // Destroy existing charts to avoid memory leaks
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};

        if (this.currentChartTab === 'overview') {
            this.renderOverviewCharts(sprintData);
        } else if (this.currentChartTab === 'progress') {
            this.renderProgressCharts(sprintData);
        } else if (this.currentChartTab === 'prediction') {
            this.renderPredictionCharts(sprintData);
        }
    }

    renderOverviewCharts(sprintData) {
        this.createCompletionChart(sprintData);
        this.createContributorChart(sprintData);
        this.createRepositoryChart(sprintData);
        this.createStatusChart(sprintData);
    }

    renderProgressCharts(sprintData) {
        this.createProgressChart(sprintData);
    }

    renderPredictionCharts(sprintData) {
        this.createPredictionChart(sprintData);
        this.createVelocityChart(sprintData);
    }

    createCompletionChart(sprintData) {
        const ctx = document.getElementById('completionChart').getContext('2d');
        const closed = sprintData.filter(item => item.content.state === 'CLOSED').length;
        const open = sprintData.filter(item => item.content.state === 'OPEN').length;
        
        this.charts.completion = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Hoàn thành', 'Đang làm'],
                datasets: [{
                    data: [closed, open],
                    backgroundColor: ['#4fc3f7', '#ff7043'],
                    borderColor: ['#29b6f6', '#ff5722'],
                    borderWidth: 2,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: this.currentTheme === 'light' ? '#212529' : '#ffffff',
                            font: { size: 12 },
                            padding: 15
                        }
                    }
                }
            }
        });
    }

    createContributorChart(sprintData) {
        const ctx = document.getElementById('contributorChart').getContext('2d');
        const contributorStats = {};
        
        sprintData.forEach(item => {
            const author = item.content.author.login;
            if (!contributorStats[author]) {
                contributorStats[author] = { total: 0, closed: 0 };
            }
            contributorStats[author].total++;
            if (item.content.state === 'CLOSED') {
                contributorStats[author].closed++;
            }
        });

        const authors = Object.keys(contributorStats);
        const colors = ['#4fc3f7', '#66bb6a', '#ffca28', '#ef5350', '#ab47bc', '#26a69a'];
        
        this.charts.contributor = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: authors,
                datasets: [
                    {
                        label: 'Hoàn thành',
                        data: authors.map(author => contributorStats[author].closed),
                        backgroundColor: colors.slice(0, authors.length),
                        borderColor: colors.slice(0, authors.length),
                        borderWidth: 1
                    },
                    {
                        label: 'Tổng số',
                        data: authors.map(author => contributorStats[author].total),
                        backgroundColor: colors.slice(0, authors.length).map(color => color + '40'),
                        borderColor: colors.slice(0, authors.length),
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: this.currentTheme === 'light' ? '#212529' : '#ffffff',
                            font: { size: 12 }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: this.currentTheme === 'light' ? '#212529' : '#ffffff'
                        },
                        grid: {
                            color: this.currentTheme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: this.currentTheme === 'light' ? '#212529' : '#ffffff'
                        },
                        grid: {
                            color: this.currentTheme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'
                        }
                    }
                }
            }
        });
    }

    createRepositoryChart(sprintData) {
        const ctx = document.getElementById('repositoryChart').getContext('2d');
        const repoStats = {};
        
        sprintData.forEach(item => {
            const repoName = item.content.url.split('/')[4];
            if (!repoStats[repoName]) {
                repoStats[repoName] = 0;
            }
            repoStats[repoName]++;
        });

        const repos = Object.keys(repoStats);
        const colors = ['#4fc3f7', '#66bb6a', '#ffca28', '#ef5350', '#ab47bc'];
        
        this.charts.repository = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: repos.map(repo => repo.length > 15 ? repo.substring(0, 15) + '...' : repo),
                datasets: [{
                    data: Object.values(repoStats),
                    backgroundColor: colors.slice(0, repos.length),
                    borderColor: colors.slice(0, repos.length),
                    borderWidth: 2,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: this.currentTheme === 'light' ? '#212529' : '#ffffff',
                            font: { size: 10 },
                            padding: 10
                        }
                    }
                }
            }
        });
    }

    createStatusChart(sprintData) {
        const ctx = document.getElementById('statusChart').getContext('2d');
        const openCount = sprintData.filter(item => item.content.state === 'OPEN').length;
        const closedCount = sprintData.filter(item => item.content.state === 'CLOSED').length;
        
        this.charts.status = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['OPEN', 'CLOSED'],
                datasets: [{
                    label: 'Số lượng',
                    data: [openCount, closedCount],
                    backgroundColor: ['#ff7043', '#4fc3f7'],
                    borderColor: ['#ff5722', '#29b6f6'],
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: this.currentTheme === 'light' ? '#212529' : '#ffffff',
                            stepSize: 1
                        },
                        grid: {
                            color: this.currentTheme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: this.currentTheme === 'light' ? '#212529' : '#ffffff'
                        },
                        grid: {
                            color: this.currentTheme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'
                        }
                    }
                }
            }
        });
    }

    createProgressChart(sprintData) {
        const ctx = document.getElementById('progressChart').getContext('2d');
        
        if (sprintData.length === 0) return;
        
        const startDate = new Date(sprintData[0].sprint.startDate);
        const duration = sprintData[0].sprint.duration;
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + duration);
        
        // Generate daily progress data (simulated)
        const progressData = this.generateProgressData(sprintData, startDate, endDate);
        
        this.charts.progress = new Chart(ctx, {
            type: 'line',
            data: {
                labels: progressData.labels,
                datasets: [
                    {
                        label: 'Tasks hoàn thành',
                        data: progressData.completed,
                        borderColor: '#4fc3f7',
                        backgroundColor: 'rgba(79, 195, 247, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Mục tiêu lý tưởng',
                        data: progressData.ideal,
                        borderColor: '#66bb6a',
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: this.currentTheme === 'light' ? '#212529' : '#ffffff',
                            font: { size: 12 }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: sprintData.length,
                        ticks: {
                            color: this.currentTheme === 'light' ? '#212529' : '#ffffff',
                            stepSize: 1
                        },
                        grid: {
                            color: this.currentTheme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: this.currentTheme === 'light' ? '#212529' : '#ffffff'
                        },
                        grid: {
                            color: this.currentTheme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'
                        }
                    }
                }
            }
        });
    }

    createPredictionChart(sprintData) {
        const ctx = document.getElementById('predictionChart').getContext('2d');
        
        const prediction = this.calculateSprintPrediction(sprintData);
        
        // Add prediction panel
        const container = ctx.canvas.parentElement;
        let predictionPanel = container.querySelector('.prediction-panel');
        if (!predictionPanel) {
            predictionPanel = document.createElement('div');
            predictionPanel.className = 'prediction-panel';
            container.appendChild(predictionPanel);
        }
        
        predictionPanel.innerHTML = `
            <div class="prediction-title">🔮 Dự đoán Sprint</div>
            <div class="prediction-content">
                <div class="prediction-metric">
                    <span>Khả năng hoàn thành:</span>
                    <span class="prediction-metric-value">${prediction.completionProbability}%</span>
                </div>
                <div class="prediction-metric">
                    <span>Ngày dự kiến hoàn thành:</span>
                    <span class="prediction-metric-value">${prediction.estimatedCompletion}</span>
                </div>
                <div class="prediction-metric">
                    <span>Velocity hiện tại:</span>
                    <span class="prediction-metric-value">${prediction.currentVelocity} tasks/ngày</span>
                </div>
                <div class="prediction-metric">
                    <span>Tình trạng:</span>
                    <span class="prediction-metric-value">${prediction.status}</span>
                </div>
            </div>
        `;
        
        this.charts.prediction = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Hoàn thành', 'Tiến độ', 'Chất lượng', 'Hiệu suất', 'Rủi ro'],
                datasets: [{
                    label: 'Sprint hiện tại',
                    data: [
                        prediction.completionScore,
                        prediction.progressScore,
                        prediction.qualityScore,
                        prediction.performanceScore,
                        100 - prediction.riskScore
                    ],
                    borderColor: '#4fc3f7',
                    backgroundColor: 'rgba(79, 195, 247, 0.2)',
                    pointBackgroundColor: '#4fc3f7',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: this.currentTheme === 'light' ? '#212529' : '#ffffff',
                            font: { size: 12 }
                        }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: this.currentTheme === 'light' ? '#212529' : '#ffffff',
                            backdropColor: 'transparent'
                        },
                        grid: {
                            color: this.currentTheme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'
                        },
                        angleLines: {
                            color: this.currentTheme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'
                        },
                        pointLabels: {
                            color: this.currentTheme === 'light' ? '#212529' : '#ffffff',
                            font: { size: 11 }
                        }
                    }
                }
            }
        });
    }

    createVelocityChart(sprintData) {
        const ctx = document.getElementById('velocityChart').getContext('2d');
        
        // Generate velocity data (simulated historical data)
        const velocityData = this.generateVelocityData(sprintData);
        
        this.charts.velocity = new Chart(ctx, {
            type: 'line',
            data: {
                labels: velocityData.labels,
                datasets: [
                    {
                        label: 'Velocity (tasks/sprint)',
                        data: velocityData.velocity,
                        borderColor: '#66bb6a',
                        backgroundColor: 'rgba(102, 187, 106, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    },
                    {
                        label: 'Mục tiêu',
                        data: velocityData.target,
                        borderColor: '#ffca28',
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: this.currentTheme === 'light' ? '#212529' : '#ffffff',
                            font: { size: 12 }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: this.currentTheme === 'light' ? '#212529' : '#ffffff'
                        },
                        grid: {
                            color: this.currentTheme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: this.currentTheme === 'light' ? '#212529' : '#ffffff'
                        },
                        grid: {
                            color: this.currentTheme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'
                        }
                    }
                }
            }
        });
    }

    // Helper methods for calculations
    generateProgressData(sprintData, startDate, endDate) {
        const totalTasks = sprintData.length;
        const completedTasks = sprintData.filter(item => item.content.state === 'CLOSED').length;
        const today = new Date();
        
        const labels = [];
        const completed = [];
        const ideal = [];
        
        const currentDate = new Date(startDate);
        let day = 0;
        
        while (currentDate <= endDate && day <= 14) {
            const dateStr = `${currentDate.getDate()}/${currentDate.getMonth() + 1}`;
            labels.push(dateStr);
            
            // Simulate daily progress (actual data would come from git history)
            if (currentDate <= today) {
                const progress = Math.min(
                    Math.floor((day / 14) * completedTasks * (0.8 + Math.random() * 0.4)), 
                    completedTasks
                );
                completed.push(progress);
            } else {
                completed.push(null);
            }
            
            // Ideal linear progress
            ideal.push(Math.floor((day / 14) * totalTasks));
            
            currentDate.setDate(currentDate.getDate() + 1);
            day++;
        }
        
        return { labels, completed, ideal };
    }

    calculateSprintPrediction(sprintData) {
        const totalTasks = sprintData.length;
        const completedTasks = sprintData.filter(item => item.content.state === 'CLOSED').length;
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        const startDate = new Date(sprintData.length > 0 ? sprintData[0].sprint.startDate : Date.now());
        const duration = sprintData.length > 0 ? sprintData[0].sprint.duration : 14;
        const today = new Date();
        const daysElapsed = Math.max(1, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));
        const daysRemaining = Math.max(0, duration - daysElapsed);
        
        const currentVelocity = daysElapsed > 0 ? (completedTasks / daysElapsed).toFixed(1) : 0;
        const requiredVelocity = daysRemaining > 0 ? ((totalTasks - completedTasks) / daysRemaining).toFixed(1) : 0;
        
        // Calculate prediction scores
        const completionScore = Math.min(100, completionRate * 1.2);
        const progressScore = Math.min(100, (daysElapsed / duration) * completionRate * 1.5);
        const qualityScore = 85; // Simulated
        const performanceScore = Math.min(100, (currentVelocity / (requiredVelocity || 1)) * 80);
        const riskScore = Math.max(0, 100 - completionScore - (daysRemaining / duration) * 50);
        
        // Estimate completion
        let completionProbability;
        let estimatedCompletion;
        let status;
        
        if (currentVelocity >= requiredVelocity) {
            completionProbability = Math.min(95, 70 + (currentVelocity / requiredVelocity) * 20);
            const estimatedDays = Math.ceil((totalTasks - completedTasks) / currentVelocity);
            const estimated = new Date(today);
            estimated.setDate(today.getDate() + estimatedDays);
            estimatedCompletion = `${estimated.getDate()}/${estimated.getMonth() + 1}/${estimated.getFullYear()}`;
            status = completionProbability > 80 ? '🟢 Đúng hạn' : '🟡 Có thể trễ';
        } else {
            completionProbability = Math.max(30, 70 * (currentVelocity / requiredVelocity));
            estimatedCompletion = 'Sau deadline';
            status = '🔴 Có rủi ro';
        }
        
        return {
            completionProbability: Math.round(completionProbability),
            estimatedCompletion,
            currentVelocity,
            status,
            completionScore: Math.round(completionScore),
            progressScore: Math.round(progressScore),
            qualityScore,
            performanceScore: Math.round(performanceScore),
            riskScore: Math.round(riskScore)
        };
    }

    generateVelocityData(sprintData) {
        // Simulate historical velocity data
        const currentSprint = this.currentSprint.split('-').slice(1).join('-');
        const sprintNumber = parseInt(currentSprint.split('-')[2]) || 7;
        
        const labels = [];
        const velocity = [];
        const target = [];
        
        for (let i = Math.max(1, sprintNumber - 4); i <= sprintNumber; i++) {
            labels.push(`Sprint ${i}`);
            
            if (i === sprintNumber) {
                // Current sprint
                velocity.push(sprintData.filter(item => item.content.state === 'CLOSED').length);
            } else {
                // Simulated historical data
                velocity.push(Math.floor(8 + Math.random() * 6));
            }
            
            target.push(10); // Target velocity
        }
        
        return { labels, velocity, target };
    }

    async openReportModal(sprintName) {
        const modal = document.getElementById('reportModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = `📊 Báo cáo Sprint ${sprintName.split('-').slice(1).join('-')}`;
        modalBody.innerHTML = '<div class="loading">Đang tải báo cáo...</div>';
        modal.style.display = 'block';
        
        try {
            const response = await fetch(`./Data/${sprintName}..md`, {
                cache: 'no-cache'
            });
            if (response.ok) {
                const markdownContent = await response.text();
                const htmlContent = this.markdownToHtml(markdownContent);
                modalBody.innerHTML = htmlContent;
            } else {
                modalBody.innerHTML = '<div class="empty-state">❌ Không tìm thấy báo cáo cho sprint này</div>';
            }
        } catch (error) {
            modalBody.innerHTML = '<div class="empty-state">❌ Lỗi khi tải báo cáo</div>';
            console.error('Error loading report:', error);
        }
    }

    closeReportModal() {
        const modal = document.getElementById('reportModal');
        modal.style.display = 'none';
    }

    markdownToHtml(markdown) {
        // Simple markdown to HTML converter
        // First, split by double line breaks to preserve paragraphs
        const paragraphs = markdown.split(/\n\s*\n/);
        
        let processedParagraphs = paragraphs.map(paragraph => {
            let html = paragraph
                // Headers
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                // Bold
                .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                // Italic
                .replace(/\*(.*?)\*/gim, '<em>$1</em>')
                // Code blocks
                .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
                // Inline code
                .replace(/`([^`]*)`/gim, '<code>$1</code>')
                // Links
                .replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2" target="_blank">$1</a>')
                // Single line breaks become <br/>
                .replace(/\n/gim, '<br/>');
            
            return html;
        }).join('</p><p>');

        // Handle tables separately
        const lines = processedParagraphs.split('</p><p>');
        let finalLines = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (line.includes('|') && !line.includes('<h') && !line.includes('<pre')) {
                // This might be a table
                const tableLines = line.split('<br/>');
                let tableHTML = '<table><tbody>';
                let isFirstRow = true;
                
                for (const tableLine of tableLines) {
                    if (tableLine.includes('|') && !tableLine.includes('---')) {
                        const cells = tableLine.split('|').map(cell => cell.trim()).filter(cell => cell);
                        if (cells.length > 0) {
                            const tag = isFirstRow ? 'th' : 'td';
                            tableHTML += '<tr>';
                            cells.forEach(cell => {
                                tableHTML += `<${tag}>${cell}</${tag}>`;
                            });
                            tableHTML += '</tr>';
                            if (isFirstRow) {
                                isFirstRow = false;
                                tableHTML = tableHTML.replace('<tbody>', '</thead><tbody>').replace('<table><tbody>', '<table><thead>');
                            }
                        }
                    }
                }
                tableHTML += '</tbody></table>';
                finalLines.push(tableHTML);
            } else {
                // Regular content
                if (line.trim() && !line.startsWith('<h') && !line.startsWith('<table') && !line.startsWith('<pre')) {
                    finalLines.push(`<p>${line}</p>`);
                } else {
                    finalLines.push(line);
                }
            }
        }

        return finalLines.join('');
    }

    // Theme Management
    getStoredTheme() {
        return localStorage.getItem('sprint-dashboard-theme') || 'dark';
    }

    setStoredTheme(theme) {
        localStorage.setItem('sprint-dashboard-theme', theme);
    }

    initializeTheme() {
        document.body.className = this.currentTheme === 'light' ? 'light-theme' : '';
        this.updateThemeToggle();
    }

    updateThemeToggle() {
        const themeIcon = document.getElementById('themeIcon');
        const themeText = document.getElementById('themeText');
        
        if (this.currentTheme === 'light') {
            themeIcon.src = 'https://cdn-icons-png.flaticon.com/128/12180/12180746.png';
            themeIcon.alt = 'Light theme';
            themeText.textContent = 'Light';
        } else {
            themeIcon.src = 'https://cdn-icons-png.flaticon.com/128/12180/12180668.png';
            themeIcon.alt = 'Dark theme';
            themeText.textContent = 'Dark';
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setStoredTheme(this.currentTheme);
        
        // Apply theme to body
        if (this.currentTheme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
        
        this.updateThemeToggle();
        
        // Re-render charts with new theme colors
        if (this.currentSprint && this.sprintData[this.currentSprint]) {
            this.renderCharts(this.sprintData[this.currentSprint]);
        }
    }
}

// Initialize dashboard
const dashboard = new SprintDashboard();

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('reportModal');
    if (event.target === modal) {
        dashboard.closeReportModal();
    }
} 