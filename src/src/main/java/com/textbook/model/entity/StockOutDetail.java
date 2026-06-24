package com.textbook.model.entity;

/**
 * 出库明细实体 — 对应 StockOutDetails 表
 *
 * 注意：INSERT 到此表后，数据库触发器 StockOutUpdate 会自动扣减 TextBooks.Stock
 *       库存不足时触发器会 ROLLBACK + RAISERROR
 */
public class StockOutDetail {

    private Integer stockOutDetailId;   // 明细ID（自增主键）
    private Integer stockOutId;         // 出库ID（外键 → StockOut）
    private Integer bookId;             // 教材ID（外键 → TextBooks）
    private Integer quantity;           // 出库数量

    // ---- 关联字段 ----
    private String bookname;            // 教材名称

    // ===== Getter/Setter =====

    public Integer getStockOutDetailId() { return stockOutDetailId; }
    public void setStockOutDetailId(Integer stockOutDetailId) { this.stockOutDetailId = stockOutDetailId; }

    public Integer getStockOutId() { return stockOutId; }
    public void setStockOutId(Integer stockOutId) { this.stockOutId = stockOutId; }

    public Integer getBookId() { return bookId; }
    public void setBookId(Integer bookId) { this.bookId = bookId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getBookname() { return bookname; }
    public void setBookname(String bookname) { this.bookname = bookname; }
}
