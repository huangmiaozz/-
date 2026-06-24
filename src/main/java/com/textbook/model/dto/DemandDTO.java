package com.textbook.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/**
 * 需求请求 DTO — 对应前端 addDemandApi(params)
 *
 * 前端请求:
 * {
 *   "demandTitle": "2024秋季学期计算机系教材需求",
 *   "notes": "备注",
 *   "details": [
 *     { "bookId": 4, "quantity": 60 },
 *     { "bookId": 7, "quantity": 60 }
 *   ]
 * }
 */
public class DemandDTO {

    @NotBlank(message = "需求标题不能为空")
    private String demandTitle;

    private String notes;    // 备注（可选）

    @NotEmpty(message = "需求明细不能为空")
    private List<DemandDetailItem> details;

    // ===== 内部类：需求明细项 =====

    public static class DemandDetailItem {
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

    public String getDemandTitle() { return demandTitle; }
    public void setDemandTitle(String demandTitle) { this.demandTitle = demandTitle; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<DemandDetailItem> getDetails() { return details; }
    public void setDetails(List<DemandDetailItem> details) { this.details = details; }
}
