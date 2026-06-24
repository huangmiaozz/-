package com.textbook.model.entity;

/**
 * 教材实体 — 对应 TextBooks 表（核心表）
 *
 * 数据库字段:
 *   BookId, Bookname, ISBN, Author, Price, Stock,
 *   PublisherId, TypeId, PublishDate
 *
 * 注意：当 JOIN 查询时，会额外包含 PublisherName 和 TypeName（不在 TextBooks 表中）
 */
public class TextBook {

    private Integer bookId;            // 教材ID（自增主键）
    private String bookname;           // 教材名称
    private String isbn;               // ISBN号（唯一，格式: ISBN+10位数字）
    private String author;             // 作者
    private Double price;              // 价格
    private Integer stock;             // 库存数量
    private Integer publisherId;       // 出版社ID（外键 → Publishers）
    private Integer typeId;            // 类型ID（外键 → Types）
    private String publishDate;        // 出版日期

    // ---- 关联字段（JOIN 查询时才有值，不在 TextBooks 表中） ----
    private String publisherName;      // 出版社名称（来自 Publishers 表）
    private String typeName;           // 类型名称（来自 Types 表）

    // ===== 构造器 =====

    public TextBook() {}

    // ===== Getter/Setter =====

    public Integer getBookId() { return bookId; }
    public void setBookId(Integer bookId) { this.bookId = bookId; }

    public String getBookname() { return bookname; }
    public void setBookname(String bookname) { this.bookname = bookname; }

    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public Integer getPublisherId() { return publisherId; }
    public void setPublisherId(Integer publisherId) { this.publisherId = publisherId; }

    public Integer getTypeId() { return typeId; }
    public void setTypeId(Integer typeId) { this.typeId = typeId; }

    public String getPublishDate() { return publishDate; }
    public void setPublishDate(String publishDate) { this.publishDate = publishDate; }

    // ---- 关联字段 ----

    public String getPublisherName() { return publisherName; }
    public void setPublisherName(String publisherName) { this.publisherName = publisherName; }

    public String getTypeName() { return typeName; }
    public void setTypeName(String typeName) { this.typeName = typeName; }
}
