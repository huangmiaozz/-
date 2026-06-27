package com.textbook.model.entity;

/**
 * 出库主表实体 — 对应 StockOut 表（v3.0 合并版：主从双表合一）
 *
 * 数据库字段:
 *   StockOutId, BookId, Quantity, DemandId, StockOutDate, Operator
 * 复合主键: (StockOutId, BookId)
 * 触发器 StockOutUpdate 自动扣减库存（不足则回滚）
 */
public class StockOut {

    private Integer stockOutId;         // 出库ID（复合主键之一）
    private Integer bookId;             // 教材ID（复合主键之一，外键 → TextBooks）
    private Integer quantity;           // 出库数量
    private Integer demandId;           // 关联需求ID（可为空）
    private String stockOutDate;        // 出库日期
    private Integer operatorId;         // 操作员ID（外键 → Users）

    // ---- 关联字段 ----
    private String operatorName;        // 操作员名称
    private String bookname;            // 教材名称

    // ===== Getter/Setter =====

    public Integer getStockOutId() { return stockOutId; }
    public void setStockOutId(Integer stockOutId) { this.stockOutId = stockOutId; }

    public Integer getBookId() { return bookId; }
    public void setBookId(Integer bookId) { this.bookId = bookId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Integer getDemandId() { return demandId; }
    public void setDemandId(Integer demandId) { this.demandId = demandId; }

    public String getStockOutDate() { return stockOutDate; }
    public void setStockOutDate(String stockOutDate) { this.stockOutDate = stockOutDate; }

    public Integer getOperatorId() { return operatorId; }
    public void setOperatorId(Integer operatorId) { this.operatorId = operatorId; }

    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String operatorName) { this.operatorName = operatorName; }

    public String getBookname() { return bookname; }
    public void setBookname(String bookname) { this.bookname = bookname; }
}
