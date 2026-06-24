package com.textbook.service;

import com.textbook.model.entity.Type;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 教材类型 Service — 对应前端 api.js 中的 getTypeListApi()
 */
@Service
public class TypeService {

    private final JdbcTemplate jdbc;

    public TypeService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * 获取所有教材类型
     */
    public List<Type> listAll() {
        String sql = "SELECT TypeId, TypeName FROM Types ORDER BY TypeId";
        return jdbc.query(sql, (rs, rowNum) -> {
            Type t = new Type();
            t.setTypeId(rs.getInt("TypeId"));
            t.setTypeName(rs.getString("TypeName"));
            return t;
        });
    }
}
