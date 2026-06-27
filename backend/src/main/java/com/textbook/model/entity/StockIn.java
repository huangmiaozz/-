package com.textbook.model.entity;

/**
 * 入库主表实体 — 对应 StockIn 表（v3.0 合并版：主从双表合一）
 *
 * 数据库字段:
 *   StockInId, BookId, Quantity, StockInDate, Operator
 * 复合主键: (StockInId, BookId)
 * 触发器 StockInUpdate 自动更新 TextBooks.Stock
 */
public class StockIn {

    private Integer stockInId;          // 入库ID（复合主键之一）
    private Integer bookId;             // 教材ID（复合主键之一，外键 → TextBooks）
    private Integer quantity;           // 入库数量
    private String stockInDate;         // 入库日期
    private Integer operatorId;         // 操作员ID（外键 → Users）

    // ---- 关联字段 ----
    private String operatorName;        // 操作员名称
    private String bookname;            // 教材名称

    // ===== Getter/Setter =====

    public Integer getStockInId() { return stockInId; }
    public void setStockInId(Integer stockInId) { this.stockInId = stockInId; }

    public Integer getBookId() { return bookId; }
    public void setBookId(Integer bookId) { this.bookId = bookId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getStockInDate() { return stockInDate; }
    public void setStockInDate(String stockInDate) { this.stockInDate = stockInDate; }

    public Integer getOperatorId() { return operatorId; }
    public void setOperatorId(Integer operatorId) { this.operatorId = operatorId; }

    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String operatorName) { this.operatorName = operatorName; }

    public String getBookname() { return bookname; }
    public void setBookname(String bookname) { this.bookname = bookname; }
}
