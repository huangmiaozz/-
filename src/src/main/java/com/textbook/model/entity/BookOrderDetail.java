package com.textbook.model.entity;

/**
 * 订购明细实体 — 对应 BookOrderDetails 表
 */
public class BookOrderDetail {

    private Integer orderDetailId;      // 明细ID
    private Integer orderId;            // 订购ID
    private Integer bookId;             // 教材ID
    private Integer quantity;           // 订购数量

    // ---- 关联字段 ----
    private String bookname;            // 教材名称

    // ===== Getter/Setter =====

    public Integer getOrderDetailId() { return orderDetailId; }
    public void setOrderDetailId(Integer orderDetailId) { this.orderDetailId = orderDetailId; }

    public Integer getOrderId() { return orderId; }
    public void setOrderId(Integer orderId) { this.orderId = orderId; }

    public Integer getBookId() { return bookId; }
    public void setBookId(Integer bookId) { this.bookId = bookId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getBookname() { return bookname; }
    public void setBookname(String bookname) { this.bookname = bookname; }
}
