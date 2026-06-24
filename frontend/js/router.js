/**
 * 单页滚动渲染模块
 *
 * 将所有页面内容一次性渲染到 #page-container，导航链接点击 → 平滑滚动定位
 * 包含：仪表盘 Hero、教材管理、出版社、入库、出库 五个 section 的 HTML 模板
 */

/** 所有 section ID 列表（与导航栏 data-page 对应） */
const SECTION_IDS = ['navigation', 'demands', 'books', 'publishers', 'stock-in', 'stock-out', 'orders'];

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
                    <!-- 隐藏字段：出版社ID，由订购按钮动态赋值 -->
                    <input type="hidden" id="orderPublisherId" name="publisherId" value="">
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
    { page: 'orders',     icon: '🛒', label: '订购记录',   permission: 'role:manage' }
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
 * 关闭所有模态框
 */
function closeAllModals() {
    document.querySelectorAll('.modal-overlay.show').forEach(modal => {
        modal.classList.remove('show');
    });
}
