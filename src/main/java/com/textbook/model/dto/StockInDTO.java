package com.textbook.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/**
 * 入库请求 DTO — 对应前端 addStockInApi(params)
 *
 * 前端请求:
 * {
 *   "stockInDate": "2024-01-15",
 *   "operatorId": 1,
 *   "details": [
 *     { "bookId": 1, "quantity": 10 },
 *     { "bookId": 2, "quantity": 20 }
 *   ]
 * }
 */
public class StockInDTO {

    @NotBlank(message = "入库日期不能为空")
    private String stockInDate;

    @NotNull(message = "操作员ID不能为空")
    private Integer operatorId;

    @NotEmpty(message = "入库明细不能为空")
    private List<StockInDetailItem> details;

    // ===== 内部类：入库明细项 =====

    public static class StockInDetailItem {
        @NotNull(message = "教材ID不能为空")
        private Integer bookId;

        @NotNull(message = "数量不能为空")
        private Integer quantity;

        public Integer getBookId() { return bookId; }
        public void setBookId(Integer bookId) { this.bookId = bookId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }

    // ===== Getter/Setter =====

    public String getStockInDate() { return stockInDate; }
    public void setStockInDate(String stockInDate) { this.stockInDate = stockInDate; }

    public Integer getOperatorId() { return operatorId; }
    public void setOperatorId(Integer operatorId) { this.operatorId = operatorId; }

    public List<StockInDetailItem> getDetails() { return details; }
    public void setDetails(List<StockInDetailItem> details) { this.details = details; }
}
