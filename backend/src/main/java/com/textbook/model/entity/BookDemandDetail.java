package com.textbook.model.entity;

/**
 * 需求明细实体 — 对应 BookDemandDetails 表
 *
 * 数据库字段:
 *   DemandDetailId, DemandId, BookId, Quantity, FulFilledQuantity
 */
public class BookDemandDetail {

    private Integer demandDetailId;     // 明细ID（自增主键）
    private Integer demandId;           // 需求ID（外键 → BookDemands）
    private Integer bookId;             // 教材ID（外键 → TextBooks）
    private Integer quantity;           // 需求数量
    private Integer fulFilledQuantity;  // 已满足数量（触发器自动更新）

    // ---- 关联字段 ----
    private String bookname;            // 教材名称（JOIN TextBooks）

    // ===== Getter/Setter =====

    public Integer getDemandDetailId() { return demandDetailId; }
    public void setDemandDetailId(Integer demandDetailId) { this.demandDetailId = demandDetailId; }

    public Integer getDemandId() { return demandId; }
    public void setDemandId(Integer demandId) { this.demandId = demandId; }

    public Integer getBookId() { return bookId; }
    public void setBookId(Integer bookId) { this.bookId = bookId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Integer getFulFilledQuantity() { return fulFilledQuantity; }
    public void setFulFilledQuantity(Integer fulFilledQuantity) { this.fulFilledQuantity = fulFilledQuantity; }

    public String getBookname() { return bookname; }
    public void setBookname(String bookname) { this.bookname = bookname; }
}
