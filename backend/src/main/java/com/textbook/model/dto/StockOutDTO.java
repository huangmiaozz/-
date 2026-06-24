package com.textbook.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/**
 * 出库请求 DTO — 对应前端 addStockOutApi(params)
 *
 * 前端请求:
 * {
 *   "stockOutDate": "2024-01-15",
 *   "operatorId": 1,
 *   "details": [
 *     { "bookId": 1, "quantity": 5 }
 *   ]
 * }
 */
public class StockOutDTO {

    @NotBlank(message = "出库日期不能为空")
    private String stockOutDate;

    @NotNull(message = "操作员ID不能为空")
    private Integer operatorId;

    @NotEmpty(message = "出库明细不能为空")
    private List<StockOutDetailItem> details;

    // ===== 内部类：出库明细项 =====

    public static class StockOutDetailItem {
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

    public String getStockOutDate() { return stockOutDate; }
    public void setStockOutDate(String stockOutDate) { this.stockOutDate = stockOutDate; }

    public Integer getOperatorId() { return operatorId; }
    public void setOperatorId(Integer operatorId) { this.operatorId = operatorId; }

    public List<StockOutDetailItem> getDetails() { return details; }
    public void setDetails(List<StockOutDetailItem> details) { this.details = details; }
}
