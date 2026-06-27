package com.textbook.service;

import com.textbook.common.PageResult;
import com.textbook.model.dto.BookDTO;
import com.textbook.model.entity.TextBook;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;

/**
 * 教材管理 Service — 对应前端 api.js 中的 getBookListApi / addBookApi / updateBookApi
 */
@Service
public class BookService {

    private final JdbcTemplate jdbc;

    public BookService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * 分页查询教材列表（支持关键词搜索和按类型过滤）
     *
     * 对应前端: getBookListApi({ pageNum, pageSize, keyword, typeId })
     */
    public PageResult<TextBook> list(int pageNum, int pageSize, String keyword, Integer typeId) {
        // ---- 构建动态 SQL ----
        StringBuilder countSql = new StringBuilder(
            "SELECT COUNT(*) FROM TextBooks b " +
            "LEFT JOIN Types t ON b.TypeId = t.TypeId " +
            "WHERE 1=1");
        StringBuilder dataSql = new StringBuilder(
            "SELECT b.*, p.PublisherName, t.TypeName " +
            "FROM TextBooks b " +
            "LEFT JOIN Publishers p ON b.PublisherId = p.PublisherId " +
            "LEFT JOIN Types t ON b.TypeId = t.TypeId " +
            "WHERE 1=1");

        // 关键词过滤
        Object[] params;
        if (keyword != null && !keyword.isBlank()) {
            String like = "%" + keyword + "%";
            String where = " AND (b.Bookname LIKE ? OR b.ISBN LIKE ? OR b.Author LIKE ?)";
            countSql.append(where);
            dataSql.append(where);
            params = new Object[]{like, like, like};
        } else {
            params = new Object[]{};
        }

        // 按类型过滤
        Object[] countParams = params;
        Object[] dataParams = params;
        if (typeId != null) {
            String where = " AND b.TypeId = ?";
            countSql.append(where);
            dataSql.append(where);
            countParams = appendToArray(params, typeId);
            dataParams = appendToArray(params, typeId);
        }

        // 查询总数
        Long total = jdbc.queryForObject(countSql.toString(), Long.class, countParams);

        // 分页查询
        dataSql.append(" ORDER BY b.BookId OFFSET ? ROWS FETCH NEXT ? ROWS ONLY");
        int offset = (pageNum - 1) * pageSize;
        dataParams = appendToArray(dataParams, offset, pageSize);

        List<TextBook> rows = jdbc.query(dataSql.toString(), (rs, rowNum) -> {
            TextBook book = new TextBook();
            book.setBookId(rs.getInt("BookId"));
            book.setBookname(rs.getString("Bookname"));
            book.setIsbn(rs.getString("ISBN"));
            book.setAuthor(rs.getString("Author"));
            book.setPrice(rs.getDouble("Price"));
            book.setStock(rs.getInt("Stock"));
            book.setPublisherId(rs.getInt("PublisherId"));
            book.setTypeId(rs.getInt("TypeId"));
            book.setPublishDate(rs.getString("PublishDate"));
            book.setPublisherName(rs.getString("PublisherName"));
            book.setTypeName(rs.getString("TypeName"));
            return book;
        }, dataParams);

        return PageResult.of(total != null ? total : 0, rows);
    }

    /**
     * 添加教材
     *
     * 对应前端: addBookApi(params)
     */
    @Transactional
    public void add(BookDTO dto) {
        String sql = "INSERT INTO TextBooks (Bookname, ISBN, Author, Price, Stock, PublisherId, TypeId, PublishDate) " +
                     "VALUES (?, ?, ?, ?, 0, ?, ?, ?)";
        jdbc.update(sql,
                dto.getBookname(),
                dto.getIsbn(),
                dto.getAuthor(),
                dto.getPrice(),
                dto.getPublisherId(),
                dto.getTypeId(),
                dto.getPublishDate()
        );
    }

    /**
     * 更新教材
     *
     * 对应前端: updateBookApi(bookId, params)
     */
    @Transactional
    public void update(Integer bookId, BookDTO dto) {
        String sql = "UPDATE TextBooks SET Bookname=?, ISBN=?, Author=?, Price=?, " +
                     "PublisherId=?, TypeId=?, PublishDate=? WHERE BookId=?";
        jdbc.update(sql,
                dto.getBookname(),
                dto.getIsbn(),
                dto.getAuthor(),
                dto.getPrice(),
                dto.getPublisherId(),
                dto.getTypeId(),
                dto.getPublishDate(),
                bookId
        );
    }

    /**
     * 删除教材
     */
    @Transactional
    public void delete(Integer bookId) {
        jdbc.update("DELETE FROM TextBooks WHERE BookId = ?", bookId);
    }

    // ===== 工具方法 =====

    private Object[] appendToArray(Object[] original, Object... newItems) {
        Object[] result = new Object[original.length + newItems.length];
        System.arraycopy(original, 0, result, 0, original.length);
        System.arraycopy(newItems, 0, result, original.length, newItems.length);
        return result;
    }
}
