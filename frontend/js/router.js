/**
 * 单页滚动渲染模块
 *
 * 将所有页面内容一次性渲染到 #page-container，导航链接点击 → 平滑滚动定位
 * 包含：仪表盘 Hero、教材管理、出版社、入库、出库 五个 section 的 HTML 模板
 */

/** 所有 section ID 列表（与导航栏 data-page 对应） */
const SECTION_IDS = ['navigation', 'demands', 'books', 'publishers', 'stock-in', 'stock-out', 'orders', 'users'];

/**
 * 滚动到指定区域
 * @param {string} sectionId - 目标区域的 ID
 */
function scrollToSection(sectionId) {
    const section = document.getElementById('section-' + sectionId);
    if (!section) return;

    closeAllModals();

    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * 渲染所有内容区域到页面容器中（一次性渲染）
 * @returns {string} 完整的 HTML 字符串
 */
function renderAllSections() {
    return `
        <section id="section-navigation" class="page-section" data-nav="navigation">
            ${renderNavigationPage()}
        </section>
        <section id="section-demands" class="page-section" data-nav="demands">
            ${renderDemandsPage()}
        </section>
        <section id="section-books" class="page-section" data-nav="books">
            ${renderBooksPage()}
        </section>
        <section id="section-publishers" class="page-section" data-nav="publishers">
            ${renderPublishersPage()}
        </section>
        <section id="section-stock-in" class="page-section" data-nav="stock-in">
            ${renderStockInPage()}
        </section>
        <section id="section-stock-out" class="page-section" data-nav="stock-out">
            ${renderStockOutPage()}
        </section>
        <section id="section-orders" class="page-section" data-nav="orders" data-permission-hide="role:manage">
            ${renderOrdersPage()}
        </section>
        <section id="section-users" class="page-section" data-nav="users" data-permission-hide="user:view">
            ${renderUsersPage()}
        </section>
    `;
}

// ============================================================
// 各页面 HTML 模板渲染函数
// ============================================================

/**
 * 仪表盘页面：大标题 + Canvas 环形饼图 + 统计卡片 + CTA 按钮 + Orb 视频
 */
function renderNavigationPage() {
    return `
        <div class="nav-hero-section">
            <!-- 左侧内容 -->
            <div class="nav-hero-left">
                <div class="nav-hero-badge reveal">📊 库存概览</div>
                <h1 class="nav-hero-title reveal">教材管理系统</h1>
                <p class="nav-hero-desc reveal">教材类型数量分布饼状图</p>
                
                <!-- 饼状图容器 -->
                <div class="nav-chart-container">
                    <canvas id="navPieChart"></canvas>
                </div>
                
                <!-- 库存统计摘要 -->
                <div class="nav-stats-summary" id="navStatsSummary">
                    <div class="nav-stat-card reveal">
                        <span class="nav-stat-icon">📚</span>
                        <div class="nav-stat-info">
                            <span class="nav-stat-value" id="totalBooksCount">-</span>
                            <span class="nav-stat-label">教材总量</span>
                        </div>
                    </div>
                    <div class="nav-stat-card reveal">
                        <span class="nav-stat-icon">🏢</span>
                        <div class="nav-stat-info">
                            <span class="nav-stat-value" id="totalPublishersCount">-</span>
                            <span class="nav-stat-label">出版社</span>
                        </div>
                    </div>
                    <div class="nav-stat-card reveal">
                        <span class="nav-stat-icon">🏷️</span>
                        <div class="nav-stat-info">
                            <span class="nav-stat-value" id="totalTypesCount">-</span>
                            <span class="nav-stat-label">教材类型</span>
                        </div>
                    </div>
                </div>

                <!-- CTA 按钮 -->
                <button id="navGetStartedBtn" class="nav-cta-btn">
                    <span>Get Started Now</span>
                    <svg class="nav-cta-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 16l4-4-4-4"/>
                        <path d="M8 12h8"/>
                    </svg>
                </button>
            </div>

            <!-- 右侧 Glassy Orb 视频 -->
            <div class="nav-hero-right">
                <div class="nav-orb-container">
                    <video class="nav-orb-video" autoplay loop muted playsInline>
                        <source src="https://future.co/images/homepage/glassy-orb/orb-purple.webm" type="video/webm">
                    </video>
                </div>
            </div>
        </div>
    `;
}

/**
 * 初始化仪表盘：加载统计数据 → 绘制饼图 → 绑定 CTA 按钮
 */
async function initNavigationPage() {
    // 加载统计数据并绘制饼状图
    await loadNavChartData();
    
    // 绑定 CTA 按钮事件 - 滚动到教材管理区域
    const ctaBtn = document.getElementById('navGetStartedBtn');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', function() {
            scrollToSection('books');
        });
    }
    
    observeNewReveals();
}

/**
 * 加载仪表盘数据：统计 API + 教材列表 + 出版社 + 类型 → 更新摘要 + 绘制环形饼图
 */
async function loadNavChartData() {
    try {
        // 获取统计数据
        const statsResult = await getStatisticsApi();
        // 获取教材列表（用于统计总量）
        const bookResult = await getBookListApi({ pageNum: 1, pageSize: 1000 });
        const publisherResult = await getPublisherListApi();
        const typeResult = await getTypeListApi();
        
        // 更新统计摘要
        if (bookResult.code === 200 && bookResult.data) {
            document.getElementById('totalBooksCount').textContent = bookResult.data.total || bookResult.data.rows.length;
        }
        if (publisherResult.code === 200 && publisherResult.data) {
            document.getElementById('totalPublishersCount').textContent = publisherResult.data.length;
        }
        if (typeResult.code === 200 && typeResult.data) {
            document.getElementById('totalTypesCount').textContent = typeResult.data.length;
        }
        
        // 准备饼状图数据：按类型统计教材数量
        let chartLabels = [];
        let chartData = [];
        let chartColors = [];
        
        if (bookResult.code === 200 && bookResult.data && bookResult.data.rows && bookResult.data.rows.length > 0) {
            // 按 typeName 聚合统计各类型教材数量
            const typeCountMap = {};
            bookResult.data.rows.forEach(book => {
                const typeName = book.typeName || '未知类型';
                typeCountMap[typeName] = (typeCountMap[typeName] || 0) + 1;
            });
            
            // 按数量降序排列，取前10个类型
            const sortedTypes = Object.entries(typeCountMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);
            
            chartLabels = sortedTypes.map(([name]) => name);
            chartData = sortedTypes.map(([, count]) => count);
            
            // 生成颜色
            const colorPalette = [
                '#0084FF', '#60B1FF', '#319AFF', '#0066CC',
                '#4D9FFF', '#7AB8FF', '#0055AA', '#99CCFF',
                '#3D7AF1', '#1A56DB'
            ];
            chartColors = sortedTypes.map((_, i) => colorPalette[i % colorPalette.length]);
        } else {
            // 无数据时显示占位
            chartLabels = ['暂无数据'];
            chartData = [1];
            chartColors = ['#e0e0e0'];
        }
        
        // 绘制饼状图
        drawPieChart(chartLabels, chartData, chartColors);
        
    } catch (error) {
        console.error('加载导航页数据失败:', error);
        // 显示占位饼状图
        drawPieChart(['暂无数据'], [1], ['#e0e0e0']);
    }
}

/**
 * Canvas 2D 绘制环形饼图（Doughnut Chart）
 * - 按数据比例绘制彩色扇形 + 白色分割线
 * - 中心显示教材总数
 * - 右侧动态生成图例 DOM
 */
function drawPieChart(labels, data, colors) {
    const canvas = document.getElementById('navPieChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // 设置 Canvas 尺寸
    const rect = canvas.parentElement.getBoundingClientRect();
    const size = Math.min(rect.width, 320);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    
    ctx.scale(dpr, dpr);
    
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 20;
    const innerRadius = radius * 0.45; // 内圆半径 = 外圆 45%，形成环形图
    
    // 计算总数
    const total = data.reduce((sum, val) => sum + val, 0);
    if (total === 0) {
        // 绘制空状态
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#f0f0f0';
        ctx.fill();
        ctx.fillStyle = '#a0aec0';
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('暂无教材数据', centerX, centerY);
        return;
    }
    
    // 绘制环形图
    let startAngle = -Math.PI / 2;
    
    data.forEach((value, index) => {
        if (value === 0) return;
        const sliceAngle = (value / total) * Math.PI * 2;
        
        // 绘制扇形
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
        ctx.closePath();
        
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        
        // 绘制分割线
        ctx.beginPath();
        ctx.moveTo(centerX + innerRadius * Math.cos(startAngle), centerY + innerRadius * Math.sin(startAngle));
        ctx.lineTo(centerX + radius * Math.cos(startAngle), centerY + radius * Math.sin(startAngle));
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        startAngle += sliceAngle;
    });
    
    // 中心文字
    ctx.fillStyle = '#1a1a2e';
    ctx.font = 'bold 24px Fustat, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total, centerX, centerY - 8);
    ctx.fillStyle = '#4a5568';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('教材总数', centerX, centerY + 18);
    
    // 绘制图例
    const legendX = size + 20;
    const legendY = 10;
    const legendSpacing = 24;
    
    // 清除之前的图例
    const existingLegend = canvas.parentElement.querySelector('.nav-chart-legend');
    if (existingLegend) existingLegend.remove();
    
    const legendDiv = document.createElement('div');
    legendDiv.className = 'nav-chart-legend';
    
    labels.forEach((label, index) => {
        const percentage = total > 0 ? ((data[index] / total) * 100).toFixed(1) : 0;
        const item = document.createElement('div');
        item.className = 'nav-legend-item';
        item.innerHTML = `
            <span class="nav-legend-dot" style="background: ${colors[index % colors.length]}"></span>
            <span class="nav-legend-label">${label.length > 12 ? label.substring(0, 12) + '...' : label}</span>
            <span class="nav-legend-value">${data[index]} (${percentage}%)</span>
        `;
        legendDiv.appendChild(item);
    });
    
    canvas.parentElement.appendChild(legendDiv);
}

/**
 * 教材需求管理页面：需求列表 + 创建需求模态框
 */
function renderDemandsPage() {
    return `
        <div class="page reveal">
            <div class="page-header">
                <h2>📋 教材需求管理</h2>
                <div class="page-header-actions">
                    <button id="addDemandBtn" class="btn btn-primary" data-permission="demand:create">+ 创建需求</button>
                </div>
            </div>

            <!-- 需求状态过滤 -->
            <div class="demand-filter-bar">
                <button class="demand-filter-btn active" data-status="">全部</button>
                <button class="demand-filter-btn" data-status="active">🟡 进行中</button>
                <button class="demand-filter-btn" data-status="ordered">🔵 已订购</button>
                <button class="demand-filter-btn" data-status="fulfilled">🟢 已完成</button>
                <button class="demand-filter-btn" data-status="cancelled">⚫ 已取消</button>
            </div>

            <!-- 需求列表 -->
            <div id="demandListContainer">
                <div class="empty-state"><p>加载中...</p></div>
            </div>
        </div>

        <!-- 创建需求模态框 -->
        <div id="addDemandModal" class="modal-overlay">
            <div class="modal modal-lg">
                <div class="modal-header">
                    <h3>创建教材需求</h3>
                    <button id="demandModalClose" class="modal-close">&times;</button>
                </div>
                <form id="addDemandForm">
                    <div class="form-group">
                        <label for="demandTitle">需求标题</label>
                        <input type="text" id="demandTitle" name="demandTitle" class="form-control" placeholder="例如：2024秋季学期计算机系教材需求" required>
                    </div>
                    <div class="form-group">
                        <label for="demandNotes">备注</label>
                        <textarea id="demandNotes" name="demandNotes" class="form-control" rows="2" placeholder="可选填写备注信息"></textarea>
                    </div>

                    <!-- 需求明细 -->
                    <div class="detail-section">
                        <h4>需求教材明细</h4>
                        <div id="demandDetailRows">
                            <div class="demand-detail-row">
                                <select class="form-control demand-book-select" style="flex: 2;" required>
                                    <option value="">请选择教材...</option>
                                </select>
                                <input type="number" class="form-control demand-quantity-input" placeholder="数量" min="1" value="1" style="flex: 1;" required>
                                <button type="button" class="btn btn-sm btn-remove-demand-row" style="background: rgba(239,68,68,0.1); color: #ef4444;">✕</button>
                            </div>
                        </div>
                        <button type="button" id="addDemandDetailRowBtn" class="btn btn-success btn-sm" style="margin-top: 8px;">+ 添加教材</button>
                    </div>

                    <div class="modal-footer">
                        <button type="button" id="demandModalCancel" class="btn" style="background: rgba(0,0,0,0.05); color: #4a5568;">取消</button>
                        <button type="submit" class="btn btn-primary">确认创建</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

/**
 * 教材管理页面：搜索栏 + 统计卡片 + 类型卡片网格 + 展开教材列表 + 订购模态框
 */
function renderBooksPage() {
    return `
        <div class="page reveal">
            <div class="page-header">
                <h2>📚 教材管理</h2>
                <div class="page-header-actions">
                    <button id="openOrderBookBtn" class="btn btn-primary" data-permission="book:create">+ 订购教材</button>
                </div>
            </div>

            <!-- 搜索栏 -->
            <div class="books-search-bar">
                <input type="text" id="bookSearchInput" class="form-control" placeholder="搜索教材名称 / ISBN / 作者 / 类型...">
                <button id="bookSearchBtn" class="btn btn-primary">搜索</button>
                <span class="books-search-hint">支持搜索类型名称，点击类型卡片展开教材列表</span>
            </div>

            <!-- 统计概览卡片 -->
            <div class="books-stat-cards" id="booksStatCards">
                <div class="books-stat-card reveal">
                    <h4>教材总量</h4>
                    <div class="stat-value" id="statTotalBooks">-</div>
                    <div class="stat-icon" style="font-size: 28px; margin-top: 4px;">📚</div>
                </div>
                <div class="books-stat-card reveal">
                    <h4>教材类型</h4>
                    <div class="stat-value" id="statTotalTypes">-</div>
                    <div class="stat-icon" style="font-size: 28px; margin-top: 4px;">🏷️</div>
                </div>
                <div class="books-stat-card reveal">
                    <h4>总库存</h4>
                    <div class="stat-value" id="statTotalStock">-</div>
                    <div class="stat-icon" style="font-size: 28px; margin-top: 4px;">📦</div>
                </div>
                <div class="books-stat-card reveal">
                    <h4>出版社</h4>
                    <div class="stat-value" id="statTotalPublishers">-</div>
                    <div class="stat-icon" style="font-size: 28px; margin-top: 4px;">🏢</div>
                </div>
            </div>

            <!-- 类型卡片网格 -->
            <div id="typeCardGrid" class="type-card-grid">
                <div class="empty-state"><p>加载中...</p></div>
            </div>

            <!-- 教材列表表格（展开后显示） -->
            <div id="bookListSection" class="book-list-section" style="display: none;">
                <div class="book-list-header">
                    <h3 id="expandedTypeTitle">📖 教材列表</h3>
                    <button id="collapseBookListBtn" class="btn btn-sm" style="background: rgba(0,0,0,0.05); color: #4a5568;">收起</button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>教材名称</th>
                                <th>ISBN</th>
                                <th>作者</th>
                                <th>价格</th>
                                <th>库存</th>
                                <th>出版社</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="bookTableBody">
                            <tr>
                                <td colspan="8" class="empty-state"><p>加载中...</p></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- 订购教材模态框（原添加教材改造） -->
        <div id="addBookModal" class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h3>订购教材</h3>
                    <button id="modalClose" class="modal-close">&times;</button>
                </div>
                <form id="addBookForm">
                    <div class="form-group">
                        <label for="bookname">教材名称</label>
                        <input type="text" id="bookname" name="bookname" class="form-control" placeholder="请输入教材名称（默认: 默认教材名称）" value="默认教材名称">
                    </div>
                    <div class="form-group">
                        <label for="isbn">ISBN</label>
                        <input type="text" id="isbn" name="isbn" class="form-control" placeholder="请输入ISBN（格式: ISBN+10位数字，如 ISBN0000000001）" value="ISBN0000000001">
                    </div>
                    <div class="form-group">
                        <label for="author">作者</label>
                        <input type="text" id="author" name="author" class="form-control" placeholder="请输入作者（默认: 默认作者）" value="默认作者">
                    </div>
                    <div class="form-group">
                        <label for="price">价格</label>
                        <input type="number" id="price" name="price" class="form-control" placeholder="请输入价格（默认: 39.9）" value="39.9" step="0.01">
                    </div>
                    <div class="form-group">
                        <label for="bookQuantity">教材数量</label>
                        <input type="number" id="bookQuantity" name="bookQuantity" class="form-control" placeholder="请输入订购数量（默认: 1）" value="1" min="1">
                    </div>
                    <div class="form-group">
                        <label for="typeId">教材类型</label>
                        <select id="typeId" name="typeId" class="form-control">
                            <option value="">加载中...</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="publishDate">出版日期</label>
                        <input type="date" id="publishDate" name="publishDate" class="form-control" value="2024-01-01">
                    </div>
                    <div class="form-group">
                        <label for="orderPublisherId">出版社</label>
                        <select id="orderPublisherId" name="publisherId" class="form-control">
                            <option value="">加载中...</option>
                        </select>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="modalCancel" class="btn" style="background: rgba(0,0,0,0.05); color: #4a5568;">取消</button>
                        <button type="submit" class="btn btn-primary">确认订购</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

/**
 * 出版社管理页面：表格列表 + 添加出版社模态框
 */
function renderPublishersPage() {
    return `
        <div class="page reveal">
            <div class="page-header">
                <h2>🏢 出版社管理</h2>
                <button id="addPublisherBtn" class="btn btn-primary" data-permission="publisher:create">+ 添加出版社</button>
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>出版社名称</th>
                            <th>地址</th>
                            <th>联系电话</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody id="publisherTableBody">
                        <tr>
                            <td colspan="5" class="empty-state"><p>加载中...</p></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 添加出版社模态框 -->
        <div id="addPublisherModal" class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h3 id="publisherModalTitle">添加出版社</h3>
                    <button id="publisherModalClose" class="modal-close">&times;</button>
                </div>
                <form id="addPublisherForm">
                    <div class="form-group">
                        <label for="publisherName">出版社名称</label>
                        <input type="text" id="publisherName" name="publisherName" class="form-control" placeholder="请输入出版社名称">
                    </div>
                    <div class="form-group">
                        <label for="publishAddress">地址</label>
                        <input type="text" id="publishAddress" name="publishAddress" class="form-control" placeholder="请输入地址">
                    </div>
                    <div class="form-group">
                        <label for="publishPhone">联系电话</label>
                        <input type="text" id="publishPhone" name="publishPhone" class="form-control" placeholder="请输入联系电话">
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="publisherModalCancel" class="btn" style="background: rgba(0,0,0,0.05); color: #4a5568;">取消</button>
                        <button type="submit" class="btn btn-primary">确认添加</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

/**
 * 入库管理页面：待入库教材表格 + 入库登记表单（从待入库列表选择明细）
 */
function renderStockInPage() {
    return `
        <div class="page reveal">
            <div class="page-header">
                <h2>📥 入库管理</h2>
            </div>

            <!-- 待入库教材列表 -->
            <div class="pending-stock-section reveal">
                <h3>📋 待入库教材</h3>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>教材名称</th>
                                <th>ISBN</th>
                                <th>作者</th>
                                <th>价格</th>
                                <th>订购数量</th>
                                <th>出版社</th>
                                <th>类型</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="pendingStockTableBody">
                            <tr>
                                <td colspan="9" class="empty-state"><p>暂无待入库教材</p></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 入库表单 -->
            <div class="stock-in-form-section reveal">
                <h3>📝 入库登记</h3>
                <form id="stockInForm">
                    <div class="form-group">
                        <label for="stockInDate">入库日期</label>
                        <input type="date" id="stockInDate" name="stockInDate" class="form-control" value="${new Date().toISOString().split('T')[0]}">
                        <span class="field-hint">请选择入库日期</span>
                    </div>
                    <div class="form-group">
                        <label for="operatorId">操作员ID</label>
                        <input type="number" id="operatorId" name="operatorId" class="form-control" placeholder="请输入操作员ID">
                        <span class="field-hint">请输入执行入库的操作员编号</span>
                    </div>

                    <!-- 入库明细（从待入库列表选择） -->
                    <div class="detail-section">
                        <h4>入库明细（从待入库中选择）</h4>
                        <div id="stockInDetails"></div>
                        <button type="button" id="addDetailBtn" class="btn btn-success btn-sm" style="margin-top: 8px;" data-permission="stockin:create">+ 从待入库添加教材</button>
                    </div>

                    <div style="margin-top: 24px;">
                        <button type="submit" class="btn btn-primary" data-permission="stockin:create">提交入库</button>
                    </div>
                </form>
            </div>

            <!-- 入库历史记录（仅管理员可见） -->
            <div class="history-section reveal" data-permission-hide="role:manage">
                <h3>📋 入库历史记录</h3>
                <div id="stockInHistoryContainer">
                    <div class="empty-state"><p>加载中...</p></div>
                </div>
            </div>
        </div>
    `;
}

/**
 * 出库管理页面：出库登记表单 + ISBN 自动补全明细行
 */
function renderStockOutPage() {
    return `
        <div class="page reveal">
            <div class="page-header">
                <h2>📤 出库管理</h2>
            </div>

            <form id="stockOutForm">
                <div class="form-group">
                    <label for="stockOutDate">出库日期</label>
                    <input type="date" id="stockOutDate" name="stockOutDate" class="form-control" value="${new Date().toISOString().split('T')[0]}">
                    <span class="field-hint">请选择出库日期</span>
                </div>
                <div class="form-group">
                    <label for="stockOutOperatorId">操作员ID</label>
                    <input type="number" id="stockOutOperatorId" name="operatorId" class="form-control" placeholder="请输入操作员ID">
                    <span class="field-hint">请输入执行出库的操作员编号</span>
                </div>

                <!-- 出库明细 -->
                <div class="detail-section">
                    <h4>出库明细</h4>
                    <div id="stockOutDetails"></div>
                    <button type="button" id="addOutDetailBtn" class="btn btn-success btn-sm" style="margin-top: 8px;" data-permission="stockout:create">+ 添加明细行</button>
                </div>

                <div style="margin-top: 24px;">
                    <button type="submit" class="btn btn-primary" data-permission="stockout:create">提交出库</button>
                </div>
            </form>

            <!-- 出库历史记录（仅管理员可见） -->
            <div class="history-section reveal" data-permission-hide="role:manage">
                <h3>📋 出库历史记录</h3>
                <div id="stockOutHistoryContainer">
                    <div class="empty-state"><p>加载中...</p></div>
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// 动态导航栏：根据用户权限生成导航链接 HTML
// ============================================================

/**
 * 订购记录页面（仅管理员可见）
 */
function renderOrdersPage() {
    return `
        <div class="page reveal">
            <div class="page-header">
                <h2>🛒 订购记录</h2>
            </div>
            <div id="orderHistoryContainer">
                <div class="empty-state"><p>加载中...</p></div>
            </div>
        </div>
    `;
}

// ============================================================

/**
 * 导航项定义：{ page, icon, label, requiredPermission }
 * 至少需要 requiredPermission 才显示该项
 */
const NAV_ITEMS = [
    { page: 'demands',    icon: '📋', label: '需求管理',   permission: 'demand:view' },
    { page: 'books',      icon: '📚', label: '教材管理',   permission: 'book:view' },
    { page: 'publishers', icon: '🏢', label: '出版社',     permission: 'publisher:view' },
    { page: 'stock-in',   icon: '📥', label: '入库',       permission: 'stockin:view' },
    { page: 'stock-out',  icon: '📤', label: '出库',       permission: 'stockout:view' },
    { page: 'orders',     icon: '🛒', label: '订购记录',   permission: 'role:manage' },
    { page: 'users',      icon: '👥', label: '用户管理',   permission: 'user:view' }
];

/**
 * 渲染动态导航链接
 * @returns {string} 导航链接 HTML
 */
function renderDynamicNavLinks() {
    return NAV_ITEMS
        .filter(item => hasPermission(item.permission))
        .map(item =>
            `<a href="#" data-page="${item.page}" class="liquid-nav-link">${item.icon} ${item.label}</a>`
        )
        .join('\n                        ');
}

/**
 * 用户管理页面（仅 Admin 可见）：用户列表 + 添加用户 + 删除用户
 */
function renderUsersPage() {
    return `
        <div class="page reveal">
            <div class="page-header">
                <h2>👥 用户管理</h2>
                <button id="addUserBtn" class="btn btn-primary" data-permission="user:create">+ 添加用户</button>
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>用户名</th>
                            <th>显示名称</th>
                            <th>角色</th>
                            <th>状态</th>
                            <th>创建时间</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody id="userTableBody">
                        <tr>
                            <td colspan="7" class="empty-state"><p>加载中...</p></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 添加用户模态框 -->
        <div id="addUserModal" class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h3>添加用户</h3>
                    <button id="userModalClose" class="modal-close">&times;</button>
                </div>
                <form id="addUserForm">
                    <div class="form-group">
                        <label for="newUsername">用户名</label>
                        <input type="text" id="newUsername" name="username" class="form-control" placeholder="请输入用户名" required>
                    </div>
                    <div class="form-group">
                        <label for="newPassword">密码</label>
                        <input type="password" id="newPassword" name="password" class="form-control" placeholder="请输入密码" required>
                    </div>
                    <div class="form-group">
                        <label for="newDisplayName">显示名称</label>
                        <input type="text" id="newDisplayName" name="displayName" class="form-control" placeholder="请输入显示名称" required>
                    </div>
                    <div class="form-group">
                        <label for="newRole">角色</label>
                        <select id="newRole" name="roleName" class="form-control" required>
                            <option value="">请选择角色...</option>
                            <option value="Admin">管理员</option>
                            <option value="StockOperator">库存操作员</option>
                            <option value="DemandProvider">需求提出者</option>
                            <option value="Viewer">只读人员</option>
                        </select>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="userModalCancel" class="btn" style="background: rgba(0,0,0,0.05); color: #4a5568;">取消</button>
                        <button type="submit" class="btn btn-primary">确认添加</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

/**
 * 关闭所有模态框
 */
function closeAllModals() {
    document.querySelectorAll('.modal-overlay.show').forEach(modal => {
        modal.classList.remove('show');
    });
}

// ============================================================
// 初始化所有区域（由 app.js 的 enterApp() 调用）
// ============================================================

function initAllSections() {
    initNavigationPage();
    initDemandsPage();
    initBooksPage();
    initPublishersPage();
    initStockInPage();
    initStockOutPage();
    initOrdersPage();
    initUsersPage();
}

// ============================================================
// 将模态框移到 body 末尾（避免父容器 overflow/z-index 问题）
// ============================================================

function moveModalsToBody() {
    document.querySelectorAll('.modal-overlay').forEach(function (modal) {
        if (modal.parentElement !== document.body) {
            document.body.appendChild(modal);
        }
    });
}

// ============================================================
// 动态渲染导航链接
// ============================================================

function renderDynamicNavigation() {
    var container = document.getElementById('dynamicNavLinks');
    if (container) {
        container.innerHTML = renderDynamicNavLinks();
    }
}

// ============================================================
// 通用模态框辅助函数
// ============================================================

function openModal(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) modal.classList.add('show');
}

function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('show');
}

// ============================================================
// ██  需求管理页 初始化
// ============================================================

var currentDemandStatus = '';

async function initDemandsPage() {
    // 加载需求列表
    await loadDemandList();

    // 绑定过滤按钮
    document.querySelectorAll('.demand-filter-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.demand-filter-btn').forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            currentDemandStatus = this.getAttribute('data-status') || '';
            loadDemandList();
        });
    });

    // 绑定创建需求按钮
    var addBtn = document.getElementById('addDemandBtn');
    if (addBtn) {
        addBtn.addEventListener('click', async function () {
            openModal('addDemandModal');
            // 先加载教材下拉选项
            await populateDemandBookSelects();
        });
    }

    // 绑定模态框关闭
    bindModalClose('addDemandModal', ['demandModalClose', 'demandModalCancel']);

    // 绑定添加明细行按钮
    var addRowBtn = document.getElementById('addDemandDetailRowBtn');
    if (addRowBtn) {
        addRowBtn.addEventListener('click', function () {
            addDemandDetailRow();
        });
    }

    // 绑定创建需求表单提交
    var form = document.getElementById('addDemandForm');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            await submitDemandForm();
        });
    }
}

async function loadDemandList() {
    var container = document.getElementById('demandListContainer');
    if (!container) return;

    try {
        var result = await getDemandListApi({ status: currentDemandStatus || '' });
        if (result.code !== 200 || !result.data) {
            container.innerHTML = '<div class="empty-state"><p>暂无需求数据</p></div>';
            return;
        }

        var demands = result.data;
        if (demands.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>暂无需求数据</p></div>';
            return;
        }

        var statusLabels = {
            'active': '🟡 进行中',
            'ordered': '🔵 已订购',
            'fulfilled': '🟢 已完成',
            'cancelled': '⚫ 已取消'
        };

        var html = '<div class="demand-card-list">';
        demands.forEach(function (d) {
            var detailsHtml = '';
            if (d.details && d.details.length > 0) {
                detailsHtml = '<ul class="demand-detail-mini">' +
                    d.details.map(function (dd) {
                        return '<li>' + (dd.bookname || '教材#' + dd.bookId) +
                               ' × ' + dd.quantity +
                               '（已满足: ' + (dd.fulFilledQuantity || dd.fulfilledQuantity || 0) + '）</li>';
                    }).join('') + '</ul>';
            }

            html += '<div class="demand-card">' +
                '<div class="demand-card-header">' +
                '<span class="demand-card-title">' + (d.demandTitle || '') + '</span>' +
                '<span class="demand-card-status">' + (statusLabels[d.status] || d.status) + '</span>' +
                '</div>' +
                '<div class="demand-card-meta">' +
                '<span>提出者: ' + (d.requesterName || '用户#' + d.requesterId) + '</span>' +
                '<span>日期: ' + (d.demandDate || '') + '</span>' +
                '</div>' +
                (d.notes ? '<div class="demand-card-notes">备注: ' + d.notes + '</div>' : '') +
                detailsHtml +
                '<div class="demand-card-actions">' +
                (d.status === 'active' ? '<button class="btn btn-sm btn-cancel-demand" data-id="' + d.demandId + '" data-permission="demand:edit">取消需求</button>' : '') +
                '</div>' +
                '</div>';
        });
        html += '</div>';
        container.innerHTML = html;

        // 绑定取消按钮
        container.querySelectorAll('.btn-cancel-demand').forEach(function (btn) {
            btn.addEventListener('click', async function () {
                var demandId = parseInt(this.getAttribute('data-id'));
                if (confirm('确定取消该需求吗？')) {
                    var res = await cancelDemandApi(demandId);
                    if (res.code === 200) {
                        showMessage('需求已取消', 'success');
                        loadDemandList();
                    } else {
                        showMessage(res.message || '取消失败', 'error');
                    }
                }
            });
        });

        applyPermissionVisibility();
    } catch (err) {
        console.error('加载需求列表失败:', err);
        container.innerHTML = '<div class="empty-state"><p>加载失败</p></div>';
    }
}

async function populateDemandBookSelects() {
    var selects = document.querySelectorAll('#demandDetailRows .demand-book-select');
    if (selects.length === 0) return;

    try {
        var result = await getBookListApi({ pageNum: 1, pageSize: 1000 });
        var books = (result.code === 200 && result.data && result.data.rows) ? result.data.rows : [];

        var optionsHtml = '<option value="">请选择教材...</option>';
        books.forEach(function (b) {
            optionsHtml += '<option value="' + b.bookId + '">' + b.bookname + ' (库存:' + (b.stock || 0) + ')</option>';
        });

        selects.forEach(function (sel) {
            var currentVal = sel.value;
            sel.innerHTML = optionsHtml;
            if (currentVal) sel.value = currentVal;
        });
    } catch (err) {
        console.error('加载教材选项失败:', err);
    }
}

function addDemandDetailRow() {
    var container = document.getElementById('demandDetailRows');
    if (!container) return;

    var row = document.createElement('div');
    row.className = 'demand-detail-row';
    row.innerHTML = '<select class="form-control demand-book-select" style="flex: 2;" required>' +
        '<option value="">请选择教材...</option></select>' +
        '<input type="number" class="form-control demand-quantity-input" placeholder="数量" min="1" value="1" style="flex: 1;" required>' +
        '<button type="button" class="btn btn-sm btn-remove-demand-row" style="background: rgba(239,68,68,0.1); color: #ef4444;">✕</button>';

    container.appendChild(row);

    // 绑定删除行按钮
    row.querySelector('.btn-remove-demand-row').addEventListener('click', function () {
        row.remove();
    });

    // 填充教材选项
    populateDemandBookSelects();
}

async function submitDemandForm() {
    var titleInput = document.getElementById('demandTitle');
    var notesInput = document.getElementById('demandNotes');

    if (!titleInput || !titleInput.value.trim()) {
        showMessage('请输入需求标题', 'warning');
        return;
    }

    // 收集明细行数据
    var rows = document.querySelectorAll('#demandDetailRows .demand-detail-row');
    var details = [];
    var hasError = false;

    rows.forEach(function (row) {
        var select = row.querySelector('.demand-book-select');
        var qtyInput = row.querySelector('.demand-quantity-input');
        var bookId = select ? parseInt(select.value) : 0;
        var quantity = qtyInput ? parseInt(qtyInput.value) : 0;

        if (!bookId || isNaN(bookId)) {
            hasError = true;
            return;
        }
        if (!quantity || quantity < 1) {
            hasError = true;
            return;
        }
        details.push({ bookId: bookId, quantity: quantity });
    });

    if (hasError || details.length === 0) {
        showMessage('请为每行选择教材并填写有效数量', 'warning');
        return;
    }

    try {
        var result = await addDemandApi({
            demandTitle: titleInput.value.trim(),
            notes: notesInput ? notesInput.value.trim() : '',
            details: details
        });

        if (result.code === 200) {
            showMessage('需求创建成功', 'success');
            closeModal('addDemandModal');
            // 重置表单
            titleInput.value = '';
            if (notesInput) notesInput.value = '';
            document.getElementById('demandDetailRows').innerHTML =
                '<div class="demand-detail-row">' +
                '<select class="form-control demand-book-select" style="flex: 2;" required><option value="">请选择教材...</option></select>' +
                '<input type="number" class="form-control demand-quantity-input" placeholder="数量" min="1" value="1" style="flex: 1;" required>' +
                '<button type="button" class="btn btn-sm btn-remove-demand-row" style="background: rgba(239,68,68,0.1); color: #ef4444;">✕</button>' +
                '</div>';
            loadDemandList();
        } else {
            showMessage(result.message || '创建需求失败', 'error');
        }
    } catch (err) {
        console.error('创建需求失败:', err);
        showMessage('创建需求失败: ' + (err.message || '未知错误'), 'error');
    }
}

// ============================================================
// ██  教材管理页 初始化
// ============================================================

var currentBookTypeId = null;

async function initBooksPage() {
    // 加载类型卡片 + 统计
    await loadTypeCardsAndStats();

    // 绑定搜索
    var searchInput = document.getElementById('bookSearchInput');
    var searchBtn = document.getElementById('bookSearchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function () {
            loadBooksIntoTable(currentBookTypeId, searchInput ? searchInput.value : '');
        });
    }
    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                loadBooksIntoTable(currentBookTypeId, searchInput.value);
            }
        });
    }

    // 绑定收起按钮
    var collapseBtn = document.getElementById('collapseBookListBtn');
    if (collapseBtn) {
        collapseBtn.addEventListener('click', function () {
            document.getElementById('bookListSection').style.display = 'none';
        });
    }

    // 绑定订购教材模态框
    bindBookOrderModal();

    // 绑定"订购教材"按钮
    var orderBtn = document.getElementById('openOrderBookBtn');
    if (orderBtn) {
        orderBtn.addEventListener('click', function () {
            openModal('addBookModal');
            loadOrderFormOptions();
        });
    }
}

async function loadTypeCardsAndStats() {
    var grid = document.getElementById('typeCardGrid');
    var keyword = document.getElementById('bookSearchInput') ? document.getElementById('bookSearchInput').value : '';

    try {
        var [bookResult, publisherResult, typeResult] = await Promise.all([
            getBookListApi({ pageNum: 1, pageSize: 1000, keyword: keyword }),
            getPublisherListApi(),
            getTypeListApi()
        ]);

        // 更新统计卡片
        if (bookResult.code === 200 && bookResult.data) {
            var books = bookResult.data.rows || [];
            document.getElementById('statTotalBooks').textContent = bookResult.data.total || books.length;
            var totalStock = books.reduce(function (s, b) { return s + (b.stock || 0); }, 0);
            document.getElementById('statTotalStock').textContent = totalStock;
        }
        if (publisherResult.code === 200 && publisherResult.data) {
            document.getElementById('statTotalPublishers').textContent = publisherResult.data.length;
        }
        if (typeResult.code === 200 && typeResult.data) {
            document.getElementById('statTotalTypes').textContent = typeResult.data.length;
        }

        // 按类型分组统计
        var types = typeResult.code === 200 && typeResult.data ? typeResult.data : [];
        var books = bookResult.code === 200 && bookResult.data && bookResult.data.rows ? bookResult.data.rows : [];

        var typeCountMap = {};
        var typeNameMap = {};
        types.forEach(function (t) {
            typeCountMap[t.typeId] = 0;
            typeNameMap[t.typeId] = t.typeName || '未知';
        });
        books.forEach(function (b) {
            var tid = b.typeId || 0;
            if (!typeCountMap[tid]) typeCountMap[tid] = 0;
            typeCountMap[tid] = (typeCountMap[tid] || 0) + 1;
            if (!typeNameMap[tid]) typeNameMap[tid] = b.typeName || '未知';
        });

        if (Object.keys(typeCountMap).length === 0) {
            grid.innerHTML = '<div class="empty-state"><p>暂无教材类型数据</p></div>';
            return;
        }

        var html = '';
        Object.keys(typeCountMap).forEach(function (tid) {
            var count = typeCountMap[tid] || 0;
            var name = typeNameMap[tid] || '未知';
            html += '<div class="type-card" data-type-id="' + tid + '" data-type-name="' + name + '">' +
                '<div class="type-card-icon">📚</div>' +
                '<div class="type-card-name">' + name + '</div>' +
                '<div class="type-card-count">' + count + ' 本教材</div>' +
                '</div>';
        });
        grid.innerHTML = html;

        // 绑定类型卡片点击
        grid.querySelectorAll('.type-card').forEach(function (card) {
            card.addEventListener('click', function () {
                var typeId = this.getAttribute('data-type-id');
                var typeName = this.getAttribute('data-type-name');
                currentBookTypeId = typeId ? parseInt(typeId) : null;
                document.getElementById('expandedTypeTitle').textContent = '📖 ' + typeName + ' - 教材列表';
                document.getElementById('bookListSection').style.display = 'block';
                loadBooksIntoTable(currentBookTypeId, keyword);
                // 滚动到列表
                document.getElementById('bookListSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    } catch (err) {
        console.error('加载类型卡片失败:', err);
        if (grid) grid.innerHTML = '<div class="empty-state"><p>加载失败</p></div>';
    }
}

async function loadBooksIntoTable(typeId, keyword) {
    var tbody = document.getElementById('bookTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><p>加载中...</p></td></tr>';

    try {
        var result = await getBookListApi({
            pageNum: 1,
            pageSize: 1000,
            keyword: keyword || '',
            typeId: typeId || null
        });

        if (result.code !== 200 || !result.data) {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><p>暂无教材</p></td></tr>';
            return;
        }

        var books = result.data.rows || [];
        if (books.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><p>暂无教材</p></td></tr>';
            return;
        }

        var html = '';
        books.forEach(function (b) {
            html += '<tr>' +
                '<td>' + b.bookId + '</td>' +
                '<td>' + (b.bookname || '') + '</td>' +
                '<td>' + (b.isbn || '') + '</td>' +
                '<td>' + (b.author || '') + '</td>' +
                '<td>¥' + (b.price || 0).toFixed(2) + '</td>' +
                '<td>' + (b.stock || 0) + '</td>' +
                '<td>' + (b.publisherName || '') + '</td>' +
                '<td>' +
                '<button class="btn btn-sm btn-edit-book" data-id="' + b.bookId + '" data-permission="book:edit">编辑</button> ' +
                '<button class="btn btn-sm btn-delete-book" data-id="' + b.bookId + '" style="background: rgba(239,68,68,0.1); color: #ef4444;" data-permission="book:delete">删除</button>' +
                '</td>' +
                '</tr>';
        });
        tbody.innerHTML = html;

        // 绑定编辑按钮
        tbody.querySelectorAll('.btn-edit-book').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var bookId = parseInt(this.getAttribute('data-id'));
                var book = books.find(function (b) { return b.bookId === bookId; });
                if (book) openEditBookModal(book);
            });
        });

        // 绑定删除按钮
        tbody.querySelectorAll('.btn-delete-book').forEach(function (btn) {
            btn.addEventListener('click', async function () {
                var bookId = parseInt(this.getAttribute('data-id'));
                if (confirm('确定删除该教材吗？此操作不可撤销。')) {
                    var res = await deleteBookApi(bookId);
                    if (res.code === 200) {
                        showMessage('教材已删除', 'success');
                        loadBooksIntoTable(currentBookTypeId, keyword);
                        loadTypeCardsAndStats();
                    } else {
                        showMessage(res.message || '删除失败', 'error');
                    }
                }
            });
        });

        applyPermissionVisibility();
    } catch (err) {
        console.error('加载教材列表失败:', err);
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><p>加载失败</p></td></tr>';
    }
}

// ---- 订购教材模态框 ----

function bindBookOrderModal() {
    // 绑定关闭
    bindModalClose('addBookModal', ['modalClose', 'modalCancel']);

    // 绑定表单提交
    var form = document.getElementById('addBookForm');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            await submitOrderForm();
        });
    }
}

async function loadOrderFormOptions() {
    try {
        var [typeResult, pubResult] = await Promise.all([
            getTypeListApi(),
            getPublisherListApi()
        ]);

        var typeSelect = document.getElementById('typeId');
        if (typeSelect && typeResult.code === 200 && typeResult.data) {
            var html = '<option value="">请选择类型...</option>';
            typeResult.data.forEach(function (t) {
                html += '<option value="' + t.typeId + '">' + (t.typeName || '') + '</option>';
            });
            typeSelect.innerHTML = html;
        }

        var pubSelect = document.getElementById('orderPublisherId');
        if (pubSelect && pubResult.code === 200 && pubResult.data) {
            var html = '<option value="">请选择出版社...</option>';
            pubResult.data.forEach(function (p) {
                html += '<option value="' + p.publisherId + '">' + (p.publisherName || '') + '</option>';
            });
            pubSelect.innerHTML = html;
        }
    } catch (err) {
        console.error('加载订购选项失败:', err);
    }
}

async function submitOrderForm() {
    var bookname = document.getElementById('bookname').value.trim();
    var isbn = document.getElementById('isbn').value.trim();
    var author = document.getElementById('author').value.trim();
    var price = parseFloat(document.getElementById('price').value);
    var quantity = parseInt(document.getElementById('bookQuantity').value);
    var typeId = parseInt(document.getElementById('typeId').value);
    var publisherId = parseInt(document.getElementById('orderPublisherId').value);
    var publishDate = document.getElementById('publishDate').value;

    if (!bookname || !isbn || !author) {
        showMessage('请填写教材名称、ISBN和作者', 'warning');
        return;
    }
    if (!publisherId || isNaN(publisherId)) {
        showMessage('请选择出版社', 'warning');
        return;
    }
    if (!typeId || isNaN(typeId)) {
        showMessage('请选择教材类型', 'warning');
        return;
    }
    if (isNaN(price) || price <= 0) {
        showMessage('请输入有效价格', 'warning');
        return;
    }
    if (isNaN(quantity) || quantity < 1) {
        showMessage('请输入有效数量', 'warning');
        return;
    }

    try {
        // 直接调用 addBookApi + 创建订购单
        var bookResult = await addBookApi({
            bookname: bookname,
            isbn: isbn,
            author: author,
            price: price,
            publisherId: publisherId,
            typeId: typeId,
            publishDate: publishDate
        });

        if (bookResult.code !== 200) {
            showMessage(bookResult.message || '教材创建失败', 'error');
            return;
        }

        // 通过ISBN查找刚创建的教材
        var listResult = await getBookListApi({ keyword: isbn, pageNum: 1, pageSize: 1 });
        var bookId = null;
        if (listResult.code === 200 && listResult.data && listResult.data.rows && listResult.data.rows.length > 0) {
            bookId = listResult.data.rows[0].bookId;
        }

        if (!bookId) {
            showMessage('教材已创建但未能获取ID，请手动订购', 'warning');
            closeModal('addBookModal');
            loadTypeCardsAndStats();
            return;
        }

        // 创建订购单
        var userInfo = getStoredUserInfo();
        var operatorId = userInfo ? userInfo.userId : 1;

        var orderResult = await request('/orders', {
            method: 'POST',
            body: JSON.stringify({
                merchantName: '系统订购',
                merchantPhone: '-',
                operatorId: operatorId,
                demandId: null,
                details: [{ bookId: bookId, quantity: quantity }]
            })
        });

        if (orderResult.code === 200) {
            showMessage('订购成功', 'success');
            closeModal('addBookModal');
            loadTypeCardsAndStats();
            // 刷新仪表盘
            if (typeof loadNavChartData === 'function') loadNavChartData();
        } else {
            showMessage(orderResult.message || '订购失败', 'error');
        }
    } catch (err) {
        console.error('订购失败:', err);
        showMessage('订购失败: ' + (err.message || '未知错误'), 'error');
    }
}

// ---- 编辑教材模态框 ----

function openEditBookModal(book) {
    // 动态创建编辑表单
    var existing = document.getElementById('editBookModal');
    if (existing) existing.remove();

    var modal = document.createElement('div');
    modal.id = 'editBookModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = '<div class="modal">' +
        '<div class="modal-header"><h3>编辑教材</h3><button class="modal-close" id="editBookModalClose">&times;</button></div>' +
        '<form id="editBookForm">' +
        '<div class="form-group"><label>教材名称</label><input type="text" id="editBookname" class="form-control" value="' + (book.bookname || '') + '" required></div>' +
        '<div class="form-group"><label>ISBN</label><input type="text" id="editIsbn" class="form-control" value="' + (book.isbn || '') + '" required></div>' +
        '<div class="form-group"><label>作者</label><input type="text" id="editAuthor" class="form-control" value="' + (book.author || '') + '" required></div>' +
        '<div class="form-group"><label>价格</label><input type="number" id="editPrice" class="form-control" value="' + (book.price || 0) + '" step="0.01" required></div>' +
        '<div class="form-group"><label>出版社ID</label><input type="number" id="editPublisherId" class="form-control" value="' + (book.publisherId || '') + '" required></div>' +
        '<div class="form-group"><label>类型ID</label><input type="number" id="editTypeId" class="form-control" value="' + (book.typeId || '') + '" required></div>' +
        '<div class="form-group"><label>出版日期</label><input type="date" id="editPublishDate" class="form-control" value="' + (book.publishDate || '') + '" required></div>' +
        '<div class="modal-footer">' +
        '<button type="button" id="editBookModalCancel" class="btn" style="background: rgba(0,0,0,0.05); color: #4a5568;">取消</button>' +
        '<button type="submit" class="btn btn-primary">确认更新</button>' +
        '</div></form></div>';

    document.body.appendChild(modal);
    openModal('editBookModal');

    // 绑定关闭
    document.getElementById('editBookModalClose').addEventListener('click', function () { closeModal('editBookModal'); });
    document.getElementById('editBookModalCancel').addEventListener('click', function () { closeModal('editBookModal'); });
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal('editBookModal'); });

    // 绑定提交
    document.getElementById('editBookForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        var params = {
            bookname: document.getElementById('editBookname').value.trim(),
            isbn: document.getElementById('editIsbn').value.trim(),
            author: document.getElementById('editAuthor').value.trim(),
            price: parseFloat(document.getElementById('editPrice').value),
            publisherId: parseInt(document.getElementById('editPublisherId').value),
            typeId: parseInt(document.getElementById('editTypeId').value),
            publishDate: document.getElementById('editPublishDate').value
        };

        var res = await updateBookApi(book.bookId, params);
        if (res.code === 200) {
            showMessage('教材更新成功', 'success');
            closeModal('editBookModal');
            loadBooksIntoTable(currentBookTypeId, document.getElementById('bookSearchInput') ? document.getElementById('bookSearchInput').value : '');
            loadTypeCardsAndStats();
        } else {
            showMessage(res.message || '更新失败', 'error');
        }
    });
}

// ============================================================
// ██  出版社管理页 初始化
// ============================================================

async function initPublishersPage() {
    await loadPublisherTable();

    // 绑定添加按钮
    var addBtn = document.getElementById('addPublisherBtn');
    if (addBtn) {
        addBtn.addEventListener('click', function () {
            // 重置为添加模式
            document.getElementById('publisherModalTitle').textContent = '添加出版社';
            document.getElementById('addPublisherForm').reset();
            document.getElementById('addPublisherForm').removeAttribute('data-edit-id');
            openModal('addPublisherModal');
        });
    }

    // 绑定模态框关闭
    bindModalClose('addPublisherModal', ['publisherModalClose', 'publisherModalCancel']);

    // 绑定表单提交
    var form = document.getElementById('addPublisherForm');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            await submitPublisherForm();
        });
    }
}

async function loadPublisherTable() {
    var tbody = document.getElementById('publisherTableBody');
    if (!tbody) return;

    try {
        var result = await getPublisherListApi();
        if (result.code !== 200 || !result.data) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><p>暂无出版社</p></td></tr>';
            return;
        }

        var pubs = result.data;
        if (pubs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><p>暂无出版社</p></td></tr>';
            return;
        }

        var html = '';
        pubs.forEach(function (p) {
            html += '<tr>' +
                '<td>' + p.publisherId + '</td>' +
                '<td>' + (p.publisherName || '') + '</td>' +
                '<td>' + (p.publishAddress || '') + '</td>' +
                '<td>' + (p.publishPhone || '') + '</td>' +
                '<td>' +
                '<button class="btn btn-sm btn-edit-publisher" data-id="' + p.publisherId + '" data-permission="publisher:edit">编辑</button> ' +
                '<button class="btn btn-sm btn-delete-publisher" data-id="' + p.publisherId + '" style="background: rgba(239,68,68,0.1); color: #ef4444;" data-permission="publisher:delete">删除</button>' +
                '</td>' +
                '</tr>';
        });
        tbody.innerHTML = html;

        // 绑定编辑
        tbody.querySelectorAll('.btn-edit-publisher').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var pid = parseInt(this.getAttribute('data-id'));
                var pub = pubs.find(function (p) { return p.publisherId === pid; });
                if (pub) {
                    document.getElementById('publisherModalTitle').textContent = '编辑出版社';
                    document.getElementById('publisherName').value = pub.publisherName || '';
                    document.getElementById('publishAddress').value = pub.publishAddress || '';
                    document.getElementById('publishPhone').value = pub.publishPhone || '';
                    document.getElementById('addPublisherForm').setAttribute('data-edit-id', pid);
                    openModal('addPublisherModal');
                }
            });
        });

        // 绑定删除
        tbody.querySelectorAll('.btn-delete-publisher').forEach(function (btn) {
            btn.addEventListener('click', async function () {
                var pid = parseInt(this.getAttribute('data-id'));
                if (confirm('确定删除该出版社吗？如有教材关联，操作将失败。')) {
                    var res = await deletePublisherApi(pid);
                    if (res.code === 200) {
                        showMessage('出版社已删除', 'success');
                        loadPublisherTable();
                    } else {
                        showMessage(res.message || '删除失败（可能有教材关联）', 'error');
                    }
                }
            });
        });

        applyPermissionVisibility();
    } catch (err) {
        console.error('加载出版社列表失败:', err);
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><p>加载失败</p></td></tr>';
    }
}

async function submitPublisherForm() {
    var name = document.getElementById('publisherName').value.trim();
    var address = document.getElementById('publishAddress').value.trim();
    var phone = document.getElementById('publishPhone').value.trim();

    if (!name || !address || !phone) {
        showMessage('请填写完整信息', 'warning');
        return;
    }

    var editId = document.getElementById('addPublisherForm').getAttribute('data-edit-id');

    try {
        var result;
        if (editId) {
            result = await updatePublisherApi(parseInt(editId), {
                publisherName: name,
                publishAddress: address,
                publishPhone: phone
            });
        } else {
            result = await addPublisherApi({
                publisherName: name,
                publishAddress: address,
                publishPhone: phone
            });
        }

        if (result.code === 200) {
            showMessage(editId ? '出版社更新成功' : '出版社添加成功', 'success');
        } else {
            showMessage(result.message || '操作失败', 'error');
            return;
        }

        closeModal('addPublisherModal');
        loadPublisherTable();
    } catch (err) {
        console.error('提交出版社失败:', err);
        showMessage('操作失败: ' + (err.message || '未知错误'), 'error');
    }
}

// ============================================================
// ██  入库管理页 初始化
// ============================================================

async function initStockInPage() {
    await loadPendingStock();

    // 绑定入库表单提交
    var form = document.getElementById('stockInForm');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            await submitStockInForm();
        });
    }

    // 绑定"从待入库添加教材"按钮
    var addDetailBtn = document.getElementById('addDetailBtn');
    if (addDetailBtn) {
        addDetailBtn.addEventListener('click', function () {
            addStockInDetailRow();
        });
    }

    // 加载入库历史
    await loadStockInHistory();
}

async function loadPendingStock() {
    var tbody = document.getElementById('pendingStockTableBody');
    if (!tbody) return;

    try {
        var result = await getPendingStockApi();
        if (result.code !== 200 || !result.data || result.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="empty-state"><p>暂无待入库教材</p></td></tr>';
            return;
        }

        var html = '';
        result.data.forEach(function (item) {
            html += '<tr>' +
                '<td>' + (item.bookId || '') + '</td>' +
                '<td>' + (item.bookname || '') + '</td>' +
                '<td>' + (item.isbn || '') + '</td>' +
                '<td>' + (item.author || '') + '</td>' +
                '<td>¥' + ((item.price || 0)).toFixed(2) + '</td>' +
                '<td>' + (item.quantity || 0) + '</td>' +
                '<td>' + (item.publisherName || '') + '</td>' +
                '<td>' + (item.typeName || '') + '</td>' +
                '<td>' +
                '<button class="btn btn-sm btn-stockin-quick" data-book-id="' + item.bookId + '" data-book-name="' + (item.bookname || '') + '" data-quantity="' + (item.quantity || 0) + '" data-permission="stockin:create">快速入库</button>' +
                '</td>' +
                '</tr>';
        });
        tbody.innerHTML = html;

        // 绑定快速入库
        tbody.querySelectorAll('.btn-stockin-quick').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var bookId = parseInt(this.getAttribute('data-book-id'));
                var bookName = this.getAttribute('data-book-name');
                var qty = parseInt(this.getAttribute('data-quantity'));
                // 填充入库明细
                addStockInDetailRow(bookId, bookName, qty);
            });
        });

        applyPermissionVisibility();
    } catch (err) {
        console.error('加载待入库列表失败:', err);
        tbody.innerHTML = '<tr><td colspan="9" class="empty-state"><p>加载失败</p></td></tr>';
    }
}

function addStockInDetailRow(bookId, bookName, quantity) {
    var container = document.getElementById('stockInDetails');
    if (!container) return;

    var row = document.createElement('div');
    row.className = 'demand-detail-row';
    row.innerHTML = '<input type="number" class="form-control stockin-book-id" placeholder="教材ID" value="' + (bookId || '') + '" style="flex: 1;" required>' +
        '<input type="text" class="form-control stockin-book-name" placeholder="教材名称" value="' + (bookName || '') + '" style="flex: 2;" readonly>' +
        '<input type="number" class="form-control stockin-quantity" placeholder="数量" min="1" value="' + (quantity || 1) + '" style="flex: 1;" required>' +
        '<button type="button" class="btn btn-sm btn-remove-demand-row" style="background: rgba(239,68,68,0.1); color: #ef4444;">✕</button>';

    container.appendChild(row);

    row.querySelector('.btn-remove-demand-row').addEventListener('click', function () {
        row.remove();
    });
}

async function submitStockInForm() {
    var dateInput = document.getElementById('stockInDate');
    var operatorInput = document.getElementById('operatorId');

    if (!operatorInput || !operatorInput.value) {
        showMessage('请输入操作员ID', 'warning');
        return;
    }

    var rows = document.querySelectorAll('#stockInDetails .demand-detail-row');
    var details = [];
    rows.forEach(function (row) {
        var bookId = parseInt(row.querySelector('.stockin-book-id').value);
        var quantity = parseInt(row.querySelector('.stockin-quantity').value);
        if (bookId && quantity && quantity > 0) {
            details.push({ bookId: bookId, quantity: quantity });
        }
    });

    if (details.length === 0) {
        showMessage('请至少添加一条入库明细', 'warning');
        return;
    }

    var params = {
        stockInDate: dateInput ? dateInput.value : new Date().toISOString().split('T')[0],
        operatorId: parseInt(operatorInput.value),
        details: details
    };

    try {
        var result = await addStockInApi(params);
        if (result.code === 200) {
            showMessage('入库成功', 'success');
            document.getElementById('stockInDetails').innerHTML = '';
            loadPendingStock();
            loadStockInHistory();
            if (typeof loadNavChartData === 'function') loadNavChartData();
            if (typeof loadTypeCardsAndStats === 'function') loadTypeCardsAndStats();
        } else {
            showMessage(result.message || '入库失败', 'error');
        }
    } catch (err) {
        console.error('入库失败:', err);
        showMessage('入库失败: ' + (err.message || '未知错误'), 'error');
    }
}

async function loadStockInHistory() {
    var container = document.getElementById('stockInHistoryContainer');
    if (!container) return;

    try {
        var result = await getStockInHistoryApi();
        if (result.code !== 200 || !result.data || result.data.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>暂无入库记录</p></div>';
            return;
        }

        var html = '<div class="table-container"><table><thead><tr>' +
            '<th>入库单号</th><th>日期</th><th>操作员</th><th>教材明细</th></tr></thead><tbody>';

        result.data.forEach(function (record) {
            var detailsStr = (record.details || []).map(function (d) {
                return d.bookname + ' × ' + d.quantity;
            }).join(', ');
            html += '<tr>' +
                '<td>#' + record.stockInId + '</td>' +
                '<td>' + (record.stockInDate || '') + '</td>' +
                '<td>' + (record.operatorName || '') + '</td>' +
                '<td>' + detailsStr + '</td>' +
                '</tr>';
        });
        html += '</tbody></table></div>';
        container.innerHTML = html;
    } catch (err) {
        console.error('加载入库历史失败:', err);
    }
}

// ============================================================
// ██  出库管理页 初始化
// ============================================================

async function initStockOutPage() {
    // 绑定出库表单提交
    var form = document.getElementById('stockOutForm');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            await submitStockOutForm();
        });
    }

    // 绑定添加出库明细行按钮
    var addBtn = document.getElementById('addOutDetailBtn');
    if (addBtn) {
        addBtn.addEventListener('click', function () {
            addStockOutDetailRow();
        });
    }

    // 加载出库历史
    await loadStockOutHistory();
}

function addStockOutDetailRow() {
    var container = document.getElementById('stockOutDetails');
    if (!container) return;

    var row = document.createElement('div');
    row.className = 'demand-detail-row';
    row.innerHTML = '<input type="number" class="form-control stockout-book-id" placeholder="教材ID" style="flex: 1;" required>' +
        '<input type="number" class="form-control stockout-quantity" placeholder="数量" min="1" value="1" style="flex: 1;" required>' +
        '<button type="button" class="btn btn-sm btn-remove-demand-row" style="background: rgba(239,68,68,0.1); color: #ef4444;">✕</button>';

    container.appendChild(row);

    row.querySelector('.btn-remove-demand-row').addEventListener('click', function () {
        row.remove();
    });
}

async function submitStockOutForm() {
    var dateInput = document.getElementById('stockOutDate');
    var operatorInput = document.getElementById('stockOutOperatorId');

    if (!operatorInput || !operatorInput.value) {
        showMessage('请输入操作员ID', 'warning');
        return;
    }

    var rows = document.querySelectorAll('#stockOutDetails .demand-detail-row');
    var details = [];
    rows.forEach(function (row) {
        var bookId = parseInt(row.querySelector('.stockout-book-id').value);
        var quantity = parseInt(row.querySelector('.stockout-quantity').value);
        if (bookId && quantity && quantity > 0) {
            details.push({ bookId: bookId, quantity: quantity });
        }
    });

    if (details.length === 0) {
        showMessage('请至少添加一条出库明细', 'warning');
        return;
    }

    var params = {
        stockOutDate: dateInput ? dateInput.value : new Date().toISOString().split('T')[0],
        operatorId: parseInt(operatorInput.value),
        details: details
    };

    try {
        var result = await addStockOutApi(params);
        if (result.code === 200) {
            showMessage('出库成功', 'success');
            document.getElementById('stockOutDetails').innerHTML = '';
            loadStockOutHistory();
            if (typeof loadNavChartData === 'function') loadNavChartData();
            if (typeof loadTypeCardsAndStats === 'function') loadTypeCardsAndStats();
        } else {
            showMessage(result.message || '出库失败', 'error');
        }
    } catch (err) {
        console.error('出库失败:', err);
        showMessage('出库失败: ' + (err.message || '未知错误'), 'error');
    }
}

async function loadStockOutHistory() {
    var container = document.getElementById('stockOutHistoryContainer');
    if (!container) return;

    try {
        var result = await getStockOutHistoryApi();
        if (result.code !== 200 || !result.data || result.data.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>暂无出库记录</p></div>';
            return;
        }

        var html = '<div class="table-container"><table><thead><tr>' +
            '<th>出库单号</th><th>日期</th><th>操作员</th><th>教材明细</th></tr></thead><tbody>';

        result.data.forEach(function (record) {
            var detailsStr = (record.details || []).map(function (d) {
                return d.bookname + ' × ' + d.quantity;
            }).join(', ');
            html += '<tr>' +
                '<td>#' + record.stockOutId + '</td>' +
                '<td>' + (record.stockOutDate || '') + '</td>' +
                '<td>' + (record.operatorName || '') + '</td>' +
                '<td>' + detailsStr + '</td>' +
                '</tr>';
        });
        html += '</tbody></table></div>';
        container.innerHTML = html;
    } catch (err) {
        console.error('加载出库历史失败:', err);
    }
}

// ============================================================
// ██  订购记录页 初始化
// ============================================================

async function initOrdersPage() {
    var container = document.getElementById('orderHistoryContainer');
    if (!container) return;

    try {
        var result = await getOrderHistoryApi();
        if (result.code !== 200 || !result.data || result.data.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>暂无订购记录</p></div>';
            return;
        }

        var html = '<div class="table-container"><table><thead><tr>' +
            '<th>订购单号</th><th>教材名称</th><th>ISBN</th><th>数量</th><th>供应商</th><th>订购日期</th><th>操作员</th></tr></thead><tbody>';

        result.data.forEach(function (row) {
            html += '<tr>' +
                '<td>#' + (row.OrderId || '') + '</td>' +
                '<td>' + (row.Bookname || '') + '</td>' +
                '<td>' + (row.ISBN || '') + '</td>' +
                '<td>' + (row.Quantity || 0) + '</td>' +
                '<td>' + (row.MerchantName || '') + '</td>' +
                '<td>' + (row.OrderDate || '') + '</td>' +
                '<td>' + (row.OperatorName || '') + '</td>' +
                '</tr>';
        });
        html += '</tbody></table></div>';
        container.innerHTML = html;
    } catch (err) {
        console.error('加载订购记录失败:', err);
        container.innerHTML = '<div class="empty-state"><p>加载失败</p></div>';
    }
}

// ============================================================
// ██  用户管理页 初始化
// ============================================================

async function initUsersPage() {
    await loadUserTable();

    // 绑定添加按钮
    var addBtn = document.getElementById('addUserBtn');
    if (addBtn) {
        addBtn.addEventListener('click', function () {
            document.getElementById('addUserForm').reset();
            openModal('addUserModal');
        });
    }

    // 绑定模态框关闭
    bindModalClose('addUserModal', ['userModalClose', 'userModalCancel']);

    // 绑定用户表单提交
    var form = document.getElementById('addUserForm');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            await submitUserForm();
        });
    }
}

async function loadUserTable() {
    var tbody = document.getElementById('userTableBody');
    if (!tbody) return;

    try {
        var result = await getUserListApi();
        if (result.code !== 200 || !result.data) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><p>暂无用户</p></td></tr>';
            return;
        }

        var users = result.data;
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><p>暂无用户</p></td></tr>';
            return;
        }

        var roleLabels = {
            'Admin': '管理员',
            'StockOperator': '库存操作员',
            'DemandProvider': '需求提出者',
            'Viewer': '只读人员'
        };

        var html = '';
        users.forEach(function (u) {
            html += '<tr>' +
                '<td>' + u.userId + '</td>' +
                '<td>' + (u.username || '') + '</td>' +
                '<td>' + (u.displayName || '') + '</td>' +
                '<td>' + (roleLabels[u.roleName] || u.roleName || '') + '</td>' +
                '<td>' + (u.isActive ? '✅ 正常' : '❌ 禁用') + '</td>' +
                '<td>' + (u.createdAt || '') + '</td>' +
                '<td>' +
                '<button class="btn btn-sm btn-delete-user" data-id="' + u.userId + '" style="background: rgba(239,68,68,0.1); color: #ef4444;" data-permission="user:delete">删除</button>' +
                '</td>' +
                '</tr>';
        });
        tbody.innerHTML = html;

        // 绑定删除
        tbody.querySelectorAll('.btn-delete-user').forEach(function (btn) {
            btn.addEventListener('click', async function () {
                var uid = parseInt(this.getAttribute('data-id'));
                if (confirm('确定删除该用户吗？')) {
                    var res = await deleteUserApi(uid);
                    if (res.code === 200) {
                        showMessage('用户已删除', 'success');
                        loadUserTable();
                    } else {
                        showMessage(res.message || '删除失败', 'error');
                    }
                }
            });
        });

        applyPermissionVisibility();
    } catch (err) {
        console.error('加载用户列表失败:', err);
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><p>加载失败</p></td></tr>';
    }
}

async function submitUserForm() {
    var username = document.getElementById('newUsername').value.trim();
    var password = document.getElementById('newPassword').value.trim();
    var displayName = document.getElementById('newDisplayName').value.trim();
    var roleName = document.getElementById('newRole').value;

    if (!username || !password || !displayName || !roleName) {
        showMessage('请填写完整信息', 'warning');
        return;
    }

    try {
        var result = await addUserApi({
            username: username,
            password: password,
            displayName: displayName,
            roleName: roleName
        });
        if (result.code === 200) {
            showMessage('用户添加成功', 'success');
            closeModal('addUserModal');
            loadUserTable();
        } else {
            showMessage(result.message || '添加失败', 'error');
        }
    } catch (err) {
        console.error('添加用户失败:', err);
        showMessage('添加失败: ' + (err.message || '未知错误'), 'error');
    }
}

// ============================================================
// 通用模态框关闭绑定辅助函数
// ============================================================

function bindModalClose(modalId, buttonIds) {
    var modal = document.getElementById(modalId);
    if (!modal) return;

    // 绑定关闭按钮
    buttonIds.forEach(function (btnId) {
        var btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', function () {
                closeModal(modalId);
            });
        }
    });

    // 点击遮罩层关闭
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeModal(modalId);
        }
    });
}
