package com.textbook.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/**
 * 订购请求 DTO — 对应前端 orderBookApi(params)
 *
 * 前端请求:
 * {
 *   "merchantName": "新华书店",
 *   "merchantPhone": "010-12345678",
 *   "operatorId": 1,
 *   "demandId": null,
 *   "details": [
 *     { "bookId": 1, "quantity": 10 }
 *   ]
 * }
 */
public class OrderDTO {

    @NotBlank(message = "供应商名称不能为空")
    private String merchantName;

    @NotBlank(message = "供应商电话不能为空")
    private String merchantPhone;

    @NotNull(message = "操作员ID不能为空")
    private Integer operatorId;

    private Integer demandId;          // 关联需求ID（可选）

    @NotEmpty(message = "订购明细不能为空")
    private List<OrderDetailItem> details;

    // ===== 内部类：订购明细项 =====

    public static class OrderDetailItem {
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

    public String getMerchantName() { return merchantName; }
    public void setMerchantName(String merchantName) { this.merchantName = merchantName; }

    public String getMerchantPhone() { return merchantPhone; }
    public void setMerchantPhone(String merchantPhone) { this.merchantPhone = merchantPhone; }

    public Integer getOperatorId() { return operatorId; }
    public void setOperatorId(Integer operatorId) { this.operatorId = operatorId; }

    public Integer getDemandId() { return demandId; }
    public void setDemandId(Integer demandId) { this.demandId = demandId; }

    public List<OrderDetailItem> getDetails() { return details; }
    public void setDetails(List<OrderDetailItem> details) { this.details = details; }
}
