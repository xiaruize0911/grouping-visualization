// ==================== 核心算法实现 ====================

/**
 * 基本模型：计算连续分组的方案数
 * 公式：2^(n-1)
 */
function countGroupingsDP(n) {
    if (n === 0) return 1;
    let dp = Array(n + 1).fill(0);
    dp[0] = 1;
    for (let i = 1; i <= n; i++) {
        for (let j = 0; j < i; j++) {
            dp[i] += dp[j];
        }
    }
    return dp[n];
}

/**
 * 生成所有基本分组方案（连续学号分组）
 * 例如：4个学生 [1,2,3,4]
 * 方案1: {{1,2,3,4}}
 * 方案2: {{1,2,3},{4}}
 * 方案3: {{1,2},{3,4}}
 * 等等...
 */
function generateGroupings(n) {
    const groupings = [];

    // 使用二进制表示：在n-1个位置中，每个位置可以"分开"(1)或"不分开"(0)
    // 总共有 2^(n-1) 种方案
    const totalSchemes = Math.pow(2, n - 1);

    for (let scheme = 0; scheme < totalSchemes; scheme++) {
        const grouping = [];
        let currentGroup = [1];

        // 检查每个分割点
        for (let i = 1; i < n; i++) {
            // 检查第i个位置是否需要分割
            if ((scheme & (1 << (i - 1))) !== 0) {
                // 分割：将当前组保存，开始新组
                grouping.push([...currentGroup]);
                currentGroup = [i + 1];
            } else {
                // 不分割：继续添加到当前组
                currentGroup.push(i + 1);
            }
        }
        // 添加最后一个组
        grouping.push(currentGroup);

        groupings.push(grouping);
    }

    return groupings;
}

/**
 * 限制小组大小的分组方案数
 */
function countGroupingsLimited(n, minSize, maxSize) {
    let dp = Array(n + 1).fill(0);
    dp[0] = 1;

    for (let i = 1; i <= n; i++) {
        for (let j = 0; j < i; j++) {
            const lastGroupSize = i - j;
            if (lastGroupSize >= minSize && lastGroupSize <= maxSize) {
                dp[i] += dp[j];
            }
        }
    }
    return dp[n];
}

/**
 * 固定某些学生在同一小组的方案数
 * 公式：2^(n-k)，其中k为固定同组的学生数
 */
function countGroupingsFixedTogether(n, k) {
    if (k > n) return 0;
    // 将k个学生看作1个整体，剩余n-k+1个单位
    return Math.pow(2, n - k);
}

/**
 * 计算指定小组数量的分组方案数（使用第二类 Stirling 数）
 */
function countGroupingsFixedCount(n, k) {
    if (k > n || k === 0) return 0;
    if (k === 1 || k === n) return 1;

    // 使用动态规划计算第二类 Stirling 数
    let S = Array(n + 1).fill(null).map(() => Array(k + 1).fill(0));

    S[0][0] = 1;

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= Math.min(i, k); j++) {
            S[i][j] = j * S[i - 1][j] + S[i - 1][j - 1];
        }
    }

    return S[n][k];
}

/**
 * 计算 Bell 数（任意组合分组）
 * 使用 Bell 三角形方法
 */
function bellNumber(n) {
    if (n === 0) return 1;

    let bell = Array(n + 1).fill(null).map(() => Array(n + 1).fill(0));
    bell[0][0] = 1;

    for (let i = 1; i <= n; i++) {
        bell[i][0] = bell[i - 1][i - 1];
        for (let j = 1; j <= i; j++) {
            bell[i][j] = bell[i][j - 1] + bell[i - 1][j - 1];
        }
    }

    return bell[n][0];
}

/**
 * 生成所有 Bell 分组（任意组合）
 */
function generateBellGroupings(n) {
    const groupings = [];

    function generate(current, index) {
        if (index === n) {
            groupings.push(JSON.parse(JSON.stringify(current)));
            return;
        }

        // 添加到现有分组
        for (let i = 0; i < current.length; i++) {
            current[i].push(index + 1);
            generate(current, index + 1);
            current[i].pop();
        }

        // 创建新分组
        current.push([index + 1]);
        generate(current, index + 1);
        current.pop();
    }

    generate([], 0);
    return groupings;
}

// ==================== UI 交互逻辑 ====================

/**
 * 可视化基本分组
 */
function visualizeBasicGrouping() {
    const n = parseInt(document.getElementById('basicStudents').value);
    const visualization = document.getElementById('basicVisualization');
    const results = document.getElementById('basicResults');

    if (n === 0) {
        visualization.innerHTML = '请选择学生人数';
        return;
    }

    const groupings = generateGroupings(n);
    const count = groupings.length;

    // 显示可视化
    visualization.innerHTML = '';

    // 创建标题
    const title = document.createElement('div');
    title.style.width = '100%';
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';
    title.style.fontSize = '1.1em';
    title.style.fontWeight = 'bold';
    title.style.color = '#764ba2';
    title.textContent = `${n} 个学生的所有分组方案（共 ${count} 种）`;
    visualization.appendChild(title);

    // 只显示前8个方案
    const displayCount = groupings.length;
    for (let i = 0; i < displayCount; i++) {
        const grouping = groupings[i];
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.gap = '8px';
        div.style.alignItems = 'center';
        div.style.marginBottom = '15px';
        div.style.flexWrap = 'wrap';
        div.style.width = '100%';

        // 添加方案编号
        const numberLabel = document.createElement('span');
        numberLabel.style.minWidth = '40px';
        numberLabel.style.fontWeight = 'bold';
        numberLabel.style.color = '#667eea';
        numberLabel.textContent = `${i + 1}.`;
        div.appendChild(numberLabel);

        // 添加分组
        grouping.forEach((group, idx) => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'group';
            groupDiv.style.minWidth = 'auto';
            let html = '';
            group.forEach(student => {
                html += `<span class="student">${student}</span>`;
            });
            groupDiv.innerHTML = html;
            div.appendChild(groupDiv);
        });

        visualization.appendChild(div);
    }

    // 显示结果
    results.innerHTML = `
        <div class="result-box">
            <strong>📊 分组统计：</strong><br>
            <strong>学生人数：</strong> ${n} 人<br>
            <strong>总方案数：</strong> ${count} 种<br>
            <strong>公式验证：</strong> \\(2^{${n}-1} = 2^{${n - 1}} = ${Math.pow(2, n - 1)}\\)<br>
            <strong>显示方案：</strong> 前 ${displayCount} 个方案（共 ${count} 个方案）<br>
            <strong>说明：</strong> 相邻学号的学生可以组合成一个小组，每两个相邻学生之间可以选择"分开"或"不分开"。
        </div>
    `;

    // 重新渲染 MathJax
    if (window.MathJax) {
        MathJax.typesetPromise([results]).catch(err => console.log(err));
    }
}

/**
 * 可视化限制小组大小
 */
function visualizeGroupingWithLimits() {
    const n = parseInt(document.getElementById('limitStudents').value);
    const minSize = parseInt(document.getElementById('minSize').value);
    const maxSize = parseInt(document.getElementById('maxSize').value);
    const results = document.getElementById('limitResults');
    const resultBox = document.getElementById('limitResultBox');

    if (minSize > maxSize) {
        alert('最少人数不能大于最多人数！');
        return;
    }

    const count = countGroupingsLimited(n, minSize, maxSize);
    const basicCount = Math.pow(2, n - 1);
    const reduction = ((basicCount - count) / basicCount * 100).toFixed(2);

    resultBox.style.display = 'block';
    resultBox.innerHTML = `
        <strong>限制条件：</strong> 每个小组 ${minSize}-${maxSize} 人<br>
        <strong>学生总数：</strong> ${n} 人<br>
        <strong>分组方案数：</strong> ${count} 种<br>
        <strong>基本模型方案数：</strong> \\(2^{${n}-1} = ${basicCount}\\) 种<br>
        <strong>方案减少：</strong> ${reduction}%<br>
        <strong>分析：</strong> 添加限制条件使可行方案数从 ${basicCount} 降低到 ${count}
    `;

    // 重新渲染 MathJax
    if (window.MathJax) {
        MathJax.typesetPromise([resultBox]).catch(err => console.log(err));
    }
}

/**
 * 可视化固定学生同组
 */
function visualizeFixedGroup() {
    const n = parseInt(document.getElementById('fixedStudents').value);
    const k = parseInt(document.getElementById('fixedGroupSize').value);
    const results = document.getElementById('fixedResults');
    const resultBox = document.getElementById('fixedResultBox');

    if (k > n) {
        alert('指定同组的学生数不能大于总学生数！');
        return;
    }

    const count = countGroupingsFixedTogether(n, k);
    const basicCount = Math.pow(2, n - 1);

    // 生成演示方案
    const demoGroupings = generateGroupings(n - k + 1);
    const visualization = document.getElementById('basicVisualization');
    visualization.innerHTML = '';

    for (let i = 0; i < Math.min(4, demoGroupings.length); i++) {
        const grouping = demoGroupings[i];
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.gap = '8px';
        div.style.alignItems = 'center';
        div.style.marginBottom = '10px';

        // 第一个分组总是固定的 k 个学生
        const fixedDiv = document.createElement('div');
        fixedDiv.className = 'group';
        let html = '';
        for (let j = 1; j <= k; j++) {
            html += `<span class="student">${j}</span>`;
        }
        fixedDiv.innerHTML = html;
        div.appendChild(fixedDiv);

        // 其他分组
        grouping.forEach((group) => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'group';
            let html = '';
            group.forEach(student => {
                html += `<span class="student">${student + k}</span>`;
            });
            groupDiv.innerHTML = html;
            div.appendChild(groupDiv);
        });

        visualization.appendChild(div);
    }

    resultBox.style.display = 'block';
    resultBox.innerHTML = `
        <strong>固定条件：</strong> 前 ${k} 个学生必须在同一小组<br>
        <strong>学生总数：</strong> ${n} 人<br>
        <strong>分组方案数：</strong> ${count} 种<br>
        <strong>公式：</strong> \\(2^{${n}-${k}} = 2^{${n - k}} = ${count}\\)<br>
        <strong>节省空间：</strong> 从 ${basicCount} 个方案减少到 ${count} 个<br>
        <strong>分析：</strong> 将 ${k} 个固定的学生看作一个整体，相当于只需要分割 ${n - k + 1} 个单位
    `;

    // 重新渲染 MathJax
    if (window.MathJax) {
        MathJax.typesetPromise([resultBox]).catch(err => console.log(err));
    }
}

/**
 * 可视化指定小组数量
 */
function visualizeFixedGroupCount() {
    const n = parseInt(document.getElementById('numStudents').value);
    const k = parseInt(document.getElementById('numGroups').value);
    const results = document.getElementById('groupCountResults');

    if (k > n) {
        alert('小组数量不能大于学生数量！');
        return;
    }

    const count = countGroupingsFixedCount(n, k);

    results.innerHTML = `
        <div class="result-box">
            <strong>将 ${n} 个学生分成 ${k} 个小组的方案数：</strong> ${count} 种<br>
            <strong>数学名称：</strong> 第二类 Stirling 数 \\(S(${n},${k})\\)<br>
            <strong>递推公式：</strong> \\(S(n,k) = k \times S(n-1,k) + S(n-1,k-1)\\)<br>
            <strong>特殊情况：</strong> 
            <ul style="margin: 10px 0;">
                <li>\\(k=1\\): 只有1种方案（所有学生在一个小组）</li>
                <li>\\(k=n\\): 只有1种方案（每个学生单独成组）</li>
            </ul>
        </div>
    `;

    // 重新渲染 MathJax
    if (window.MathJax) {
        MathJax.typesetPromise([results]).catch(err => console.log(err));
    }

    // 更新图表
    updateGroupCountChart(n);
}

/**
 * 可视化 Bell 数分组
 */
function visualizeBellGrouping() {
    const n = parseInt(document.getElementById('bellStudents').value);
    const visualization = document.getElementById('bellVisualization');
    const results = document.getElementById('bellResults');

    const groupings = generateBellGroupings(n);
    const count = groupings.length;
    const bellNum = bellNumber(n);

    // 显示可视化
    visualization.innerHTML = '';

    // 只显示前6个方案
    for (let i = 0; i < Math.min(6, groupings.length); i++) {
        const grouping = groupings[i];
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.gap = '8px';
        div.style.alignItems = 'center';
        div.style.marginBottom = '10px';

        grouping.forEach((group) => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'group';
            let html = '';
            group.forEach(student => {
                html += `<span class="student">${student}</span>`;
            });
            groupDiv.innerHTML = html;
            div.appendChild(groupDiv);
        });

        visualization.appendChild(div);
    }

    // 显示结果
    results.innerHTML = `
        <div class="result-box">
            <strong>Bell 数 \\(B(${n})\\)：</strong> ${bellNum} 种<br>
            <strong>实际方案数：</strong> ${count} 种<br>
            <strong>前 ${Math.min(6, groupings.length)} 个方案已展示</strong>（共 ${count} 个方案）<br>
            <strong>说明：</strong> Bell 数表示将 ${n} 个元素分割成非空子集的总方案数，允许任意组合，不要求连续学号。<br>
            <strong>递推公式：</strong> \\(B(n+1) = \\sum_{k=0}^{n} \\binom{n}{k} B(k)\\)
        </div>
    `;

    // 重新渲染 MathJax
    if (window.MathJax) {
        MathJax.typesetPromise([results]).catch(err => console.log(err));
    }
}

// ==================== 图表初始化 ====================

/**
 * 初始化基本模型图表
 */
function initBasicChart() {
    const ctx = document.getElementById('basicChart');
    if (!ctx) return;

    const data = [];
    const labels = [];
    for (let i = 1; i <= 15; i++) {
        data.push(Math.pow(2, i - 1));
        labels.push(i);
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '分组方案数 = 2^(n-1)',
                data: data,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.3,
                fill: true,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#333',
                        font: { size: 12 }
                    }
                }
            },
            scales: {
                y: {
                    type: 'logarithmic',
                    title: {
                        display: true,
                        text: '分组方案数（对数坐标）',
                        color: '#333'
                    },
                    ticks: {
                        color: '#666'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '学生人数',
                        color: '#333'
                    },
                    ticks: {
                        color: '#666'
                    }
                }
            }
        }
    });
}

/**
 * 更新指定小组数图表
 */
function updateGroupCountChart(n) {
    const ctx = document.getElementById('groupCountChart');
    if (!ctx) return;

    const data = [];
    const labels = [];
    for (let k = 1; k <= n; k++) {
        data.push(countGroupingsFixedCount(n, k));
        labels.push(`${k}个`);
    }

    // 销毁旧图表
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
        existingChart.destroy();
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `${n}个学生分成k个小组的方案数`,
                data: data,
                backgroundColor: '#764ba2',
                borderColor: '#667eea',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#333',
                        font: { size: 12 }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: '方案数',
                        color: '#333'
                    },
                    ticks: {
                        color: '#666'
                    }
                }
            }
        }
    });
}

/**
 * 初始化 Bell 数图表
 */
function initBellChart() {
    const ctx = document.getElementById('bellChart');
    if (!ctx) return;

    const data = [];
    const labels = [];
    for (let i = 0; i <= 8; i++) {
        data.push(bellNumber(i));
        labels.push(i);
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Bell 数 B(n)',
                data: data,
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.3,
                fill: true,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: '#f59e0b',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#333',
                        font: { size: 12 }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Bell 数值',
                        color: '#333'
                    },
                    ticks: {
                        color: '#666'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'n',
                        color: '#333'
                    },
                    ticks: {
                        color: '#666'
                    }
                }
            }
        }
    });
}

/**
 * 初始化比较图表
 */
function initComparisonChart() {
    const ctx = document.getElementById('comparisonChart');
    if (!ctx) return;

    const n = 10;
    const basicData = [];
    const fixedData = [];
    const bellData = [];
    const labels = [];

    for (let i = 1; i <= n; i++) {
        labels.push(i);
        basicData.push(Math.pow(2, i - 1));
        fixedData.push(Math.pow(2, i - 2));
        bellData.push(bellNumber(i));
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '基本模型：2^(n-1)',
                    data: basicData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.3,
                    borderWidth: 2,
                    pointRadius: 4
                },
                {
                    label: '固定同组(k=2)：2^(n-2)',
                    data: fixedData,
                    borderColor: '#764ba2',
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    tension: 0.3,
                    borderWidth: 2,
                    pointRadius: 4
                },
                {
                    label: 'Bell数：B(n)',
                    data: bellData,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.3,
                    borderWidth: 2,
                    pointRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#333',
                        font: { size: 12 }
                    }
                }
            },
            scales: {
                y: {
                    type: 'logarithmic',
                    title: {
                        display: true,
                        text: '方案数（对数坐标）',
                        color: '#333'
                    },
                    ticks: {
                        color: '#666'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '学生人数',
                        color: '#333'
                    },
                    ticks: {
                        color: '#666'
                    }
                }
            }
        }
    });
}

// ==================== 回调函数 ====================

/**
 * 更新基本学生数显示
 */
function updateBasicValue() {
    const value = document.getElementById('basicStudents').value;
    document.getElementById('basicStudentsValue').textContent = value;
}

/**
 * 更新限制分组的学生数显示
 */
function updateLimitValue() {
    const value = document.getElementById('limitStudents').value;
    document.getElementById('limitStudentsValue').textContent = value;
}

/**
 * 更新最小小组大小显示
 */
function updateMinValue() {
    const value = document.getElementById('minSize').value;
    document.getElementById('minSizeValue').textContent = value;
}

/**
 * 更新最大小组大小显示
 */
function updateMaxValue() {
    const value = document.getElementById('maxSize').value;
    document.getElementById('maxSizeValue').textContent = value;
}

/**
 * 更新固定分组的学生数显示
 */
function updateFixedValue() {
    const value = document.getElementById('fixedStudents').value;
    document.getElementById('fixedStudentsValue').textContent = value;
}

/**
 * 更新固定小组大小显示
 */
function updateFixedGroupValue() {
    const value = document.getElementById('fixedGroupSize').value;
    document.getElementById('fixedGroupSizeValue').textContent = value;
}

/**
 * 更新固定小组数的学生数显示
 */
function updateNumValue() {
    const value = document.getElementById('numStudents').value;
    document.getElementById('numStudentsValue').textContent = value;
}

/**
 * 更新小组数显示
 */
function updateGroupsValue() {
    const value = document.getElementById('numGroups').value;
    document.getElementById('numGroupsValue').textContent = value;
}

/**
 * 更新 Bell 数学生数显示
 */
function updateBellValue() {
    const value = document.getElementById('bellStudents').value;
    document.getElementById('bellStudentsValue').textContent = value;
}

// ==================== 事件监听器 ====================

document.addEventListener('DOMContentLoaded', function () {
    // 初始化所有图表
    initBasicChart();
    initBellChart();
    initComparisonChart();

    // 更新显示值的实时反馈
    document.getElementById('basicStudents').addEventListener('input', function () {
        document.getElementById('basicStudentsValue').textContent = this.value;
    });

    document.getElementById('limitStudents').addEventListener('input', function () {
        document.getElementById('limitStudentsValue').textContent = this.value;
    });

    document.getElementById('minSize').addEventListener('input', function () {
        document.getElementById('minSizeValue').textContent = this.value;
    });

    document.getElementById('maxSize').addEventListener('input', function () {
        document.getElementById('maxSizeValue').textContent = this.value;
    });

    document.getElementById('fixedStudents').addEventListener('input', function () {
        document.getElementById('fixedStudentsValue').textContent = this.value;
    });

    document.getElementById('fixedGroupSize').addEventListener('input', function () {
        const max = Math.min(10, parseInt(document.getElementById('fixedStudents').value));
        this.max = max;
        if (parseInt(this.value) > max) {
            this.value = max;
        }
        document.getElementById('fixedGroupSizeValue').textContent = this.value;
    });

    document.getElementById('numStudents').addEventListener('input', function () {
        document.getElementById('numStudentsValue').textContent = this.value;
        const max = Math.min(10, parseInt(this.value));
        document.getElementById('numGroups').max = max;
        if (parseInt(document.getElementById('numGroups').value) > max) {
            document.getElementById('numGroups').value = max;
            document.getElementById('numGroupsValue').textContent = max;
        }
    });

    document.getElementById('numGroups').addEventListener('input', function () {
        document.getElementById('numGroupsValue').textContent = this.value;
    });

    document.getElementById('bellStudents').addEventListener('input', function () {
        document.getElementById('bellStudentsValue').textContent = this.value;
    });

    // 初始化可视化
    visualizeBasicGrouping();
});
