package com.textbook.model.entity;

/**
 * 出库主表实体 — 对应 StockOut 表
 */
public class StockOut {

    private Integer stockOutId;         // 出库ID（自增主键）
    private Integer demandId;           // 关联需求ID（可为空）
    private String stockOutDate;        // 出库日期
    private Integer operatorId;         // 操作员ID（外键 → Users）

    // ---- 关联字段 ----
    private String operatorName;        // 操作员名称

    // ===== Getter/Setter =====

    public Integer getStockOutId() { return stockOutId; }
    public void setStockOutId(Integer stockOutId) { this.stockOutId = stockOutId; }

    public Integer getDemandId() { return demandId; }
    public void setDemandId(Integer demandId) { this.demandId = demandId; }

    public String getStockOutDate() { return stockOutDate; }
    public void setStockOutDate(String stockOutDate) { this.stockOutDate = stockOutDate; }

    public Integer getOperatorId() { return operatorId; }
    public void setOperatorId(Integer operatorId) { this.operatorId = operatorId; }

    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String operatorName) { this.operatorName = operatorName; }
}
