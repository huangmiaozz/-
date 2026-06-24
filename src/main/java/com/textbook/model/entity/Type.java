package com.textbook.model.entity;

/**
 * 教材类型实体 — 对应 Types 表
 *
 * 数据库字段:
 *   TypeId, TypeName
 */
public class Type {

    private Integer typeId;            // 类型ID（自增主键）
    private String typeName;           // 类型名称

    // ===== 构造器 =====

    public Type() {}

    public Type(Integer typeId, String typeName) {
        this.typeId = typeId;
        this.typeName = typeName;
    }

    // ===== Getter/Setter =====

    public Integer getTypeId() { return typeId; }
    public void setTypeId(Integer typeId) { this.typeId = typeId; }

    public String getTypeName() { return typeName; }
    public void setTypeName(String typeName) { this.typeName = typeName; }
}
