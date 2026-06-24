package com.textbook.common;

import java.util.List;

/**
 * 分页结果类 — 对应前端 getBookListApi 返回的 data 结构
 *
 * 前端期望格式:
 * {
 *   "code": 200,
 *   "data": {
 *     "total": 100,          // 总记录数
 *     "rows": [ ... ]        // 当前页数据
 *   }
 * }
 */
public class PageResult<T> {

    private long total;            // 总记录数
    private List<T> rows;          // 当前页数据列表

    // ---- 构造器 ----

    public PageResult() {}

    public PageResult(long total, List<T> rows) {
        this.total = total;
        this.rows = rows;
    }

    // ===== 静态工厂方法 =====

    /** 快速创建分页结果 */
    public static <T> PageResult<T> of(long total, List<T> rows) {
        return new PageResult<>(total, rows);
    }

    // ===== Getter/Setter =====

    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }
    public List<T> getRows() { return rows; }
    public void setRows(List<T> rows) { this.rows = rows; }
}
