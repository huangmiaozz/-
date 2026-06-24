package com.textbook.service;

import com.textbook.model.dto.PublisherDTO;
import com.textbook.model.entity.Publisher;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 出版社管理 Service — 对应前端 api.js 中的 getPublisherListApi / deletePublisherApi
 */
@Service
public class PublisherService {

    private final JdbcTemplate jdbc;

    public PublisherService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * 获取所有出版社
     */
    public List<Publisher> listAll() {
        String sql = "SELECT PublisherId, PublisherName, PublishAddress, PublishPhone " +
                     "FROM Publishers ORDER BY PublisherId";
        return jdbc.query(sql, (rs, rowNum) -> {
            Publisher p = new Publisher();
            p.setPublisherId(rs.getInt("PublisherId"));
            p.setPublisherName(rs.getString("PublisherName"));
            p.setPublishAddress(rs.getString("PublishAddress"));
            p.setPublishPhone(rs.getString("PublishPhone"));
            return p;
        });
    }

    /**
     * 添加出版社
     */
    @Transactional
    public void add(PublisherDTO dto) {
        String sql = "INSERT INTO Publishers (PublisherName, PublishAddress, PublishPhone) VALUES (?, ?, ?)";
        jdbc.update(sql, dto.getPublisherName(), dto.getPublishAddress(), dto.getPublishPhone());
    }

    /**
     * 删除出版社（注意：如果有关联教材，外键约束会阻止删除）
     */
    @Transactional
    public void delete(Integer publisherId) {
        jdbc.update("DELETE FROM Publishers WHERE PublisherId = ?", publisherId);
    }
}
