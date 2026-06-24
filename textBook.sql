-- =============================================
-- 教材管理系统 数据库脚本 v2.0
-- 角色：Admin / DemandProvider / StockOperator / Viewer
-- 工作流：需求提出 → 库存操作员订购/入库 → 自动检测需求满足
-- =============================================

-- =============================================
-- 第一部分：删除旧表（按依赖顺序，从子表到父表）
-- 请先选中此部分执行，清理旧表
-- =============================================
-- 注意：删除顺序必须从最底层的子表开始，逐级向上删除父表
-- 否则外键约束会阻止删除被引用的表
DROP TABLE IF EXISTS BookDemandDetails;    -- 引用 BookDemands + TextBooks
GO
DROP TABLE IF EXISTS StockOutDetails;      -- 引用 StockOut + TextBooks
GO
DROP TABLE IF EXISTS StockOut;             -- 引用 BookDemands + Users
GO
DROP TABLE IF EXISTS BookOrderDetails;     -- 引用 BookOrder + TextBooks
GO
DROP TABLE IF EXISTS BookOrder;            -- 引用 BookDemands + Users
GO
DROP TABLE IF EXISTS BookDemands;          -- 引用 Users
GO
DROP TABLE IF EXISTS StockInDetails;       -- 引用 StockIn + TextBooks
GO
DROP TABLE IF EXISTS StockIn;              -- 引用 Users
GO
DROP TABLE IF EXISTS TextBooks;            -- 引用 Publishers + Types
GO
DROP TABLE IF EXISTS Types;
GO
DROP TABLE IF EXISTS Publishers;
GO
DROP TABLE IF EXISTS UserRoles;            -- 引用 Users + Roles
GO
DROP TABLE IF EXISTS RolePermissions;      -- 引用 Roles + Permissions
GO
DROP TABLE IF EXISTS Permissions;
GO
DROP TABLE IF EXISTS Roles;
GO
DROP TABLE IF EXISTS Users;
GO
DROP PROCEDURE IF EXISTS TextBookStatistics;
GO
DROP TRIGGER IF EXISTS StockInUpdate;
GO
DROP TRIGGER IF EXISTS StockOutUpdate;
GO
DROP TRIGGER IF EXISTS DemandAutoFulfill;
GO

-- =============================================
-- 第二部分：创建新表（按依赖顺序，从父表到子表）
-- =============================================

-- ==================== 基础数据表 ====================

-- 创建 Publishers 表（出版社信息表）
CREATE TABLE Publishers (
    PublisherId INT PRIMARY KEY IDENTITY(1,1),          -- 出版社ID，主键，自增（步长1，起始1）
    PublisherName NVARCHAR(100) NOT NULL,               -- 出版社名称，最长100字符，非空
    PublishAddress NVARCHAR(200) NOT NULL,              -- 出版社地址，最长200字符，非空
    PublishPhone NVARCHAR(20) NOT NULL                  -- 出版社电话，最长20字符，非空
);
GO

-- 创建 Types 表（教材类型/分类表）
CREATE TABLE Types (
    TypeId INT PRIMARY KEY IDENTITY(1,1),               -- 类型ID，主键，自增（步长1，起始1）
    TypeName NVARCHAR(50) NOT NULL                      -- 类型名称，最长50字符，非空
);
GO

-- 创建 TextBooks 表（教材信息主表）
CREATE TABLE TextBooks (
    BookId INT PRIMARY KEY IDENTITY(1,1),               -- 教材ID，主键，自增（步长1，起始1）
    Bookname NVARCHAR(100) NOT NULL,                    -- 教材名称，最长100字符，非空
    ISBN NVARCHAR(14) NOT NULL UNIQUE,                  -- ISBN号，最长14字符，非空且唯一
    Author NVARCHAR(100) NOT NULL,                      -- 作者，最长100字符，非空
    Price DECIMAL(10, 2) NOT NULL,                      -- 价格，总10位（小数2位），非空
    Stock INT NOT NULL CHECK(Stock >= 0),               -- 库存数量，非空，约束库存>=0
    PublisherId INT NOT NULL,                           -- 出版社ID，非空，外键关联出版社表
    TypeId INT NOT NULL,                                -- 类型ID，非空，外键关联类型表
    PublishDate DATE NOT NULL,                          -- 出版日期，非空
    FOREIGN KEY (PublisherId) REFERENCES Publishers(PublisherId),  -- 外键：出版社ID → Publishers表
    FOREIGN KEY (TypeId) REFERENCES Types(TypeId),                  -- 外键：类型ID → Types表
    CONSTRAINT CHK_ISBN CHECK (                                      -- 约束：校验ISBN格式
        ISBN LIKE 'ISBN[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'  -- ISBN必须为"ISBN"前缀 + 10位数字
    )
);
GO

-- 创建 Users 用户登录信息表
CREATE TABLE Users (
    UserId INT PRIMARY KEY IDENTITY(1,1),               -- 用户ID，主键，自增（步长1，起始1）
    Username NVARCHAR(50) NOT NULL UNIQUE,              -- 用户名，最长50字符，非空且唯一
    Password NVARCHAR(255) NOT NULL,                    -- 密码（应存储加密后的值），最长255字符，非空
    DisplayName NVARCHAR(100) NOT NULL,                 -- 显示名称/昵称，最长100字符，非空
    IsActive BIT NOT NULL DEFAULT 1,                    -- 是否启用，BIT类型，默认值1（启用）
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()       -- 创建时间，默认当前日期时间
);
GO

-- ==================== RBAC 权限体系 ====================

-- 1. 角色表（定义系统角色，如 Admin、DemandProvider 等）
CREATE TABLE Roles (
    RoleId INT PRIMARY KEY IDENTITY(1,1),               -- 角色ID，主键，自增（步长1，起始1）
    RoleName NVARCHAR(50) NOT NULL UNIQUE               -- 角色名称，最长50字符，非空且唯一
);
GO

-- 2. 权限表（定义系统所有可分配的权限项）
CREATE TABLE Permissions (
    PermissionId INT PRIMARY KEY IDENTITY(1,1),         -- 权限ID，主键，自增（步长1，起始1）
    PermissionCode NVARCHAR(100) NOT NULL UNIQUE,       -- 权限编码（如 book:view），最长100字符，非空且唯一
    PermissionName NVARCHAR(100) NOT NULL,              -- 权限名称（中文描述），最长100字符，非空
    Module NVARCHAR(50) NOT NULL                        -- 所属模块（如 教材管理、需求管理），最长50字符，非空
);
GO

-- 3. 角色-权限关联表（多对多：一个角色可拥有多个权限，一个权限可分配给多个角色）
CREATE TABLE RolePermissions (
    RolePermissionId INT PRIMARY KEY IDENTITY(1,1),     -- 关联ID，主键，自增
    RoleId INT NOT NULL,                                -- 角色ID，非空，外键关联角色表
    PermissionId INT NOT NULL,                          -- 权限ID，非空，外键关联权限表
    FOREIGN KEY (RoleId) REFERENCES Roles(RoleId),      -- 外键：角色ID → Roles表
    FOREIGN KEY (PermissionId) REFERENCES Permissions(PermissionId),  -- 外键：权限ID → Permissions表
    CONSTRAINT UQ_RolePermission UNIQUE (RoleId, PermissionId)        -- 唯一约束：同一角色不能重复分配同一权限
);
GO

-- 4. 用户-角色关联表（一对多：一个角色可分配给多个用户）
CREATE TABLE UserRoles (
    UserRoleId INT PRIMARY KEY IDENTITY(1,1),           -- 关联ID，主键，自增
    UserId INT NOT NULL,                                -- 用户ID，非空，外键关联用户表
    RoleId INT NOT NULL,                                -- 角色ID，非空，外键关联角色表
    FOREIGN KEY (UserId) REFERENCES Users(UserId),      -- 外键：用户ID → Users表
    FOREIGN KEY (RoleId) REFERENCES Roles(RoleId),      -- 外键：角色ID → Roles表
    CONSTRAINT UQ_UserRole UNIQUE (UserId, RoleId)      -- 唯一约束：同一用户不能重复分配同一角色
);
GO

-- ==================== 教材需求表 ====================

-- 需求主表（教材需求申请的主记录）
CREATE TABLE BookDemands (
    DemandId INT PRIMARY KEY IDENTITY(1,1),             -- 需求ID，主键，自增
    DemandTitle NVARCHAR(200) NOT NULL,                 -- 需求标题，最长200字符，非空
    RequesterId INT NOT NULL,                           -- 需求提出人ID（用户ID），非空
    DemandDate DATE NOT NULL DEFAULT GETDATE(),         -- 需求提出日期，默认当天
    Status NVARCHAR(20) NOT NULL DEFAULT 'active',      -- 需求状态：active→ordered→fulfilled/cancelled，默认active
    Notes NVARCHAR(500),                                -- 备注信息，最长500字符，可为空
    FOREIGN KEY (RequesterId) REFERENCES Users(UserId), -- 外键：提出人ID → Users表
    CONSTRAINT CHK_DemandStatus CHECK (Status IN ('active', 'ordered', 'fulfilled', 'cancelled'))  -- 约束：状态只能是四种之一
);
GO

-- 需求明细表（每个需求中具体需要的教材及数量）
CREATE TABLE BookDemandDetails (
    DemandDetailId INT PRIMARY KEY IDENTITY(1,1),       -- 明细ID，主键，自增
    DemandId INT NOT NULL,                              -- 需求ID，非空，外键关联需求主表
    BookId INT NOT NULL,                                -- 教材ID，非空，外键关联教材表
    Quantity INT NOT NULL CHECK(Quantity > 0),          -- 需求数量，非空，约束必须>0
    FulFilledQuantity INT NOT NULL DEFAULT 0,           -- 已满足数量，默认0，由入库触发器自动更新
    FOREIGN KEY (DemandId) REFERENCES BookDemands(DemandId),  -- 外键：需求ID → 需求主表
    FOREIGN KEY (BookId) REFERENCES TextBooks(BookId)         -- 外键：教材ID → 教材表
);
GO

-- ==================== 业务操作表 ====================

-- 创建 BookOrder 表（教材订购主表，可关联需求单）
CREATE TABLE BookOrder (
    OrderId INT PRIMARY KEY IDENTITY(1,1),              -- 订购ID，主键，自增
    DemandId INT NULL,                                  -- 关联需求ID，可为空（不关联需求时直接订购）
    MerchantName NVARCHAR(100) NOT NULL,                -- 供应商名称，最长100字符，非空
    MerchantPhone NVARCHAR(20) NOT NULL,                -- 供应商电话，最长20字符，非空
    Operator INT NOT NULL,                              -- 操作员ID，非空，外键关联用户表
    OrderDate DATE NOT NULL,                            -- 订购日期，非空
    FOREIGN KEY (DemandId) REFERENCES BookDemands(DemandId),  -- 外键：需求ID → 需求主表
    FOREIGN KEY (Operator) REFERENCES Users(UserId)          -- 外键：操作员ID → 用户表
);
GO

-- 创建 BookOrderDetails 表（订购明细，每本教材的订购数量）
CREATE TABLE BookOrderDetails(
    OrderDetailId INT PRIMARY KEY IDENTITY(1,1),        -- 明细ID，主键，自增
    OrderId INT NOT NULL,                               -- 订购ID，非空，外键关联订购主表
    BookId INT NOT NULL,                                -- 教材ID，非空，外键关联教材表
    Quantity INT NOT NULL,                              -- 订购数量，非空
    FOREIGN KEY (OrderId) REFERENCES BookOrder(OrderId),      -- 外键：订购ID → 订购主表
    FOREIGN KEY (BookId) REFERENCES TextBooks(BookId)         -- 外键：教材ID → 教材表
);
GO

-- 创建 StockIn 表（入库主表，记录入库操作）
CREATE TABLE StockIn(
    StockInId INT PRIMARY KEY IDENTITY(1,1),            -- 入库ID，主键，自增
    StockInDate DATE NOT NULL,                          -- 入库日期，非空
    Operator INT NOT NULL,                              -- 操作员ID，非空，外键关联用户表
    FOREIGN KEY (Operator) REFERENCES Users(UserId)     -- 外键：操作员ID → 用户表
);
GO

-- 创建 StockInDetails 表（入库明细，记录每本教材的入库数量，触发器自动更新库存）
CREATE TABLE StockInDetails(
    StockInDetailId INT PRIMARY KEY IDENTITY(1,1),      -- 明细ID，主键，自增
    StockInId INT NOT NULL,                             -- 入库ID，非空，外键关联入库主表
    BookId INT NOT NULL,                                -- 教材ID，非空，外键关联教材表
    Quantity INT NOT NULL,                              -- 入库数量，非空
    FOREIGN KEY (StockInId) REFERENCES StockIn(StockInId),    -- 外键：入库ID → 入库主表
    FOREIGN KEY (BookId) REFERENCES TextBooks(BookId)         -- 外键：教材ID → 教材表
);
GO

-- 创建 StockOut 表（出库主表，记录出库操作，可关联需求单）
CREATE TABLE StockOut(
    StockOutId INT PRIMARY KEY IDENTITY(1,1),           -- 出库ID，主键，自增
    DemandId INT NULL,                                  -- 关联需求ID，可为空
    StockOutDate DATE NOT NULL,                         -- 出库日期，非空
    Operator INT NOT NULL,                              -- 操作员ID，非空，外键关联用户表
    FOREIGN KEY (DemandId) REFERENCES BookDemands(DemandId),  -- 外键：需求ID → 需求主表
    FOREIGN KEY (Operator) REFERENCES Users(UserId)          -- 外键：操作员ID → 用户表
);
GO

-- 创建 StockOutDetails 表（出库明细，记录每本教材的出库数量，触发器自动扣减库存）
CREATE TABLE StockOutDetails(
    StockOutDetailId INT PRIMARY KEY IDENTITY(1,1),     -- 明细ID，主键，自增
    StockOutId INT NOT NULL,                            -- 出库ID，非空，外键关联出库主表
    BookId INT NOT NULL,                                -- 教材ID，非空，外键关联教材表
    Quantity INT NOT NULL,                              -- 出库数量，非空
    FOREIGN KEY (StockOutId) REFERENCES StockOut(StockOutId),  -- 外键：出库ID → 出库主表
    FOREIGN KEY (BookId) REFERENCES TextBooks(BookId)         -- 外键：教材ID → 教材表
);
GO

-- =============================================
-- 第三部分：插入基础数据
-- =============================================

-- 插入角色（4 个角色）
INSERT INTO Roles (RoleName) VALUES
('Admin'),
('DemandProvider'),
('StockOperator'),
('Viewer');
GO

-- 插入权限
INSERT INTO Permissions (PermissionCode, PermissionName, Module) VALUES
-- 教材管理
('book:view',    '查看教材',   '教材管理'),
('book:create',  '添加教材',   '教材管理'),
('book:edit',    '编辑教材',   '教材管理'),
('book:delete',  '删除教材',   '教材管理'),
-- 需求管理
('demand:view',    '查看需求',  '需求管理'),
('demand:create',  '创建需求',  '需求管理'),
('demand:edit',    '编辑需求',  '需求管理'),
('demand:delete',  '删除需求',  '需求管理'),
-- 订购管理
('order:view',   '查看订购', '订购管理'),
('order:create', '创建订购', '订购管理'),
('order:edit',   '编辑订购', '订购管理'),
('order:delete', '删除订购', '订购管理'),
-- 入库管理
('stockin:view',    '查看入库', '入库管理'),
('stockin:create',  '创建入库', '入库管理'),
('stockin:edit',    '编辑入库', '入库管理'),
('stockin:delete',  '删除入库', '入库管理'),
-- 出库管理
('stockout:view',    '查看出库', '出库管理'),
('stockout:create',  '创建出库', '出库管理'),
('stockout:edit',    '编辑出库', '出库管理'),
('stockout:delete',  '删除出库', '出库管理'),
-- 出版社管理
('publisher:view',   '查看出版社', '出版社管理'),
('publisher:create', '添加出版社', '出版社管理'),
('publisher:edit',   '编辑出版社', '出版社管理'),
('publisher:delete', '删除出版社', '出版社管理'),
-- 统计报表
('statistics:view', '查看统计', '统计报表'),
-- 系统管理
('user:view',   '查看用户', '系统管理'),
('user:create', '添加用户', '系统管理'),
('user:edit',   '编辑用户', '系统管理'),
('user:delete', '删除用户', '系统管理'),
('role:manage', '角色管理', '系统管理');
GO

-- ==================== 角色-权限分配 ====================

-- Admin：所有权限
INSERT INTO RolePermissions (RoleId, PermissionId)
SELECT r.RoleId, p.PermissionId
FROM Roles r, Permissions p
WHERE r.RoleName = 'Admin';
GO

-- DemandProvider：需求管理 CRUD + 教材查看 + 出版社查看/添加/删除 + 统计查看
INSERT INTO RolePermissions (RoleId, PermissionId)
SELECT r.RoleId, p.PermissionId
FROM Roles r, Permissions p
WHERE r.RoleName = 'DemandProvider'
  AND p.PermissionCode IN (
      'book:view',
      'demand:view', 'demand:create', 'demand:edit', 'demand:delete',
      'order:view',
      'stockin:view',
      'stockout:view',
      'publisher:view', 'publisher:create', 'publisher:delete',
      'statistics:view'
  );
GO

-- StockOperator：教材 CRUD + 订购 CRUD + 入库 CRUD + 出库 CRUD + 需求查看 + 出版社查看/添加/删除 + 统计查看
INSERT INTO RolePermissions (RoleId, PermissionId)
SELECT r.RoleId, p.PermissionId
FROM Roles r, Permissions p
WHERE r.RoleName = 'StockOperator'
  AND p.PermissionCode IN (
      'book:view', 'book:create', 'book:edit', 'book:delete',
      'demand:view',
      'order:view', 'order:create', 'order:edit', 'order:delete',
      'stockin:view', 'stockin:create', 'stockin:edit', 'stockin:delete',
      'stockout:view', 'stockout:create', 'stockout:edit', 'stockout:delete',
      'publisher:view', 'publisher:create', 'publisher:delete',
      'statistics:view'
  );
GO

-- Viewer：全局只读
INSERT INTO RolePermissions (RoleId, PermissionId)
SELECT r.RoleId, p.PermissionId
FROM Roles r, Permissions p
WHERE r.RoleName = 'Viewer'
  AND p.PermissionCode IN (
      'book:view',
      'demand:view',
      'order:view',
      'stockin:view',
      'stockout:view',
      'publisher:view',
      'statistics:view'
  );
GO

-- ==================== 默认用户 ====================

INSERT INTO Users (Username, Password, DisplayName) VALUES
('admin',      'admin123', '系统管理员'),
('demander',   '123456',   '需求提出者'),
('stockop',    '123456',   '库存操作员'),
('viewer',     '123456',   '只读用户');
GO

-- 为用户分配角色
INSERT INTO UserRoles (UserId, RoleId)
SELECT u.UserId, r.RoleId
FROM Users u, Roles r
WHERE u.Username = 'admin'    AND r.RoleName = 'Admin';
GO
INSERT INTO UserRoles (UserId, RoleId)
SELECT u.UserId, r.RoleId
FROM Users u, Roles r
WHERE u.Username = 'demander' AND r.RoleName = 'DemandProvider';
GO
INSERT INTO UserRoles (UserId, RoleId)
SELECT u.UserId, r.RoleId
FROM Users u, Roles r
WHERE u.Username = 'stockop'  AND r.RoleName = 'StockOperator';
GO
INSERT INTO UserRoles (UserId, RoleId)
SELECT u.UserId, r.RoleId
FROM Users u, Roles r
WHERE u.Username = 'viewer'   AND r.RoleName = 'Viewer';
GO

-- =============================================
-- 第四部分：触发器
-- =============================================

-- 入库触发器：增加库存
CREATE TRIGGER StockInUpdate ON StockInDetails
AFTER INSERT AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @BookId INT, @Quantity INT;
    DECLARE cur CURSOR FOR
        SELECT BookId, Quantity FROM inserted;
    
    OPEN cur;
    FETCH NEXT FROM cur INTO @BookId, @Quantity;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        UPDATE TextBooks
        SET Stock = Stock + @Quantity
        FROM TextBooks WITH (UPDLOCK, HOLDLOCK)
        WHERE BookId = @BookId;

        FETCH NEXT FROM cur INTO @BookId, @Quantity;
    END;
    
    CLOSE cur;
    DEALLOCATE cur;
END;
GO

-- 出库触发器：减少库存（含库存不足检测）
CREATE TRIGGER StockOutUpdate ON StockOutDetails
AFTER INSERT AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @BookId INT, @Quantity INT, @CurrentStock INT;
    DECLARE cur CURSOR FOR
        SELECT BookId, Quantity FROM inserted;
    
    OPEN cur;
    FETCH NEXT FROM cur INTO @BookId, @Quantity;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SELECT @CurrentStock = Stock
        FROM TextBooks WITH (UPDLOCK, HOLDLOCK)
        WHERE BookId = @BookId;

        IF @CurrentStock < @Quantity
        BEGIN
            RAISERROR(N'库存不足，无法出库！当前库存: %d，需要: %d', 16, 1, @CurrentStock, @Quantity);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        UPDATE TextBooks
        SET Stock = Stock - @Quantity
        WHERE BookId = @BookId;

        FETCH NEXT FROM cur INTO @BookId, @Quantity;
    END;
    
    CLOSE cur;
    DEALLOCATE cur;
END;
GO

-- =============================================
-- 需求自动满足检测触发器（核心业务逻辑）
-- 入库后自动检查：该教材的入库总量是否 >= 需求明细中的需求量
-- 如果所有明细都满足，则将需求状态改为 fulfilled
-- =============================================
CREATE TRIGGER DemandAutoFulfill ON StockInDetails
AFTER INSERT AS
BEGIN
    SET NOCOUNT ON;

    -- 对每个入库的 BookId，更新对应需求明细的 FulFilledQuantity
    UPDATE bdd
    SET FulFilledQuantity = (
        SELECT ISNULL(SUM(sid.Quantity), 0)
        FROM StockInDetails sid
        INNER JOIN StockIn si ON sid.StockInId = si.StockInId
        WHERE sid.BookId = bdd.BookId
    )
    FROM BookDemandDetails bdd
    INNER JOIN BookDemands bd ON bdd.DemandId = bd.DemandId
    WHERE bd.Status IN ('active', 'ordered')
      AND bdd.BookId IN (SELECT DISTINCT BookId FROM inserted);

    -- 将满足条件的需求状态改为 fulfilled
    UPDATE BookDemands
    SET Status = 'fulfilled'
    WHERE DemandId IN (
        SELECT bd.DemandId
        FROM BookDemands bd
        INNER JOIN BookDemandDetails bdd ON bd.DemandId = bdd.DemandId
        WHERE bd.Status IN ('active', 'ordered')
        GROUP BY bd.DemandId
        HAVING COUNT(CASE WHEN bdd.FulFilledQuantity >= bdd.Quantity THEN 1 END)
             = COUNT(*)
    );
END;
GO

-- =============================================
-- 第五部分：存储过程
-- =============================================

-- 统计教材的订购、入库、出库数量
CREATE PROCEDURE TextBookStatistics
    @BookId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        tb.BookId,
        tb.Bookname,
        tb.ISBN,
        tb.Stock AS CurrentStock,
        ISNULL(ord.OrderTotal, 0) AS OrderQuantity,
        ISNULL(sin.StockInTotal, 0) AS StockInQuantity,
        ISNULL(sout.StockOutTotal, 0) AS StockOutQuantity
    FROM TextBooks tb
    LEFT JOIN (
        SELECT BookId, SUM(Quantity) AS OrderTotal
        FROM BookOrderDetails
        GROUP BY BookId
    ) ord ON tb.BookId = ord.BookId
    LEFT JOIN (
        SELECT BookId, SUM(Quantity) AS StockInTotal
        FROM StockInDetails
        GROUP BY BookId
    ) sin ON tb.BookId = sin.BookId
    LEFT JOIN (
        SELECT BookId, SUM(Quantity) AS StockOutTotal
        FROM StockOutDetails
        GROUP BY BookId
    ) sout ON tb.BookId = sout.BookId
    WHERE (@BookId IS NULL OR tb.BookId = @BookId)
    ORDER BY tb.BookId;
END;
GO
