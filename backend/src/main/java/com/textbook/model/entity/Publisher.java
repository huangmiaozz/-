package com.textbook.model.entity;

/**
 * 出版社实体 — 对应 Publishers 表
 *
 * 数据库字段:
 *   PublisherId, PublisherName, PublishAddress, PublishPhone
 */
public class Publisher {

    private Integer publisherId;        // 出版社ID（自增主键）
    private String publisherName;       // 出版社名称
    private String publishAddress;      // 出版社地址
    private String publishPhone;        // 出版社电话

    // ===== 构造器 =====

    public Publisher() {}

    public Publisher(Integer publisherId, String publisherName,
                     String publishAddress, String publishPhone) {
        this.publisherId = publisherId;
        this.publisherName = publisherName;
        this.publishAddress = publishAddress;
        this.publishPhone = publishPhone;
    }

    // ===== Getter/Setter =====

    public Integer getPublisherId() { return publisherId; }
    public void setPublisherId(Integer publisherId) { this.publisherId = publisherId; }

    public String getPublisherName() { return publisherName; }
    public void setPublisherName(String publisherName) { this.publisherName = publisherName; }

    public String getPublishAddress() { return publishAddress; }
    public void setPublishAddress(String publishAddress) { this.publishAddress = publishAddress; }

    public String getPublishPhone() { return publishPhone; }
    public void setPublishPhone(String publishPhone) { this.publishPhone = publishPhone; }
}
