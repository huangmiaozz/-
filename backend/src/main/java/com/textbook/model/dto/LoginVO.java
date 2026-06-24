package com.textbook.model.dto;

import java.util.List;

/**
 * 登录响应 VO — 对应前端 loginApi 返回值 data 字段
 */
public class LoginVO {

    private String token;
    private UserInfoVO userInfo;
    private List<String> permissions;

    public LoginVO() {}

    public LoginVO(String token, UserInfoVO userInfo, List<String> permissions) {
        this.token = token;
        this.userInfo = userInfo;
        this.permissions = permissions;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public UserInfoVO getUserInfo() { return userInfo; }
    public void setUserInfo(UserInfoVO userInfo) { this.userInfo = userInfo; }

    public List<String> getPermissions() { return permissions; }
    public void setPermissions(List<String> permissions) { this.permissions = permissions; }
}
