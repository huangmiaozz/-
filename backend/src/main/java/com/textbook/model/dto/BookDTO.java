package com.textbook.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * 教材请求 DTO — 对应前端 addBookApi(params) / updateBookApi(id, params)
 *
 * 前端请求:
 * {
 *   "bookname": "高等数学",
 *   "isbn": "ISBN0000000001",
 *   "author": "张教授",
 *   "price": 45.0,
 *   "publisherId": 1,
 *   "typeId": 1,
 *   "publishDate": "2024-01-01"
 * }
 */
public class BookDTO {

    @NotBlank(message = "教材名称不能为空")
    private String bookname;

    @NotBlank(message = "ISBN不能为空")
    private String isbn;

    @NotBlank(message = "作者不能为空")
    private String author;

    @NotNull(message = "价格不能为空")
    @Positive(message = "价格必须大于0")
    private Double price;

    @NotNull(message = "出版社不能为空")
    private Integer publisherId;

    @NotNull(message = "类型不能为空")
    private Integer typeId;

    @NotBlank(message = "出版日期不能为空")
    private String publishDate;

    // ===== Getter/Setter =====

    public String getBookname() { return bookname; }
    public void setBookname(String bookname) { this.bookname = bookname; }

    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Integer getPublisherId() { return publisherId; }
    public void setPublisherId(Integer publisherId) { this.publisherId = publisherId; }

    public Integer getTypeId() { return typeId; }
    public void setTypeId(Integer typeId) { this.typeId = typeId; }

    public String getPublishDate() { return publishDate; }
    public void setPublishDate(String publishDate) { this.publishDate = publishDate; }
}
