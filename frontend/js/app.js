/**
 * 主应用逻辑模块
 *
 * 负责：应用初始化 → 登录 → 首页欢迎屏 → 主应用界面 的完整流程
 * 包含事件绑定、页面切换、导航滚动效果、背景视差、Reveal 渐显等
 */

// ============================================================
// DOMContentLoaded 入口：初始化全部子系统
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    // 初始化应用 - 显示登录页面
    initApp();
    initParallaxBackground();

    // 绑定登录事件
    bindLoginEvent();

    // 绑定首页进入按钮事件
    bindHomeEnterEvent();

    // 初始化导航栏滚动效果
    initNavbarScroll();
});


// ============================================================
// 登录页面：显示/隐藏/表单提交
// ============================================================

/**
 * 显示登录页面
 */
function showLoginPage() {
    const loginPage = document.getElementById('loginPage');
    const homePage = document.getElementById('homePage');
    const appMain = document.getElementById('appMain');
    
    if (loginPage) {
        loginPage.style.display = '';
        loginPage.classList.remove('hidden');
    }
    if (homePage) {
        homePage.style.display = 'none';
        homePage.classList.remove('hidden');
    }
    if (appMain) {
        appMain.classList.remove('show');
        appMain.style.display = 'none';
    }
}

/**
 * 隐藏登录页面
 */
function hideLoginPage() {
    const loginPage = document.getElementById('loginPage');
    if (loginPage) {
        loginPage.style.display = 'none';
    }
}

/**
 * 绑定登录事件
 */
function bindLoginEvent() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(loginForm);
        const params = {
            username: formData.get('username') || 'admin',
            password: formData.get('password') || '123456'
        };

        const result = await loginApi(params);
        if (result.code === 200 && result.data) {
            sessionStorage.setItem('auth_token', result.data.token);
            sessionStorage.setItem('user_info', JSON.stringify(result.data.userInfo));
            sessionStorage.setItem('user_permissions', JSON.stringify(result.data.permissions || []));

            showMessage('登录成功', 'success');
            
            // 登录成功后显示首页欢迎页
            hideLoginPage();
            showHomePage();
        } else {
            showMessage(result.message || '登录失败', 'error');
        }
    });
}


// ============================================================
// 首页欢迎屏：显示/隐藏/进入按钮 → 转场动画进入主应用
// ============================================================

/**
 * 显示首页欢迎页
 */
function showHomePage() {
    const homePage = document.getElementById('homePage');
    const appMain = document.getElementById('appMain');
    if (homePage) {
        homePage.style.display = '';
        homePage.classList.remove('hidden');
    }
    if (appMain) {
        appMain.classList.remove('show');
        appMain.style.display = 'none';
    }
}

/**
 * 隐藏首页欢迎屏，淡出后切入主应用（含 800ms CSS 转场动画）
 * 一次性渲染全部单页区域、绑定导航事件、初始化滚动监听
 */
function enterApp() {
    const homePage = document.getElementById('homePage');
    const appMain = document.getElementById('appMain');

    if (!homePage || !appMain) return;

    // 首页淡出
    homePage.classList.add('hidden');

    // 动画结束后显示主应用
    setTimeout(() => {
        homePage.style.display = 'none';
        appMain.style.display = 'flex';
        // 触发重排以启动动画
        void appMain.offsetWidth;
        appMain.classList.add('show');

        // 显示主界面
        showMainLayout();
        
        // 更新用户信息
        const userInfo = getStoredUserInfo();
        updateUserDisplay(userInfo);
        
        // 动态渲染导航链接（根据用户权限）
        renderDynamicNavigation();

        // 一次性渲染所有内容区域
        const container = document.getElementById('page-container');
        if (container) {
            container.innerHTML = renderAllSections();
        }

        // 将模态框移到 body 末尾，确保 position: fixed 相对于视口定位
        moveModalsToBody();

        // 初始化所有区域
        initAllSections();

        // 绑定导航栏点击事件（改为滚动定位）
        bindNavEvents();

        // 绑定退出登录事件
        bindLogoutEvent();

        // 初始化滚动监听（导航高亮 + 渐显效果）
        initScrollSpy();

        // 应用权限可见性控制 + 初始化全局权限守卫
        applyPermissionVisibility();
        hideNoPermissionSections();
        if (!window.__permissionGuardInited) {
            initPermissionGuard();
            window.__permissionGuardInited = true;
        }
    }, 800); // 与 CSS transition 时间匹配
}


/**
 * 应用入口：检查 sessionStorage 中的 token，决定显示登录页还是首页
 */
function initApp() {
    // 检查是否已登录（sessionStorage 中有 token）
    const token = getToken();
    const userInfo = getStoredUserInfo();
    
    if (token && userInfo) {
        // 已登录，直接显示首页欢迎页
        hideLoginPage();
        showHomePage();
    } else {
        // 未登录，显示登录页面
        showLoginPage();
    }
}

/**
 * 双圆环进入按钮 + 底部文字双重点击绑定
 */
function bindHomeEnterEvent() {
    const enterBtn = document.getElementById('homeEnterBtn');
    const enterText = document.getElementById('homeEnterText');
    const clickHandler = function () {
        enterApp();
    };
    if (enterBtn) {
        enterBtn.addEventListener('click', clickHandler);
    }
    if (enterText) {
        enterText.addEventListener('click', clickHandler);
    }
}



/**
 * 显示主界面布局
 */
function showMainLayout() {
    document.getElementById('main-content').classList.remove('login-page');
}

/**
 * 更新用户信息显示
 * @param {object} userInfo - 用户信息
 */
function updateUserDisplay(userInfo) {
    const displayEl = document.getElementById('userDisplayNav');
    if (displayEl && userInfo) {
        displayEl.textContent = `${userInfo.displayName} (${userInfo.roleName || userInfo.role})`;
    }
}

/**
 * 液态玻璃导航栏事件绑定：
 * - 点击导航链接 → 平滑滚动到对应 section
 * - hover 浮动指示器（浅灰胶囊平滑跟随）
 */
function bindNavEvents() {
    const navCenter = document.querySelector('.liquid-nav-center');
    const indicator = document.getElementById('navIndicator');
    const navLinks = document.querySelectorAll('.liquid-nav-link');

    // 点击事件 - 滚动到对应区域
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const page = this.dataset.page;
            if (page) {
                scrollToSection(page);
            }
        });
    });

    // 指示器 hover 跟随效果（保持原有样式不变）
    if (navCenter && indicator && navLinks.length > 0) {
        let activeLink = navCenter.querySelector('.liquid-nav-link.active');

        function moveIndicator(targetLink) {
            const linkRect = targetLink.getBoundingClientRect();
            const centerRect = navCenter.getBoundingClientRect();
            indicator.style.left = (linkRect.left - centerRect.left) + 'px';
            indicator.style.width = linkRect.width + 'px';
            indicator.style.opacity = '1';
        }

        function hideIndicator() {
            if (activeLink) {
                moveIndicator(activeLink);
            } else {
                indicator.style.opacity = '0';
            }
        }

        navLinks.forEach(link => {
            link.addEventListener('mouseenter', function () {
                moveIndicator(this);
            });
            link.addEventListener('mouseleave', function () {
                hideIndicator();
            });
        });

        if (activeLink) {
            moveIndicator(activeLink);
        }
    }
}

/**
 * IntersectionObserver 滚动监听：
 * - 根据当前可见 section 自动高亮对应导航链接
 * - 同步移动 hover 指示器到 active 链接位置
 */
function initScrollSpy() {
    const sections = document.querySelectorAll('.page-section');
    const navLinks = document.querySelectorAll('.liquid-nav-link');
    const indicator = document.getElementById('navIndicator');
    const navCenter = document.querySelector('.liquid-nav-center');

    if (sections.length === 0) return;

    // IntersectionObserver 用于滚动监听
    const spyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const navName = entry.target.dataset.nav;
                if (navName) {
                    // 更新导航高亮
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.dataset.page === navName);
                    });
                    // 更新指示器位置
                    if (navCenter && indicator) {
                        const activeLink = navCenter.querySelector('.liquid-nav-link.active');
                        if (activeLink) {
                            const linkRect = activeLink.getBoundingClientRect();
                            const centerRect = navCenter.getBoundingClientRect();
                            indicator.style.left = (linkRect.left - centerRect.left) + 'px';
                            indicator.style.width = linkRect.width + 'px';
                            indicator.style.opacity = '1';
                        }
                    }
                }
            }
        });
    }, {
        threshold: 0.25,
        rootMargin: '-80px 0px -40% 0px'
    });

    sections.forEach(section => spyObserver.observe(section));
    window.__spyObserver = spyObserver;

    // 初始化 reveal on scroll 观察器（渐显效果）
    initRevealOnScroll();
}

/**
 * 手动更新液态导航高亮（外部调用兼容接口）
 */
function updateLiquidNavHighlight(pageName) {
    const navCenter = document.querySelector('.liquid-nav-center');
    const indicator = document.getElementById('navIndicator');

    document.querySelectorAll('.liquid-nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageName);
    });

    if (navCenter && indicator) {
        const activeLink = navCenter.querySelector('.liquid-nav-link.active');
        if (activeLink) {
            const linkRect = activeLink.getBoundingClientRect();
            const centerRect = navCenter.getBoundingClientRect();
            indicator.style.left = (linkRect.left - centerRect.left) + 'px';
            indicator.style.width = linkRect.width + 'px';
            indicator.style.opacity = '1';
        }
    }
}

/**
 * 绑定退出登录事件
 */
function bindLogoutEvent() {
    const logoutBtn = document.getElementById('logoutBtnNav');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            // 清除登录信息
            sessionStorage.removeItem('auth_token');
            sessionStorage.removeItem('user_info');
            sessionStorage.removeItem('user_permissions');
            showMessage('已退出登录', 'info');
            
            // 隐藏主应用，显示登录页面
            const appMain = document.getElementById('appMain');
            const homePage = document.getElementById('homePage');
            if (appMain) {
                appMain.classList.remove('show');
                appMain.style.display = 'none';
            }
            if (homePage) {
                homePage.style.display = 'none';
            }
            showLoginPage();
        });
    }
}

// ============================================================
// Reveal on Scroll：元素滚动进入视口时渐显
// ============================================================

/**
 * 初始化 IntersectionObserver：.reveal 元素进入视口时添加 .revealed
 * 不支持 IntersectionObserver 的浏览器直接显示全部元素
 */
function initRevealOnScroll() {
    if (!('IntersectionObserver' in window)) {
        // 降级处理：直接显示所有元素
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
        return;
    }

    // 如果已有观察器则先断开
    if (window.__revealObserver) {
        window.__revealObserver.disconnect();
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
    });

    // 观察所有带 reveal 类的元素
    document.querySelectorAll('.reveal').forEach(el => {
        if (!el.classList.contains('revealed')) {
            observer.observe(el);
        }
    });

    window.__revealObserver = observer;
}

/**
 * 为动态加载的内容添加渐显观察
 */
function observeNewReveals() {
    if (window.__revealObserver) {
        document.querySelectorAll('.reveal:not(.revealed)').forEach(el => {
            window.__revealObserver.observe(el);
        });
    }
}

// ============================================================
// 导航栏滚动效果
// ============================================================

/**
 * requestAnimationFrame 节流 + 滞回区间（50px 阈值）：
 * 滚动超过 50px → 内层胶囊收缩 + 回到顶部 → 恢复全宽透明
 */
function initNavbarScroll() {
    const navbarInner = document.querySelector('.liquid-navbar-inner');
    if (!navbarInner) return;

    let ticking = false;
    let isScrolled = false;

    function updateNavbar() {
        const scrollY = window.scrollY || window.pageYOffset;
        // 使用滞回区间：滚动超过 50px 才变为 scrolled，回到 0 才恢复
        const shouldBeScrolled = isScrolled ? scrollY > 0 : scrollY > 50;

        // 只有状态真正改变时才更新 DOM，避免边界反复切换
        if (shouldBeScrolled !== isScrolled) {
            isScrolled = shouldBeScrolled;
            if (isScrolled) {
                navbarInner.classList.add('scrolled');
            } else {
                navbarInner.classList.remove('scrolled');
            }
        }
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    });

    // 初始检查
    updateNavbar();
}

// ============================================================
// 背景光晕视差：滚动时三个光球按不同速度和方向微移
// ============================================================

/**
 * 初始化背景视差效果
 */
function initParallaxBackground() {
    const orbs = document.querySelectorAll('.bg-orb');
    if (orbs.length === 0) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                const progress = maxScroll > 0 ? scrollY / maxScroll : 0;

                orbs.forEach((orb, index) => {
                    const speed = 0.1 + (index * 0.05);
                    const direction = index % 2 === 0 ? 1 : -1;
                    const moveY = progress * 100 * speed * direction;
                    const moveX = progress * 50 * speed * direction;
                    orb.style.transform = orb.style.transform.replace(/translate\([^)]+\)/, '') + ` translate(${moveX}px, ${moveY}px)`;
                });

                ticking = false;
            });
            ticking = true;
        }
    });
}

// ============================================================
// 全部页面区域并行初始化入口
// ============================================================

/**
 * 初始化所有内容区域
 */
async function initAllSections() {
    // 并行初始化各区域
    await Promise.all([
        initNavigationPage(),
        initDemandsPage(),
        initBooksPage(),
        initPublishersPage(),
        initStockInPage(),
        initStockOutPage(),
        initOrdersPage(),
        initUsersPage()
    ]);
}

/**
 * 动态渲染导航链接（根据用户权限）
 */
function renderDynamicNavigation() {
    const navContainer = document.getElementById('dynamicNavLinks');
    if (!navContainer) return;
    navContainer.innerHTML = renderDynamicNavLinks();
}

// ============================================================
// 0. 需求管理页面：需求列表 + 创建需求 + 取消需求
// ============================================================

/**
 * 初始化需求管理页面
 */
async function initDemandsPage() {
    let currentStatus = '';

    // 加载需求列表
    await loadDemandList(currentStatus);

    // 状态过滤按钮
    document.querySelectorAll('.demand-filter-btn').forEach(btn => {
        btn.addEventListener('click', async function () {
            document.querySelectorAll('.demand-filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentStatus = this.dataset.status || '';
            await loadDemandList(currentStatus);
        });
    });

    // 创建需求按钮
    const addDemandBtn = document.getElementById('addDemandBtn');
    const demandModal = document.getElementById('addDemandModal');
    const demandModalClose = document.getElementById('demandModalClose');
    const demandModalCancel = document.getElementById('demandModalCancel');
    const addDemandForm = document.getElementById('addDemandForm');

    if (addDemandBtn && demandModal) {
        addDemandBtn.addEventListener('click', async () => {
            // 加载教材列表到下拉框
            await populateDemandBookSelects();
            demandModal.classList.add('show');
        });
    }

    if (demandModalClose) demandModalClose.addEventListener('click', () => demandModal.classList.remove('show'));
    if (demandModalCancel) demandModalCancel.addEventListener('click', () => demandModal.classList.remove('show'));
    if (demandModal) {
        demandModal.addEventListener('click', (e) => {
            if (e.target === demandModal) demandModal.classList.remove('show');
        });
    }

    // 添加明细行按钮
    const addRowBtn = document.getElementById('addDemandDetailRowBtn');
    if (addRowBtn) {
        addRowBtn.addEventListener('click', async () => {
            const container = document.getElementById('demandDetailRows');
            const row = document.createElement('div');
            row.className = 'demand-detail-row';
            row.innerHTML = `
                <select class="form-control demand-book-select" style="flex: 2;" required>
                    <option value="">请选择教材...</option>
                </select>
                <input type="number" class="form-control demand-quantity-input" placeholder="数量" min="1" value="1" style="flex: 1;" required>
                <button type="button" class="btn btn-sm btn-remove-demand-row" style="background: rgba(239,68,68,0.1); color: #ef4444;">✕</button>
            `;
            container.appendChild(row);
            // 为新行的下拉框填充教材数据
            await populateSingleDemandBookSelect(row.querySelector('.demand-book-select'));
            // 绑定删除按钮
            row.querySelector('.btn-remove-demand-row').addEventListener('click', () => row.remove());
        });
    }

    // 初始化所有现有行的删除按钮和教材下拉
    document.querySelectorAll('.btn-remove-demand-row').forEach(btn => {
        btn.addEventListener('click', function () {
            const rows = document.querySelectorAll('#demandDetailRows .demand-detail-row');
            if (rows.length > 1) {
                this.closest('.demand-detail-row').remove();
            } else {
                showMessage('至少保留一行明细', 'warning');
            }
        });
    });

    // 提交需求表单
    if (addDemandForm) {
        addDemandForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addDemandForm);

            // 收集明细
            const details = [];
            const rows = document.querySelectorAll('#demandDetailRows .demand-detail-row');
            let hasError = false;
            rows.forEach(row => {
                const select = row.querySelector('.demand-book-select');
                const quantityInput = row.querySelector('.demand-quantity-input');
                // 检查下拉框是否已加载教材选项
                if (!select || select.options.length <= 1) {
                    hasError = true;
                    showMessage('教材列表尚未加载，请关闭弹窗后重新打开', 'warning');
                    return;
                }
                if (!select.value) {
                    hasError = true;
                    return;
                }
                const selectedOption = select.selectedOptions[0];
                details.push({
                    bookId: parseInt(select.value),
                    bookname: selectedOption.textContent,
                    quantity: parseInt(quantityInput.value) || 1
                });
            });

            if (hasError || details.length === 0) {
                showMessage('请为每行选择教材', 'warning');
                return;
            }

            const params = {
                demandTitle: formData.get('demandTitle') || '未命名需求',
                notes: formData.get('demandNotes') || '',
                details: details
            };

            const result = await addDemandApi(params);
            if (result.code === 200) {
                showMessage('需求创建成功！库存操作员可查看并处理', 'success');
                demandModal.classList.remove('show');
                addDemandForm.reset();
                // 重置明细行
                const container = document.getElementById('demandDetailRows');
                container.innerHTML = `
                    <div class="demand-detail-row">
                        <select class="form-control demand-book-select" style="flex: 2;" required>
                            <option value="">请选择教材...</option>
                        </select>
                        <input type="number" class="form-control demand-quantity-input" placeholder="数量" min="1" value="1" style="flex: 1;" required>
                        <button type="button" class="btn btn-sm btn-remove-demand-row" style="background: rgba(239,68,68,0.1); color: #ef4444;">✕</button>
                    </div>
                `;
                await loadDemandList(currentStatus);
            } else {
                showMessage(result.message || '创建失败', 'error');
            }
        });
    }

    // 应用权限可见性
    applyPermissionVisibility();
}

/**
 * 加载需求列表
 * @param {string} status - 状态过滤
 */
async function loadDemandList(status) {
    const container = document.getElementById('demandListContainer');
    if (!container) return;

    try {
        const result = await getDemandListApi({ status });
        if (result.code !== 200 || !result.data) {
            container.innerHTML = '<div class="empty-state"><p>加载失败</p></div>';
            return;
        }

        const demands = result.data;
        if (demands.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>暂无需求记录</p></div>';
            return;
        }

        const statusLabels = { active: '🟡 进行中', ordered: '🔵 已订购', fulfilled: '🟢 已完成', cancelled: '⚫ 已取消' };
        const statusClasses = { active: 'status-active', ordered: 'status-ordered', fulfilled: 'status-fulfilled', cancelled: 'status-cancelled' };

        container.innerHTML = demands.map(d => `
            <div class="demand-card reveal">
                <div class="demand-card-header">
                    <div class="demand-card-title">
                        <h3>${d.demandTitle}</h3>
                        <span class="demand-status-badge ${statusClasses[d.status] || ''}">${statusLabels[d.status] || d.status}</span>
                    </div>
                    <div class="demand-card-meta">
                        <span>提出人：${d.requesterName}</span>
                        <span>日期：${d.demandDate}</span>
                        ${d.notes ? `<span>备注：${d.notes}</span>` : ''}
                    </div>
                </div>
                <div class="demand-card-body">
                    <table class="demand-detail-table">
                        <thead>
                            <tr>
                                <th>教材名称</th>
                                <th>需求量</th>
                                <th>已满足</th>
                                <th>进度</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(d.details || []).map(dd => {
                                const pct = dd.quantity > 0 ? Math.min(100, Math.round((dd.fulFilledQuantity / dd.quantity) * 100)) : 0;
                                return `
                                <tr>
                                    <td>${dd.bookname}</td>
                                    <td>${dd.quantity}</td>
                                    <td>${dd.fulFilledQuantity || 0}</td>
                                    <td>
                                        <div class="demand-progress-bar">
                                            <div class="demand-progress-fill ${pct >= 100 ? 'fulfilled' : ''}" style="width: ${pct}%"></div>
                                        </div>
                                        <span class="demand-progress-text">${pct}%</span>
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="demand-card-footer">
                    ${d.status === 'active' ? `
                    <button class="btn btn-sm btn-cancel-demand" data-demand-id="${d.demandId}" data-permission="demand:delete"
                            style="background: rgba(239,68,68,0.08); color: #ef4444;">取消需求</button>
                    ` : ''}
                    ${d.status === 'active' || d.status === 'ordered' ? `
                    <button class="btn btn-sm btn-order-from-demand" data-demand-id="${d.demandId}" data-permission="order:create"
                            style="background: rgba(102,126,234,0.1); color: #667eea;">📦 为此需求订购</button>
                    ` : ''}
                </div>
            </div>
        `).join('');

        // 绑定取消需求按钮
        container.querySelectorAll('.btn-cancel-demand').forEach(btn => {
            btn.addEventListener('click', async function () {
                const demandId = parseInt(this.dataset.demandId);
                if (confirm('确定要取消此需求吗？')) {
                    const result = await cancelDemandApi(demandId);
                    if (result.code === 200) {
                        showMessage('需求已取消', 'info');
                        await loadDemandList(status);
                    }
                }
            });
        });

        // 绑定"为此需求订购"按钮 → 自动补全信息，直接创建订购单
        container.querySelectorAll('.btn-order-from-demand').forEach(btn => {
            btn.addEventListener('click', async function () {
                const demandId = parseInt(this.dataset.demandId);
                const demand = demands.find(d => d.demandId === demandId);
                if (!demand || !demand.details || demand.details.length === 0) {
                    showMessage('该需求没有教材明细', 'warning');
                    return;
                }

                // 筛选未完全满足的明细
                const unfilled = demand.details.filter(dd =>
                    (dd.fulFilledQuantity || 0) < dd.quantity
                );
                if (unfilled.length === 0) {
                    showMessage('该需求已全部满足，无需订购', 'info');
                    return;
                }

                // 确认订购
                const totalQty = unfilled.reduce((s, dd) => s + dd.quantity - (dd.fulFilledQuantity || 0), 0);
                const bookList = unfilled.map(dd =>
                    `  · ${dd.bookname} ×${dd.quantity - (dd.fulFilledQuantity || 0)}`
                ).join('\n');
                if (!confirm(`确认为需求「${demand.demandTitle}」订购以下教材？\n\n${bookList}\n\n共 ${totalQty} 本，将直接加入待入库清单。`)) {
                    return;
                }

                // 获取当前用户信息
                const userInfo = getStoredUserInfo();
                const operatorId = userInfo ? userInfo.userId : 3;

                // 逐本教材创建订购单（直接调用后端，不走模态框）
                let successCount = 0;
                for (const dd of unfilled) {
                    const remainQty = dd.quantity - (dd.fulFilledQuantity || 0);
                    try {
                        const orderResult = await request('/orders', {
                            method: 'POST',
                            body: JSON.stringify({
                                merchantName: '需求订购',
                                merchantPhone: '-',
                                operatorId: operatorId,
                                demandId: demandId,
                                details: [{
                                    bookId: dd.bookId,
                                    quantity: remainQty
                                }]
                            })
                        });
                        if (orderResult.code === 200) {
                            successCount++;
                        }
                    } catch (err) {
                        console.error(`订购 ${dd.bookname} 失败:`, err);
                    }
                }

                if (successCount > 0) {
                    showMessage(`成功为需求订购 ${successCount} 种教材，共 ${totalQty} 本，已加入待入库清单`, 'success');
                    // 刷新需求列表以更新状态
                    await loadDemandList(currentStatus);
                    // 刷新待入库表格和下拉选项
                    await refreshPendingStockTable();
                    refreshAllStockInSelects();
                } else {
                    showMessage('订购失败，请稍后重试', 'error');
                }
            });
        });

        // 应用权限可见性
        applyPermissionVisibility();
        observeNewReveals();
    } catch (error) {
        console.error('加载需求列表失败:', error);
        container.innerHTML = '<div class="empty-state"><p>加载失败</p></div>';
    }
}

/**
 * 为需求模态框的教材下拉框填充数据
 */
async function populateDemandBookSelects() {
    const selects = document.querySelectorAll('#demandDetailRows .demand-book-select');
    for (const select of selects) {
        await populateSingleDemandBookSelect(select);
    }
}

/**
 * 为单个教材下拉框填充数据
 */
async function populateSingleDemandBookSelect(select) {
    try {
        const result = await getBookListApi({ pageNum: 1, pageSize: 1000 });
        if (result.code === 200 && result.data && result.data.rows && result.data.rows.length > 0) {
            const currentValue = select.value;
            select.innerHTML = '<option value="">请选择教材...</option>' +
                result.data.rows.map(b => `<option value="${b.bookId}">${b.bookname} (${b.publisherName} | 库存: ${b.stock})</option>`).join('');
            if (currentValue) select.value = currentValue;
        } else {
            console.warn('教材列表为空或加载失败', result);
            showMessage('加载教材列表失败，请刷新页面后重试', 'error');
        }
    } catch (e) {
        console.error('加载教材列表失败:', e);
        showMessage('加载教材列表失败: ' + (e.message || '网络错误'), 'error');
    }
}

// ============================================================
// 1. 教材管理页面：类型卡片网格 → 展开教材列表 → 订购/编辑/删除
// ============================================================

/**
 * 加载教材类型和出版社下拉选项（兜底函数，优先使用 router.js 的 loadOrderFormOptions）
 */
async function populateFormSelects() {
    try {
        const [typeResult, pubResult] = await Promise.all([
            getTypeListApi(),
            getPublisherListApi()
        ]);

        const typeSelect = document.getElementById('typeId');
        if (typeSelect && typeResult.code === 200 && typeResult.data) {
            let html = '<option value="">请选择类型...</option>';
            typeResult.data.forEach(t => {
                html += `<option value="${t.typeId}">${t.typeName || ''}</option>`;
            });
            typeSelect.innerHTML = html;
        }

        const pubSelect = document.getElementById('orderPublisherId');
        if (pubSelect && pubResult.code === 200 && pubResult.data) {
            let html = '<option value="">请选择出版社...</option>';
            pubResult.data.forEach(p => {
                html += `<option value="${p.publisherId}">${p.publisherName || ''}</option>`;
            });
            pubSelect.innerHTML = html;
        }
    } catch (err) {
        console.error('加载表单选项失败:', err);
    }
}

/**
 * 初始化教材管理页面
 */
async function initBooksPage() {
    const searchInput = document.getElementById('bookSearchInput');
    const searchBtn = document.getElementById('bookSearchBtn');
    const modal = document.getElementById('addBookModal');
    const modalClose = document.getElementById('modalClose');
    const modalCancel = document.getElementById('modalCancel');
    const addForm = document.getElementById('addBookForm');
    const collapseBtn = document.getElementById('collapseBookListBtn');

    // 当前展开的类型ID（null 表示未展开）
    window.__expandedTypeId = null;
    window.__expandedTypeName = '';
    window.__currentKeyword = '';

    // 加载统计数据
    await loadBooksStatistics();

    // 加载类型卡片
    await loadTypeCards('');

    // 搜索事件
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', async () => {
            window.__currentKeyword = searchInput.value.trim();
            window.__expandedTypeId = null;
            document.getElementById('bookListSection').style.display = 'none';
            await loadTypeCards(window.__currentKeyword);
        });
        searchInput.addEventListener('keyup', async (e) => {
            if (e.key === 'Enter') {
                window.__currentKeyword = searchInput.value.trim();
                window.__expandedTypeId = null;
                document.getElementById('bookListSection').style.display = 'none';
                await loadTypeCards(window.__currentKeyword);
            }
        });
    }

    // 收起按钮
    if (collapseBtn) {
        collapseBtn.addEventListener('click', () => {
            window.__expandedTypeId = null;
            document.getElementById('bookListSection').style.display = 'none';
            document.getElementById('typeCardGrid').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // 关闭模态框
    if (modalClose) modalClose.addEventListener('click', () => modal.classList.remove('show'));
    if (modalCancel) modalCancel.addEventListener('click', () => modal.classList.remove('show'));
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('show');
        });
    }

    // 绑定"订购教材"按钮（打开模态框并加载类型/出版社下拉选项）
    const orderBtn = document.getElementById('openOrderBookBtn');
    if (orderBtn) {
        orderBtn.addEventListener('click', async () => {
            closeAllModals();
            // 重置为订购模式
            document.querySelector('#addBookModal .modal-header h3').textContent = '订购教材';
            delete addForm.dataset.editId;
            addForm.reset();
            const qtyGroup = document.getElementById('bookQuantity');
            if (qtyGroup) {
                const group = qtyGroup.closest('.form-group');
                if (group) group.style.display = '';
            }
            document.querySelector('#addBookForm button[type="submit"]').textContent = '确认订购';
            modal.classList.add('show');
            // 加载类型和出版社下拉选项
            if (typeof loadOrderFormOptions === 'function') {
                await loadOrderFormOptions();
            } else {
                await populateFormSelects();
            }
        });
    }

    // 提交订购/编辑教材表单
    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addForm);
            const params = {
                bookname: formData.get('bookname') || '默认教材名称',
                isbn: formData.get('isbn') || 'ISBN0000000001',
                author: formData.get('author') || '默认作者',
                price: parseFloat(formData.get('price')) || 39.9,
                publisherId: parseInt(formData.get('publisherId')) || 1,
                typeId: parseInt(formData.get('typeId')) || 1,
                publishDate: formData.get('publishDate') || '2024-01-01'
            };

            let result;
            if (addForm.dataset.editId) {
                // 编辑模式：更新已有教材
                result = await updateBookApi(parseInt(addForm.dataset.editId), params);
                if (result.code === 200) {
                    showMessage('教材更新成功', 'success');
                    modal.classList.remove('show');
                    addForm.reset();
                    delete addForm.dataset.editId;
                    // 刷新教材列表
                    if (window.__expandedTypeId) {
                        await refreshBookTable(window.__expandedTypeId, window.__expandedTypeName, window.__currentKeyword || '');
                    }
                } else {
                    showMessage(result.message || '更新失败', 'error');
                }
            } else {
                // 订购模式：创建订购记录
                const orderParams = {
                    ...params,
                    quantity: parseInt(formData.get('bookQuantity')) || 1
                };
                result = await orderBookApi(orderParams);
                if (result.code === 200) {
                    showMessage('教材订购成功，已加入待入库列表', 'success');
                    modal.classList.remove('show');
                    addForm.reset();
                    // 刷新待入库表格和下拉选项
                    await refreshPendingStockTable();
                    refreshAllStockInSelects();
                } else {
                    showMessage(result.message || '订购失败', 'error');
                }
            }
        });
    }

    // 编辑/删除按钮事件委托（绑定在教材列表 tbody 上）
    const bookTableBody = document.getElementById('bookTableBody');
    if (bookTableBody) {
        bookTableBody.addEventListener('click', function(e) {
            const editBtn = e.target.closest('.btn-edit');
            const deleteBtn = e.target.closest('.btn-delete');
            
            if (editBtn) {
                closeAllModals();
                document.querySelector('#addBookModal .modal-header h3').textContent = '编辑教材';
                addForm.dataset.editId = editBtn.dataset.bookId;
                // 编辑模式隐藏订购数量字段
                const qtyGroup = document.getElementById('bookQuantity');
                if (qtyGroup) {
                    const group = qtyGroup.closest('.form-group');
                    if (group) group.style.display = 'none';
                }
                document.querySelector('#addBookForm button[type="submit"]').textContent = '确认更新';
                modal.classList.add('show');
                // 先加载下拉选项，再填充值
                const populateAndFill = async () => {
                    if (typeof loadOrderFormOptions === 'function') {
                        await loadOrderFormOptions();
                    } else {
                        await populateFormSelects();
                    }
                    document.getElementById('bookname').value = editBtn.dataset.bookName || '';
                    document.getElementById('isbn').value = editBtn.dataset.bookIsbn || '';
                    document.getElementById('author').value = editBtn.dataset.bookAuthor || '';
                    document.getElementById('price').value = editBtn.dataset.bookPrice || '';
                    document.getElementById('orderPublisherId').value = editBtn.dataset.bookPublisherId || '';
                    document.getElementById('typeId').value = editBtn.dataset.bookTypeId || '';
                    document.getElementById('publishDate').value = editBtn.dataset.bookPublishDate || '';
                };
                populateAndFill();
            }
            
            if (deleteBtn) {
                const bookId = deleteBtn.dataset.bookId;
                const bookName = deleteBtn.closest('tr').querySelector('td:nth-child(2)').textContent;
                if (confirm(`确定要删除教材「${bookName}」吗？此操作不可恢复。`)) {
                    deleteBookApi(parseInt(bookId)).then(result => {
                        if (result.code === 200) {
                            showMessage('教材删除成功', 'success');
                            loadTypeCards(window.__currentKeyword);
                            if (window.__expandedTypeId !== null) {
                                loadBookListByType(window.__expandedTypeId, window.__expandedTypeName, window.__currentKeyword);
                            }
                        } else {
                            showMessage(result.message || '删除失败', 'error');
                        }
                    });
                }
            }
        });
    }

    observeNewReveals();
}

/**
 * 加载教材页顶部统计卡片数据（总量、类型数、库存、出版社数）
 */
async function loadBooksStatistics() {
    const totalBooksEl = document.getElementById('statTotalBooks');
    const totalStockEl = document.getElementById('statTotalStock');
    const totalTypesEl = document.getElementById('statTotalTypes');
    const totalPublishersEl = document.getElementById('statTotalPublishers');

    try {
        const result = await getBookListApi({ pageNum: 1, pageSize: 1 });
        if (result.code === 200 && result.data) {
            if (totalBooksEl) totalBooksEl.textContent = result.data.total || 0;
        }
    } catch (e) {
        console.error('加载教材总数失败', e);
    }

    try {
        // 获取类型列表用于统计类型数量
        const typeResult = await getTypeListApi();
        if (typeResult.code === 200 && typeResult.data) {
            if (totalTypesEl) totalTypesEl.textContent = typeResult.data.length || 0;
        }
    } catch (e) {
        console.error('加载类型数量失败', e);
    }

    // 总库存通过统计接口获取
    try {
        const statResult = await getStatisticsApi();
        if (statResult.code === 200 && statResult.data) {
            let totalStock = 0;
            statResult.data.forEach(item => {
                totalStock += item.currentStock || 0;
            });
            if (totalStockEl) totalStockEl.textContent = totalStock;
        }
    } catch (e) {
        console.error('加载总库存失败', e);
    }
}

/**
 * 加载并按关键词过滤类型卡片网格
 * 每个卡片显示类型名称 + 该类型下教材数量
 */
async function loadTypeCards(keyword = '') {
    const grid = document.getElementById('typeCardGrid');
    if (!grid) return;

    // 获取所有类型
    const typeResult = await getTypeListApi();
    if (typeResult.code !== 200 || !typeResult.data) {
        grid.innerHTML = '<div class="empty-state"><p>暂无类型数据</p></div>';
        return;
    }

    let types = typeResult.data;

    // 如果有关键词，先过滤类型名称匹配的类型
    let keywordMatchTypes = [];
    let otherTypes = [];
    let searchBooks = false;

    if (keyword) {
        // 检查关键词是否匹配类型名称
        keywordMatchTypes = types.filter(t => t.typeName.includes(keyword));
        otherTypes = types.filter(t => !t.typeName.includes(keyword));
        searchBooks = true;
    } else {
        otherTypes = types;
    }

    // 先渲染匹配类型的卡片（如果有）
    let html = '';

    // 渲染匹配关键词的类型卡片
    for (const type of keywordMatchTypes) {
        html += await buildTypeCard(type, keyword, searchBooks);
    }

    // 渲染其他类型卡片
    for (const type of otherTypes) {
        html += await buildTypeCard(type, keyword, searchBooks);
    }

    grid.innerHTML = html;

    // 绑定类型卡片点击事件
    grid.querySelectorAll('.type-card').forEach(card => {
        card.addEventListener('click', async function () {
            const typeId = parseInt(this.dataset.typeId);
            const typeName = this.dataset.typeName;
            await expandType(typeId, typeName, keyword);
        });
    });

    observeNewReveals();
}

/**
 * 构建单个类型卡片 HTML
 * @param {object} type - 类型对象
 * @param {string} keyword - 搜索关键词
 * @param {boolean} searchBooks - 是否需要在教材中搜索
 */
async function buildTypeCard(type, keyword, searchBooks) {
    let bookCount = 0;
    let matchCount = 0;

    try {
        // 获取该类型下的教材数量
        const result = await getBookListByTypeApi({ typeId: type.typeId, pageNum: 1, pageSize: 1 });
        if (result.code === 200 && result.data) {
            bookCount = result.data.total || 0;
        }
    } catch (e) {
        console.error('获取类型教材数量失败', e);
    }

    // 如果有关键词且类型名称不匹配，统计该类型下匹配关键词的教材数量
    if (keyword && searchBooks && !type.typeName.includes(keyword)) {
        try {
            const result = await getBookListByTypeApi({ typeId: type.typeId, pageNum: 1, pageSize: 1, keyword: keyword });
            if (result.code === 200 && result.data) {
                matchCount = result.data.total || 0;
            }
        } catch (e) {
            console.error('获取匹配教材数量失败', e);
        }
    }

    // 如果有关键词且类型名称不匹配，且该类型下没有匹配的教材，则不显示
    if (keyword && searchBooks && !type.typeName.includes(keyword) && matchCount === 0) {
        return '';
    }

    const displayCount = keyword && searchBooks && !type.typeName.includes(keyword) ? matchCount : bookCount;

    return `
        <div class="type-card reveal" data-type-id="${type.typeId}" data-type-name="${type.typeName}">
            <div class="type-card-icon">📚</div>
            <div class="type-card-name">${type.typeName}</div>
            <div class="type-card-count">${displayCount} 本教材</div>
        </div>
    `;
}

/**
 * 点击类型卡片 → 展开该类型下全部教材列表（无分页）
 */
async function expandType(typeId, typeName, keyword = '') {
    window.__expandedTypeId = typeId;
    window.__expandedTypeName = typeName;

    const section = document.getElementById('bookListSection');
    const title = document.getElementById('expandedTypeTitle');
    const grid = document.getElementById('typeCardGrid');

    if (title) {
        title.textContent = `${typeName} - 教材列表`;
    }

    if (section) {
        section.style.display = 'block';
    }

    // 加载该类型下的全部教材列表（无分页）
    await loadBookListByType(typeId, typeName, keyword);

    // 滚动到列表区域
    setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

/**
 * 加载指定类型下的全部教材列表（无分页）
 * @param {number} typeId - 类型ID
 * @param {string} typeName - 类型名称
 * @param {string} keyword - 搜索关键词
 */
async function loadBookListByType(typeId, typeName, keyword = '') {
    const tbody = document.getElementById('bookTableBody');
    if (!tbody) return;

    // 一次性加载所有教材（无分页，pageSize 设置足够大）
    const params = { typeId, pageNum: 1, pageSize: 1000 };
    if (keyword) {
        params.keyword = keyword;
    }

    const result = await getBookListByTypeApi(params);
    if (result.code === 200 && result.data) {
        const { total, rows } = result.data;

        if (rows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><p>该类型下暂无教材数据</p></td></tr>';
        } else {
            tbody.innerHTML = rows.map(book => `
                <tr class="reveal">
                    <td>${book.bookId}</td>
                    <td>${book.bookname}</td>
                    <td>${book.isbn}</td>
                    <td>${book.author}</td>
                    <td>¥${book.price.toFixed(2)}</td>
                    <td>${book.stock}</td>
                    <td>${book.publisherName}</td>
                    <td class="table-actions">
                        <button class="btn btn-sm btn-edit" data-book-id="${book.bookId}" data-book-name="${book.bookname}" data-book-isbn="${book.isbn}" data-book-author="${book.author}" data-book-price="${book.price}" data-book-publisher-id="${book.publisherId}" data-book-type-id="${book.typeId}" data-book-publish-date="${book.publishDate}" data-permission="book:edit">编辑</button>
                        <button class="btn btn-sm btn-delete" data-book-id="${book.bookId}" data-permission="book:delete">删除</button>
                    </td>
                </tr>
            `).join('');
        }

        // 更新列表标题显示总数
        const title = document.getElementById('expandedTypeTitle');
        if (title) {
            title.textContent = `${typeName} - 教材列表（共 ${total} 本）`;
        }
    }

    // 为新渲染的行添加渐显观察
    observeNewReveals();
    // 应用权限样式
    applyPermissionVisibility();
}

// ============================================================
// 2. 出版社管理页面：列表渲染 + 添加模态框 + 订购入口
// ============================================================

/**
 * 初始化出版社管理页面
 */
async function initPublishersPage() {
    const tbody = document.getElementById('publisherTableBody');
    if (!tbody) return;

    // 加载出版社列表
    async function refreshPublisherTable() {
        const result = await getPublisherListApi();
        if (result.code === 200 && result.data) {
            if (result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><p>暂无数据</p></td></tr>';
            } else {
                tbody.innerHTML = result.data.map(p => `
                    <tr>
                        <td>${p.publisherId}</td>
                        <td>${p.publisherName}</td>
                        <td>${p.publishAddress}</td>
                        <td>${p.publishPhone}</td>
                        <td>
                            <button class="btn btn-sm btn-order" data-publisher-id="${p.publisherId}" data-publisher-name="${p.publisherName}" data-permission="order:create">订购</button>
                            <button class="btn btn-sm btn-delete-publisher" data-publisher-id="${p.publisherId}" data-publisher-name="${p.publisherName}" data-permission="publisher:delete">删除</button>
                        </td>
                    </tr>
                `).join('');
                
                // 绑定订购按钮事件
                tbody.querySelectorAll('.btn-order').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const pubId = this.dataset.publisherId;
                        const pubName = this.dataset.publisherName;
                        openOrderModal(pubId, pubName);
                    });
                });
                // 绑定删除按钮事件
                tbody.querySelectorAll('.btn-delete-publisher').forEach(btn => {
                    btn.addEventListener('click', async function() {
                        const pubId = parseInt(this.dataset.publisherId);
                        const pubName = this.dataset.publisherName;
                        if (confirm(`确定要删除出版社「${pubName}」吗？`)) {
                            const result = await deletePublisherApi(pubId);
                            if (result.code === 200) {
                                showMessage('出版社删除成功', 'success');
                                await refreshPublisherTable();
                            } else {
                                showMessage(result.message || '删除失败', 'error');
                            }
                        }
                    });
                });
                applyPermissionVisibility();
            }
        }
    }

    await refreshPublisherTable();

    // 添加出版社按钮
    const addBtn = document.getElementById('addPublisherBtn');
    const modal = document.getElementById('addPublisherModal');
    const modalClose = document.getElementById('publisherModalClose');
    const modalCancel = document.getElementById('publisherModalCancel');
    const addForm = document.getElementById('addPublisherForm');

    if (addBtn && modal) {
        addBtn.addEventListener('click', () => {
            closeAllModals();
            document.getElementById('publisherModalTitle').textContent = '添加出版社';
            addForm.reset();
            modal.classList.add('show');
        });
    }
    if (modalClose) modalClose.addEventListener('click', () => modal.classList.remove('show'));
    if (modalCancel) modalCancel.addEventListener('click', () => modal.classList.remove('show'));
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('show');
        });
    }

    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addForm);
            const params = {
                publisherName: formData.get('publisherName'),
                publishAddress: formData.get('publishAddress'),
                publishPhone: formData.get('publishPhone')
            };
            const result = await addPublisherApi(params);
            if (result.code === 200) {
                showMessage('出版社添加成功', 'success');
                modal.classList.remove('show');
                addForm.reset();
                await refreshPublisherTable();
            } else {
                showMessage(result.message || '添加失败', 'error');
            }
        });
    }

    observeNewReveals();
}

/**
 * 从出版社列表点击「订购」→ 打开订购模态框并预填出版社信息
 */
async function openOrderModal(publisherId, publisherName) {
    const modal = document.getElementById('addBookModal');
    const addForm = document.getElementById('addBookForm');
    if (!modal || !addForm) return;

    closeAllModals();
    
    // 重置表单并设置出版社ID
    addForm.reset();
    delete addForm.dataset.editId;
    document.querySelector('#addBookModal .modal-header h3').textContent = `订购教材 - ${publisherName}`;
    document.getElementById('orderPublisherId').value = publisherId;
    document.getElementById('bookname').value = '默认教材名称';
    document.getElementById('isbn').value = 'ISBN0000000001';
    document.getElementById('author').value = '默认作者';
    document.getElementById('price').value = '39.9';
    document.getElementById('bookQuantity').value = '1';
    document.getElementById('publishDate').value = '2024-01-01';
    // 订购模式恢复数量字段和按钮文字
    const qtyGroup = document.getElementById('bookQuantity').closest('.form-group');
    if (qtyGroup) qtyGroup.style.display = '';
    document.querySelector('#addBookForm button[type="submit"]').textContent = '确认订购';
    
    // 加载类型下拉选项（带浅色备注）
    await loadTypeSelectOptions();
    
    modal.classList.add('show');
}

/**
 * 加载类型下拉选项（带浅色备注）
 */
async function loadTypeSelectOptions() {
    const select = document.getElementById('typeId');
    if (!select) return;
    
    try {
        const result = await getTypeListApi();
        if (result.code === 200 && result.data) {
            select.innerHTML = result.data.map(t => 
                `<option value="${t.typeId}">${t.typeId} - ${t.typeName}</option>`
            ).join('');
        }
    } catch (e) {
        console.error('加载类型选项失败', e);
        select.innerHTML = '<option value="1">1 - 计算机科学</option>';
    }
}

// ============================================================
// 3. 入库管理页面：待入库列表 + 入库登记表单 + 明细行增删
// ============================================================

/**
 * 初始化入库管理页面
 */
async function initStockInPage() {
    const form = document.getElementById('stockInForm');
    const addDetailBtn = document.getElementById('addDetailBtn');
    const detailsContainer = document.getElementById('stockInDetails');

    // 自动填充当前用户为操作员
    const userInfo = getStoredUserInfo();
    const opInput = document.getElementById('operatorId');
    if (opInput && userInfo) opInput.value = userInfo.userId;

    // 加载待入库列表
    await refreshPendingStockTable();
    
    // 默认添加一行明细
    addStockInDetailRow(detailsContainer);

    if (addDetailBtn) {
        addDetailBtn.addEventListener('click', () => addStockInDetailRow(detailsContainer));
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            const detailRows = detailsContainer.querySelectorAll('.detail-row');
            const details = Array.from(detailRows).map(row => {
                const selectEl = row.querySelector('.pending-book-select');
                const selectedOption = selectEl?.selectedOptions[0];
                const bookId = parseInt(selectedOption?.value);
                const maxQty = parseInt(selectedOption?.dataset?.maxQty) || 0;
                const qty = parseInt(row.querySelector('[name="detailQuantity"]')?.value) || 0;
                return {
                    bookId: bookId || 0,
                    quantity: qty,
                    maxQty: maxQty,
                    pendingId: selectedOption?.dataset?.pendingId || ''
                };
            }).filter(d => d.bookId > 0);

            if (details.length === 0) {
                showMessage('请至少选择一个待入库教材', 'warning');
                return;
            }

            // 数量校验：不能超过待入库数量
            for (const d of details) {
                if (d.quantity > d.maxQty) {
                    showMessage(`教材ID ${d.bookId} 入库数量(${d.quantity})超过待入库数量(${d.maxQty})`, 'warning');
                    return;
                }
                if (d.quantity <= 0) {
                    showMessage('入库数量必须大于0', 'warning');
                    return;
                }
            }

            const userInfo = getStoredUserInfo();
            const params = {
                stockInDate: formData.get('stockInDate') || new Date().toISOString().split('T')[0],
                operatorId: parseInt(formData.get('operatorId')) || (userInfo ? userInfo.userId : 3),
                details
            };

            const result = await addStockInApi(params);
            if (result.code === 200) {
                showMessage('入库成功', 'success');
                form.reset();
                detailsContainer.innerHTML = '';
                addStockInDetailRow(detailsContainer);
                // 刷新待入库列表
                await refreshPendingStockTable();
            } else {
                showMessage(result.message || '入库失败', 'error');
            }
        });
    }

    observeNewReveals();
    // 加载入库历史记录
    loadStockInHistory();
}

/**
 * 加载入库历史记录
 */
async function loadStockInHistory() {
    if (!hasPermission('role:manage')) return;
    const container = document.getElementById('stockInHistoryContainer');
    if (!container) return;

    try {
        const result = await getStockInHistoryApi();
        if (result.code !== 200 || !result.data || result.data.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>暂无入库记录</p></div>';
            return;
        }

        container.innerHTML = result.data.map(si => `
            <div class="history-card reveal">
                <div class="history-card-header">
                    <span class="history-id">#${si.stockInId}</span>
                    <span>📅 ${si.stockInDate}</span>
                    <span>👤 ${si.operatorName}</span>
                </div>
                <table class="demand-detail-table">
                    <thead><tr><th>教材名称</th><th>入库数量</th></tr></thead>
                    <tbody>
                        ${(si.details || []).map(d => `<tr><td>${d.bookname}</td><td>${d.quantity}</td></tr>`).join('')}
                    </tbody>
                </table>
            </div>
        `).join('');

        observeNewReveals();
    } catch (e) {
        console.error('加载入库历史失败:', e);
        container.innerHTML = '<div class="empty-state"><p>加载失败</p></div>';
    }
}
/**
 * 刷新所有入库明细行中的待入库教材下拉选项
 */
function refreshAllStockInSelects() {
    const selects = document.querySelectorAll('.pending-book-select');
    selects.forEach(select => loadPendingStockOptions(select));
}

async function refreshPendingStockTable() {
    const tbody = document.getElementById('pendingStockTableBody');
    if (!tbody) return;
    
    try {
        const result = await getPendingStockApi();
        if (result.code === 200 && result.data && result.data.length > 0) {
            tbody.innerHTML = result.data.map(item => `
                <tr>
                    <td>${item.pendingId}</td>
                    <td>${item.bookname}</td>
                    <td>${item.isbn}</td>
                    <td>${item.author}</td>
                    <td>¥${item.price.toFixed(2)}</td>
                    <td>${item.quantity}</td>
                    <td>${item.publisherName}</td>
                    <td>${item.typeName}</td>
                    <td>
                        <button class="btn btn-sm btn-delete" data-pending-id="${item.pendingId}" data-permission="stockin:delete">删除</button>
                    </td>
                </tr>
            `).join('');
            
            // 绑定删除按钮
            tbody.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const pendingId = this.dataset.pendingId;
                    if (confirm('确定要移除此待入库记录吗？')) {
                        await removePendingStockApi(pendingId);
                        showMessage('已移除', 'info');
                        await refreshPendingStockTable();
                    }
                });
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="9" class="empty-state"><p>暂无待入库教材</p></td></tr>';
        }
        applyPermissionVisibility();
    } catch (e) {
        console.error('加载待入库列表失败', e);
        tbody.innerHTML = '<tr><td colspan="9" class="empty-state"><p>加载失败</p></td></tr>';
    }
}

/**
 * 添加入库明细行（从待入库列表选择教材）
 * @param {HTMLElement} container - 明细容器
 */
function addStockInDetailRow(container) {
    const row = document.createElement('div');
    row.className = 'detail-row stock-in-detail-row';
    row.innerHTML = `
        <select class="pending-book-select form-control" style="flex: 1; min-width: 200px;">
            <option value="">-- 请选择待入库教材 --</option>
        </select>
        <input type="number" name="detailQuantity" class="form-control" placeholder="入库数量" style="max-width: 120px;" min="1">
        <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">删除</button>
    `;
    
    // 加载待入库选项到 select
    const select = row.querySelector('.pending-book-select');
    loadPendingStockOptions(select);
    
    container.appendChild(row);
}

/**
 * 加载待入库教材到下拉选项
 * @param {HTMLSelectElement} select 
 */
async function loadPendingStockOptions(select) {
    if (!select) return;
    try {
        const result = await getPendingStockApi();
        if (result.code === 200 && result.data) {
            select.innerHTML = '<option value="">-- 请选择待入库教材 --</option>' +
                result.data.map(item => 
                    `<option value="${item.bookId}" data-pending-id="${item.pendingId}" data-max-qty="${item.quantity}">${item.bookname} (ISBN: ${item.isbn}, 可入库: ${item.quantity})</option>`
                ).join('');
        }
    } catch (e) {
        console.error('加载待入库选项失败', e);
    }
}

// ============================================================
// 4. 出库管理页面：ISBN 自动补全 + 明细行增删 + 提交
// ============================================================

/**
 * 初始化出库管理页面
 */
async function initStockOutPage() {
    const form = document.getElementById('stockOutForm');
    const addDetailBtn = document.getElementById('addOutDetailBtn');
    const detailsContainer = document.getElementById('stockOutDetails');

    // 自动填充当前用户为操作员
    const userInfo = getStoredUserInfo();
    const opInput = document.getElementById('stockOutOperatorId');
    if (opInput && userInfo) opInput.value = userInfo.userId;

    addOutDetailRow(detailsContainer);

    if (addDetailBtn) {
        addDetailBtn.addEventListener('click', () => addOutDetailRow(detailsContainer));
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            const detailRows = detailsContainer.querySelectorAll('.detail-row');
            const details = [];
            for (const row of detailRows) {
                const isbnInput = row.querySelector('[name="outDetailIsbn"]');
                const isbn = isbnInput?.value?.trim() || '';
                let bookId = parseInt(isbnInput?.dataset?.bookId) || 0;
                const qty = parseInt(row.querySelector('[name="outDetailQuantity"]')?.value) || 0;

                // 如果 bookId 为空但 ISBN 已填写，尝试通过 API 查找
                if (!bookId && isbn) {
                    try {
                        const lookup = await getBookListApi({ keyword: isbn, pageNum: 1, pageSize: 5 });
                        if (lookup.code === 200 && lookup.data?.rows?.length > 0) {
                            const match = lookup.data.rows.find(b => b.isbn === isbn);
                            if (match) {
                                bookId = match.bookId;
                                isbnInput.dataset.bookId = bookId;
                                isbnInput.dataset.bookName = match.bookname;
                            }
                        }
                    } catch (err) { /* ignore lookup errors */ }
                }

                if (bookId && qty > 0) {
                    details.push({ bookId, isbn, quantity: qty });
                }
            }

            if (details.length === 0) {
                showMessage('请至少选择一本教材（输入ISBN后需从下拉框选中，或输入完整ISBN自动匹配）', 'warning');
                return;
            }

            const userInfo = getStoredUserInfo();
            const params = {
                stockOutDate: formData.get('stockOutDate') || new Date().toISOString().split('T')[0],
                operatorId: parseInt(formData.get('operatorId')) || (userInfo ? userInfo.userId : 3),
                details
            };

            const result = await addStockOutApi(params);
            if (result.code === 200) {
                showMessage('出库成功', 'success');
                form.reset();
                detailsContainer.innerHTML = '';
                addOutDetailRow(detailsContainer);
            } else {
                showMessage(result.message || '出库失败', 'error');
            }
        });
    }

    observeNewReveals();
    // 加载出库历史记录
    loadStockOutHistory();
}

/**
 * 加载出库历史记录
 */
async function loadStockOutHistory() {
    if (!hasPermission('role:manage')) return;
    const container = document.getElementById('stockOutHistoryContainer');
    if (!container) return;

    try {
        const result = await getStockOutHistoryApi();
        if (result.code !== 200 || !result.data || result.data.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>暂无出库记录</p></div>';
            return;
        }

        container.innerHTML = result.data.map(so => `
            <div class="history-card reveal">
                <div class="history-card-header">
                    <span class="history-id">#${so.stockOutId}</span>
                    <span>📅 ${so.stockOutDate}</span>
                    <span>👤 ${so.operatorName}</span>
                </div>
                <table class="demand-detail-table">
                    <thead><tr><th>教材名称</th><th>出库数量</th></tr></thead>
                    <tbody>
                        ${(so.details || []).map(d => `<tr><td>${d.bookname}</td><td>${d.quantity}</td></tr>`).join('')}
                    </tbody>
                </table>
            </div>
        `).join('');

        observeNewReveals();
    } catch (e) {
        console.error('加载出库历史失败:', e);
        container.innerHTML = '<div class="empty-state"><p>加载失败</p></div>';
    }
}

/**
 * 添加出库明细行（ISBN输入 + 自动补全 + 数量）
 * @param {HTMLElement} container - 明细容器
 */
function addOutDetailRow(container) {
    const row = document.createElement('div');
    row.className = 'detail-row';
    row.innerHTML = `
        <div class="isbn-autocomplete-wrapper">
            <input type="text" name="outDetailIsbn" class="form-control" placeholder="请输入ISBN码" autocomplete="off">
            <div class="isbn-dropdown"></div>
        </div>
        <input type="number" name="outDetailQuantity" class="form-control" placeholder="请输入数量" style="max-width: 120px;">
        <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">删除</button>
    `;
    const isbnInput = row.querySelector('[name="outDetailIsbn"]');
    const dropdown = row.querySelector('.isbn-dropdown');
    bindIsbnAutocomplete(isbnInput, dropdown);
    container.appendChild(row);
}

/**
 * 绑定 ISBN 输入自动补全
 * @param {HTMLInputElement} input - ISBN 输入框
 * @param {HTMLElement} dropdown - 下拉建议容器
 */
function bindIsbnAutocomplete(input, dropdown) {
    if (!input || !dropdown) return;

    let debounceTimer;
    input.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        const val = this.value.trim();
        if (!val) {
            dropdown.style.display = 'none';
            return;
        }
        debounceTimer = setTimeout(async () => {
            try {
                const result = await getBookListApi({ pageNum: 1, pageSize: 100, keyword: val });
                if (result.code === 200 && result.data && result.data.rows.length > 0) {
                    const matches = result.data.rows.filter(b =>
                        b.isbn.toLowerCase().includes(val.toLowerCase()) ||
                        b.bookname.toLowerCase().includes(val.toLowerCase())
                    );
                    if (matches.length > 0) {
                        dropdown.innerHTML = matches.map(b => `
                            <div class="isbn-dropdown-item" data-book-id="${b.bookId}" data-book-name="${b.bookname}" data-isbn="${b.isbn}">
                                <span class="isbn-dd-name">${b.bookname}</span>
                                <span class="isbn-dd-isbn">${b.isbn}</span>
                                <span class="isbn-dd-stock">库存: ${b.stock}</span>
                            </div>
                        `).join('');
                        dropdown.style.display = 'block';

                        // 精确匹配：如果输入的 ISBN 完全匹配某本书，自动选中
                        const exactMatch = matches.find(b => b.isbn === val);
                        if (exactMatch) {
                            input.dataset.bookId = exactMatch.bookId;
                            input.dataset.bookName = exactMatch.bookname;
                        }
                    } else {
                        dropdown.style.display = 'none';
                        // 没匹配到时清除 bookId
                        delete input.dataset.bookId;
                        delete input.dataset.bookName;
                    }
                } else {
                    dropdown.style.display = 'none';
                }
            } catch (e) {
                console.error('ISBN自动补全失败:', e);
            }
        }, 300);
    });

    // 点击下拉项时填充
    dropdown.addEventListener('click', function (e) {
        const item = e.target.closest('.isbn-dropdown-item');
        if (item) {
            input.value = item.dataset.isbn;
            input.dataset.bookId = item.dataset.bookId;
            input.dataset.bookName = item.dataset.bookName;
            dropdown.style.display = 'none';
        }
    });

    // 点击外部关闭下拉
    document.addEventListener('click', function (e) {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });

    // 键盘操作：Escape 关闭，Enter 选中第一个，Arrow 导航
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            dropdown.style.display = 'none';
        }
        if (e.key === 'Enter' && dropdown.style.display === 'block') {
            e.preventDefault();
            const firstItem = dropdown.querySelector('.isbn-dropdown-item');
            if (firstItem) {
                input.value = firstItem.dataset.isbn;
                input.dataset.bookId = firstItem.dataset.bookId;
                input.dataset.bookName = firstItem.dataset.bookName;
                dropdown.style.display = 'none';
            }
        }
    });
}

// ============================================================
// 模态框全局管理：关闭全部 / 移到 body 末尾避免 fixed 偏移
// ============================================================

/**
 * 关闭所有模态框
 */
function closeAllModals() {
    document.querySelectorAll('.modal-overlay.show').forEach(modal => {
        modal.classList.remove('show');
    });
}

/**
 * 将所有 .modal-overlay 移到 body 末尾
 * 解决父元素 CSS transform 导致 position:fixed 参考系偏移的问题
 */
// ============================================================
// 6. 用户管理页面（仅 Admin 可见）
// ============================================================

/**
 * 初始化用户管理页面
 */
async function initUsersPage() {
    if (!hasPermission('user:view')) return;

    await loadUserList();

    // 添加用户按钮
    const addUserBtn = document.getElementById('addUserBtn');
    const userModal = document.getElementById('addUserModal');
    const userModalClose = document.getElementById('userModalClose');
    const userModalCancel = document.getElementById('userModalCancel');
    const addUserForm = document.getElementById('addUserForm');

    if (addUserBtn && userModal) {
        addUserBtn.addEventListener('click', () => {
            userModal.classList.add('show');
        });
    }

    if (userModalClose) userModalClose.addEventListener('click', () => userModal.classList.remove('show'));
    if (userModalCancel) userModalCancel.addEventListener('click', () => userModal.classList.remove('show'));
    if (userModal) {
        userModal.addEventListener('click', (e) => {
            if (e.target === userModal) userModal.classList.remove('show');
        });
    }

    // 提交添加用户表单
    if (addUserForm) {
        addUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addUserForm);

            const params = {
                username: formData.get('username'),
                password: formData.get('password'),
                displayName: formData.get('displayName'),
                roleName: formData.get('roleName')
            };

            const result = await addUserApi(params);
            if (result.code === 200) {
                showMessage('用户创建成功', 'success');
                userModal.classList.remove('show');
                addUserForm.reset();
                await loadUserList();
            } else {
                showMessage(result.message || '创建失败', 'error');
            }
        });
    }
}

/**
 * 加载用户列表
 */
async function loadUserList() {
    const tbody = document.getElementById('userTableBody');
    if (!tbody) return;

    try {
        const result = await getUserListApi();
        if (result.code !== 200 || !result.data) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><p>加载失败</p></td></tr>';
            return;
        }

        const users = result.data;
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><p>暂无用户</p></td></tr>';
            return;
        }

        tbody.innerHTML = users.map(u => `
            <tr>
                <td>${u.userId}</td>
                <td><strong>${u.username}</strong></td>
                <td>${u.displayName}</td>
                <td><span class="role-badge role-${(u.roleName || '').toLowerCase()}">${u.roleDisplayName || u.roleName || '未分配'}</span></td>
                <td>${u.isActive ? '✅ 启用' : '❌ 禁用'}</td>
                <td>${formatDate(u.createdAt)}</td>
                <td>
                    <button class="btn btn-sm btn-delete-user" data-user-id="${u.userId}" data-username="${u.username}"
                            data-permission="user:delete"
                            style="background: rgba(239,68,68,0.08); color: #ef4444;">删除</button>
                </td>
            </tr>
        `).join('');

        // 绑定删除按钮
        tbody.querySelectorAll('.btn-delete-user').forEach(btn => {
            btn.addEventListener('click', async function () {
                const userId = parseInt(this.dataset.userId);
                const username = this.dataset.username;
                if (confirm('确定要删除用户 "' + username + '" 吗？此操作不可撤销。')) {
                    const result = await deleteUserApi(userId);
                    if (result.code === 200) {
                        showMessage('用户 "' + username + '" 已删除', 'info');
                        await loadUserList();
                    } else {
                        showMessage(result.message || '删除失败', 'error');
                    }
                }
            });
        });

        applyPermissionVisibility();
    } catch (error) {
        console.error('加载用户列表失败:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><p>加载失败</p></td></tr>';
    }
}

/**
 * 格式化日期字符串，去掉 T 和毫秒部分
 */
function formatDate(dateStr) {
    if (!dateStr) return '-';
    return dateStr.replace('T', ' ').substring(0, 19);
}

function moveModalsToBody() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        document.body.appendChild(modal);
    });
}

// ============================================================
// 5. 订购记录页面（仅管理员可见）
// ============================================================

/**
 * 初始化订购记录页面
 */
async function initOrdersPage() {
    if (!hasPermission('role:manage')) return;
    const container = document.getElementById('orderHistoryContainer');
    if (!container) return;

    try {
        const result = await getOrderHistoryApi();
        if (result.code !== 200 || !result.data || result.data.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>暂无订购记录</p></div>';
            return;
        }

        // v3.0：扁平数据按 OrderId 分组
        const grouped = {};
        result.data.forEach(row => {
            const id = row.OrderId;
            if (!grouped[id]) {
                grouped[id] = {
                    orderId: id,
                    orderDate: row.OrderDate,
                    operatorName: row.OperatorName,
                    merchantName: row.MerchantName,
                    items: []
                };
            }
            grouped[id].items.push({ bookname: row.Bookname, quantity: row.Quantity });
        });

        container.innerHTML = Object.values(grouped).map(o => `
            <div class="history-card reveal">
                <div class="history-card-header">
                    <span class="history-id">#${o.orderId}</span>
                    <span>📅 ${o.orderDate}</span>
                    <span>👤 ${o.operatorName}</span>
                    <span>🏪 ${o.merchantName || '-'}</span>
                </div>
                <table class="demand-detail-table">
                    <thead><tr><th>教材名称</th><th>订购数量</th></tr></thead>
                    <tbody>
                        ${o.items.map(d => `<tr><td>${d.bookname}</td><td>${d.quantity}</td></tr>`).join('')}
                    </tbody>
                </table>
            </div>
        `).join('');

        observeNewReveals();
    } catch (e) {
        console.error('加载订购记录失败:', e);
        container.innerHTML = '<div class="empty-state"><p>加载失败</p></div>';
    }
}
