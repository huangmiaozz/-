package com.textbook.controller;

import com.textbook.common.PageResult;
import com.textbook.common.Result;
import com.textbook.model.dto.BookDTO;
import com.textbook.model.entity.TextBook;
import com.textbook.service.BookService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 教材管理 Controller — 对应前端 api.js 中的:
 *   getBookListApi() / addBookApi() / updateBookApi()
 */
@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    /**
     * 分页查询教材列表
     *
     * 前端请求: GET /api/books?pageNum=1&pageSize=10&keyword=数学&typeId=2
     */
    @GetMapping
    @PreAuthorize("hasAuthority('book:view')")
    public Result<PageResult<TextBook>> list(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer typeId) {
        PageResult<TextBook> result = bookService.list(pageNum, pageSize, keyword, typeId);
        return Result.success(result);
    }

    /**
     * 添加教材
     *
     * 前端请求: POST /api/books
     *          Body: {"bookname":"xxx", "isbn":"xxx", ...}
     */
    @PostMapping
    @PreAuthorize("hasAuthority('book:create')")
    public Result<Void> add(@RequestBody @Valid BookDTO dto) {
        bookService.add(dto);
        return Result.success("添加成功");
    }

    /**
     * 更新教材
     *
     * 前端请求: PUT /api/books/1
     */
    @PutMapping("/{bookId}")
    @PreAuthorize("hasAuthority('book:edit')")
    public Result<Void> update(@PathVariable Integer bookId, @RequestBody @Valid BookDTO dto) {
        bookService.update(bookId, dto);
        return Result.success("更新成功");
    }

    /**
     * 删除教材
     *
     * 前端请求: DELETE /api/books/1
     */
    @DeleteMapping("/{bookId}")
    @PreAuthorize("hasAuthority('book:delete')")
    public Result<Void> delete(@PathVariable Integer bookId) {
        bookService.delete(bookId);
        return Result.success("删除成功");
    }
}
