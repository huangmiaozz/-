package com.textbook.model.entity;

/**
 * 需求主表实体 — 对应 BookDemands 表
 *
 * 数据库字段:
 *   DemandId, DemandTitle, RequesterId, DemandDate, Status, Notes
 */
public class BookDemand {

    private Integer demandId;           // 需求ID（自增主键）
    private String demandTitle;         // 需求标题
    private Integer requesterId;        // 需求提出人ID（外键 → Users）
    private String demandDate;          // 需求提出日期
    private String status;              // 状态: active/ordered/fulfilled/cancelled
    private String notes;               // 备注

    // ---- 关联字段 ----
    private String requesterName;       // 提出人名称（JOIN Users）

    // ===== Getter/Setter =====

    public Integer getDemandId() { return demandId; }
    public void setDemandId(Integer demandId) { this.demandId = demandId; }

    public String getDemandTitle() { return demandTitle; }
    public void setDemandTitle(String demandTitle) { this.demandTitle = demandTitle; }

    public Integer getRequesterId() { return requesterId; }
    public void setRequesterId(Integer requesterId) { this.requesterId = requesterId; }

    public String getDemandDate() { return demandDate; }
    public void setDemandDate(String demandDate) { this.demandDate = demandDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getRequesterName() { return requesterName; }
    public void setRequesterName(String requesterName) { this.requesterName = requesterName; }
}
