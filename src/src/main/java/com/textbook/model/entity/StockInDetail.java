package com.textbook.model.entity;

/**
 * 入库明细实体 — 对应 StockInDetails 表
 *
 * 注意：INSERT 到此表后，数据库触发器 StockInUpdate 会自动增加 TextBooks.Stock
 */
public class StockInDetail {

    private Integer stockInDetailId;    // 明细ID（自增主键）
    private Integer stockInId;          // 入库ID（外键 → StockIn）
    private Integer bookId;             // 教材ID（外键 → TextBooks）
    private Integer quantity;           // 入库数量

    // ---- 关联字段 ----
    private String bookname;            // 教材名称

    // ===== Getter/Setter =====

    public Integer getStockInDetailId() { return stockInDetailId; }
    public void setStockInDetailId(Integer stockInDetailId) { this.stockInDetailId = stockInDetailId; }

    public Integer getStockInId() { return stockInId; }
    public void setStockInId(Integer stockInId) { this.stockInId = stockInId; }

    public Integer getBookId() { return bookId; }
    public void setBookId(Integer bookId) { this.bookId = bookId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getBookname() { return bookname; }
    public void setBookname(String bookname) { this.bookname = bookname; }
}
