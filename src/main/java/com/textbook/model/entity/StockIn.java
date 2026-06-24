package com.textbook.model.entity;

/**
 * 入库主表实体 — 对应 StockIn 表
 */
public class StockIn {

    private Integer stockInId;          // 入库ID（自增主键）
    private String stockInDate;         // 入库日期
    private Integer operatorId;         // 操作员ID（外键 → Users）

    // ---- 关联字段 ----
    private String operatorName;        // 操作员名称

    // ===== Getter/Setter =====

    public Integer getStockInId() { return stockInId; }
    public void setStockInId(Integer stockInId) { this.stockInId = stockInId; }

    public String getStockInDate() { return stockInDate; }
    public void setStockInDate(String stockInDate) { this.stockInDate = stockInDate; }

    public Integer getOperatorId() { return operatorId; }
    public void setOperatorId(Integer operatorId) { this.operatorId = operatorId; }

    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String operatorName) { this.operatorName = operatorName; }
}
