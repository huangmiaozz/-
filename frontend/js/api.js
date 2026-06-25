/**
 * API 请求封装模块（已对接真实后端）
 *
 * 后端: Spring Boot (http://localhost:8080)
 * 数据库: SQL Server
 * 认证: JWT (Bearer Token)
 */

// ============================================================
// 全局配置
// ============================================================

const API_BASE_URL = 'http://localhost:8080/api';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_info';

// ============================================================
// Toast 消息通知系统
// ============================================================

const TOAST_ICONS = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
const TOAST_COLORS = { success: '#10b981', error: '#ef4444', info: '#3b82f6', warning: '#f59e0b' };

function showMessage(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = TOAST_ICONS[type] || 'ℹ';
    const color = TOAST_COLORS[type] || '#3b82f6';
    toast.innerHTML = '<span class="toast-icon" style="color:' + color + '">' + icon + '</span>'
        + '<span class="toast-message">' + message + '</span>'
        + '<button class="toast-close" onclick="this.parentElement.classList.add(\'toast-exit\');setTimeout(()=>this.parentElement.remove(),250)">✕</button>';
    container.appendChild(toast);
    setTimeout(function () {
        if (toast.parentElement) {
            toast.classList.add('toast-exit');
            setTimeout(function () { if (toast.parentElement) toast.remove(); }, 250);
        }
    }, duration);
}

// ============================================================
// 工具函数
// ============================================================

function getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
}

function getStoredUserInfo() {
    var data = sessionStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
}

// ============================================================
// 权限判断
// ============================================================

var PERMISSIONS_KEY = 'user_permissions';

function getUserPermissions() {
    var data = sessionStorage.getItem(PERMISSIONS_KEY);
    return data ? JSON.parse(data) : [];
}

function hasPermission(permissionCode) {
    var permissions = getUserPermissions();
    return permissions.includes(permissionCode);
}

function hasAnyPermission() {
    var codes = Array.prototype.slice.call(arguments);
    return codes.some(function (code) { return hasPermission(code); });
}

var PERMISSION_DENIED_MSG = {
    'demand:create': '您没有创建需求的权限',
    'demand:edit': '您没有编辑需求的权限',
    'demand:delete': '您没有删除需求的权限',
    'book:create': '您没有添加教材的权限',
    'book:edit': '您没有编辑教材的权限',
    'book:delete': '您没有删除教材的权限',
    'order:create': '您没有订购教材的权限',
    'order:edit': '您没有编辑订购的权限',
    'order:delete': '您没有删除订购的权限',
    'stockin:create': '您没有入库操作的权限',
    'stockin:edit': '您没有编辑入库的权限',
    'stockin:delete': '您没有删除入库的权限',
    'stockout:create': '您没有出库操作的权限',
    'stockout:edit': '您没有编辑出库的权限',
    'stockout:delete': '您没有删除出库的权限',
    'publisher:create': '您没有添加出版社的权限',
    'publisher:edit': '您没有编辑出版社的权限',
    'publisher:delete': '您没有删除出版社的权限',
    'user:view': '您没有查看用户的权限',
    'user:create': '您没有添加用户的权限',
    'user:edit': '您没有编辑用户的权限',
    'user:delete': '您没有删除用户的权限',
    'role:manage': '您没有管理角色的权限'
};

function applyPermissionVisibility() {
    document.querySelectorAll('[data-permission]').forEach(function (el) {
        var code = el.getAttribute('data-permission');
        if (code && !hasPermission(code)) {
            el.classList.add('no-permission');
            el.setAttribute('title', PERMISSION_DENIED_MSG[code] || '您没有此操作的权限');
            // 禁用表单元素：按钮不可点击，输入框不可编辑
            if (el.tagName === 'BUTTON' || el.tagName === 'INPUT' ||
                el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
                el.disabled = true;
            }
        }
    });
}

function hideNoPermissionSections() {
    document.querySelectorAll('[data-permission-hide]').forEach(function (el) {
        var code = el.getAttribute('data-permission-hide');
        if (code && !hasPermission(code)) {
            el.style.display = 'none';
        }
    });
}

function initPermissionGuard() {
    document.addEventListener('click', function (e) {
        var target = e.target;
        while (target && target !== document.body) {
            if (target.hasAttribute && target.hasAttribute('data-permission')) {
                var code = target.getAttribute('data-permission');
                if (code && !hasPermission(code)) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    showMessage(PERMISSION_DENIED_MSG[code] || '您没有此操作的权限', 'warning', 2500);
                    return false;
                }
                break;
            }
            target = target.parentElement;
        }
    }, true);
}

// ============================================================
// 通用请求封装（自动带 Token）
// ============================================================

/**
 * 发起 API 请求
 * @param {string} url - API 路径
 * @param {object} options - fetch 选项
 * @returns {Promise<object>} { code, message, data }
 */
async function request(url, options) {
    if (!options) options = {};
    var token = getToken();
    var headers = { 'Content-Type': 'application/json' };
    if (options.headers) {
        Object.keys(options.headers).forEach(function (k) { headers[k] = options.headers[k]; });
    }
    if (token && url.indexOf('/auth/login') === -1) {
        headers['Authorization'] = 'Bearer ' + token;
    }

    var response = await fetch(API_BASE_URL + url, {
        method: options.method || 'GET',
        headers: headers,
        body: options.body
    });

    var text = await response.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        return { code: response.status, message: text, data: null };
    }
}

// ============================================================
// 1. 登录
// ============================================================

async function loginApi(params) {
    return request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(params)
    });
}

// ============================================================
// 2. 教材管理
// ============================================================

async function getBookListApi(params) {
    if (!params) params = {};
    var pageNum = params.pageNum || 1;
    var pageSize = params.pageSize || 10;
    var keyword = params.keyword || '';
    var typeId = params.typeId;
    var url = '/books?pageNum=' + pageNum + '&pageSize=' + pageSize;
    if (keyword) url += '&keyword=' + encodeURIComponent(keyword);
    if (typeId) url += '&typeId=' + typeId;
    return request(url);
}

async function addBookApi(params) {
    return request('/books', {
        method: 'POST',
        body: JSON.stringify(params)
    });
}

async function updateBookApi(bookId, params) {
    return request('/books/' + bookId, {
        method: 'PUT',
        body: JSON.stringify(params)
    });
}

async function deleteBookApi(bookId) {
    return request('/books/' + bookId, {
        method: 'DELETE'
    });
}

// ============================================================
// 3. 出版社管理
// ============================================================

async function getPublisherListApi() {
    return request('/publishers');
}

async function addPublisherApi(params) {
    return request('/publishers', {
        method: 'POST',
        body: JSON.stringify(params)
    });
}

async function deletePublisherApi(publisherId) {
    return request('/publishers/' + publisherId, {
        method: 'DELETE'
    });
}

// ============================================================
// 4. 教材类型
// ============================================================

async function getTypeListApi() {
    return request('/types');
}

// ============================================================
// 5. 入库管理
// ============================================================

async function addStockInApi(params) {
    return request('/stock-in', {
        method: 'POST',
        body: JSON.stringify(params)
    });
}

async function getStockInHistoryApi() {
    return request('/stock-in');
}

// ============================================================
// 6. 出库管理
// ============================================================

async function addStockOutApi(params) {
    return request('/stock-out', {
        method: 'POST',
        body: JSON.stringify(params)
    });
}

async function getStockOutHistoryApi() {
    return request('/stock-out');
}

// ============================================================
// 7. 教材订购（两步：先加教材，再创建订购单）
// ============================================================

async function orderBookApi(params) {
    // 第1步：添加教材
    var bookResult = await addBookApi({
        bookname: params.bookname,
        isbn: params.isbn,
        author: params.author,
        price: params.price,
        publisherId: params.publisherId,
        typeId: params.typeId,
        publishDate: params.publishDate
    });

    if (bookResult.code !== 200) {
        return bookResult;
    }

    // 第2步：通过 ISBN 查找刚创建的教材 ID
    var listResult = await getBookListApi({
        keyword: params.isbn,
        pageNum: 1,
        pageSize: 1
    });

    var bookId = null;
    if (listResult.code === 200 && listResult.data && listResult.data.rows && listResult.data.rows.length > 0) {
        bookId = listResult.data.rows[0].bookId;
    }

    if (!bookId) {
        return { code: 500, message: '教材创建成功但未能获取ID', data: null };
    }

    // 第3步：获取操作员ID
    var userInfo = getStoredUserInfo();
    var operatorId = userInfo ? userInfo.userId : 1;

    // 第4步：创建订购单
    return request('/orders', {
        method: 'POST',
        body: JSON.stringify({
            merchantName: '系统订购',
            merchantPhone: '-',
            operatorId: operatorId,
            demandId: null,
            details: [{ bookId: bookId, quantity: params.quantity || 1 }]
        })
    });
}

/**
 * 获取待入库/订购列表（扁平化处理）
 */
async function getPendingStockApi() {
    var result = await request('/orders');
    if (result.code !== 200 || !result.data) return result;

    // 将嵌套的订单明细扁平化为前端期望的格式
    var flatList = [];
    result.data.forEach(function (order) {
        if (order.details && order.details.length > 0) {
            order.details.forEach(function (detail) {
                flatList.push({
                    pendingId: order.OrderId,           // 用 OrderId 作为 pendingId
                    orderId: order.OrderId,
                    bookId: detail.BookId,
                    bookname: detail.Bookname || '',
                    isbn: detail.ISBN || '',
                    author: detail.Author || '',
                    price: detail.Price || 0,
                    quantity: detail.Quantity || 0,
                    publisherId: null,
                    publisherName: detail.PublisherName || '',
                    typeId: null,
                    typeName: detail.TypeName || '',
                    merchantName: order.MerchantName || '',
                    orderDate: order.OrderDate || ''
                });
            });
        }
    });
    return { code: 200, data: flatList };
}

/**
 * 移除订购记录
 */
async function removePendingStockApi(orderId) {
    return request('/orders/' + orderId, {
        method: 'DELETE'
    });
}

// ============================================================
// 8. 教材需求管理
// ============================================================

async function getDemandListApi(params) {
    if (!params) params = {};
    var url = '/demands';
    if (params.status) url += '?status=' + encodeURIComponent(params.status);
    return request(url);
}

async function addDemandApi(params) {
    return request('/demands', {
        method: 'POST',
        body: JSON.stringify(params)
    });
}

async function cancelDemandApi(demandId) {
    return request('/demands/' + demandId + '/cancel', {
        method: 'PUT'
    });
}

async function getBookListByTypeApi(params) {
    if (!params) params = {};
    return getBookListApi({
        typeId: params.typeId,
        pageNum: params.pageNum || 1,
        pageSize: params.pageSize || 10,
        keyword: params.keyword || ''
    });
}

// ============================================================
// 9. 统计
// ============================================================

async function getStatisticsApi() {
    return request('/statistics');
}

// ============================================================
// 10. 订购记录（仅 Admin）
// ============================================================

async function getOrderHistoryApi() {
    return request('/orders');
}

// ============================================================
// 11. 用户管理（仅 Admin）
// ============================================================

async function getUserListApi() {
    return request('/users');
}

async function addUserApi(params) {
    return request('/users', {
        method: 'POST',
        body: JSON.stringify(params)
    });
}

async function deleteUserApi(userId) {
    return request('/users/' + userId, {
        method: 'DELETE'
    });
}
