package com.textbook.model.entity;

/**
 * 订购主表实体 — 对应 BookOrder 表
 *
 * 数据库字段:
 *   OrderId, DemandId, MerchantName, MerchantPhone, Operator, OrderDate
 */
public class BookOrder {

    private Integer orderId;            // 订购ID（自增主键）
    private Integer demandId;           // 关联需求ID（可为空）
    private String merchantName;        // 供应商名称
    private String merchantPhone;       // 供应商电话
    private Integer operatorId;         // 操作员ID（外键 → Users）
    private String orderDate;           // 订购日期

    // ---- 关联字段 ----
    private String operatorName;        // 操作员名称（JOIN Users）

    // ===== Getter/Setter =====

    public Integer getOrderId() { return orderId; }
    public void setOrderId(Integer orderId) { this.orderId = orderId; }

    public Integer getDemandId() { return demandId; }
    public void setDemandId(Integer demandId) { this.demandId = demandId; }

    public String getMerchantName() { return merchantName; }
    public void setMerchantName(String merchantName) { this.merchantName = merchantName; }

    public String getMerchantPhone() { return merchantPhone; }
    public void setMerchantPhone(String merchantPhone) { this.merchantPhone = merchantPhone; }

    public Integer getOperatorId() { return operatorId; }
    public void setOperatorId(Integer operatorId) { this.operatorId = operatorId; }

    public String getOrderDate() { return orderDate; }
    public void setOrderDate(String orderDate) { this.orderDate = orderDate; }

    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String operatorName) { this.operatorName = operatorName; }
}
