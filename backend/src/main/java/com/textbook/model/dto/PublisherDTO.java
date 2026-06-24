package com.textbook.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * 出版社请求 DTO — 对应前端 addPublisher
 *
 * 前端请求:
 * {
 *   "publisherName": "人民教育出版社",
 *   "publishAddress": "北京市海淀区...",
 *   "publishPhone": "010-12345678"
 * }
 */
public class PublisherDTO {

    @NotBlank(message = "出版社名称不能为空")
    private String publisherName;

    @NotBlank(message = "地址不能为空")
    private String publishAddress;

    @NotBlank(message = "电话不能为空")
    private String publishPhone;

    // ===== Getter/Setter =====

    public String getPublisherName() { return publisherName; }
    public void setPublisherName(String publisherName) { this.publisherName = publisherName; }

    public String getPublishAddress() { return publishAddress; }
    public void setPublishAddress(String publishAddress) { this.publishAddress = publishAddress; }

    public String getPublishPhone() { return publishPhone; }
    public void setPublishPhone(String publishPhone) { this.publishPhone = publishPhone; }
}
