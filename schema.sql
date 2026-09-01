-- ============================================================
-- MiniMall · MySQL 数据库初始化脚本（MySQL 8.0）
-- 用法：mysql -u root -p < server/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS minimall
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE minimall;

DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- ---------- 用户表 ----------
CREATE TABLE users (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(64)  NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  name       VARCHAR(64)  NOT NULL DEFAULT '',
  phone      VARCHAR(32)  NOT NULL DEFAULT '',
  address    VARCHAR(255) NOT NULL DEFAULT '',
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- ---------- 商品表 ----------
CREATE TABLE products (
  id          VARCHAR(32)  PRIMARY KEY,
  name        VARCHAR(128) NOT NULL,
  price       INT          NOT NULL,
  image       VARCHAR(512),
  description TEXT,
  category    VARCHAR(64)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- ---------- 订单表 ----------
CREATE TABLE orders (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  items      JSON         NOT NULL,
  total_price INT         NOT NULL,
  status     ENUM ('待付款', '待收货', '已完成') NOT NULL DEFAULT '待付款',
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  KEY idx_orders_user (user_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- ---------- 商品种子数据（30 条） ----------
INSERT INTO products (id, name, price, image, description, category) VALUES
  ('1', 'iPhone 15 Pro', 7999, 'https://picsum.photos/300/300?random=1', 'A17 Pro芯片，钛金属边框，4800万像素主摄', '手机'),
  ('2', 'iPhone 15', 5999, 'https://picsum.photos/300/300?random=2', 'A16芯片，超视网膜XDR显示屏', '手机'),
  ('3', 'iPhone 14 Pro Max', 6999, 'https://picsum.photos/300/300?random=3', '灵动岛设计，4800万像素摄像系统', '手机'),
  ('4', '华为 Mate 60 Pro', 6999, 'https://picsum.photos/300/300?random=4', '卫星通信，超可靠玄武架构', '手机'),
  ('5', '小米14 Ultra', 6499, 'https://picsum.photos/300/300?random=5', '徕卡光学镜头，骁龙8 Gen3处理器', '手机'),
  ('6', '荣耀Magic6 Pro', 5699, 'https://picsum.photos/300/300?random=6', '鹰眼相机系统，旗舰性能', '手机'),
  ('7', 'MacBook Air M2', 9499, 'https://picsum.photos/300/300?random=7', 'M2芯片，轻薄设计，18小时续航', '笔记本'),
  ('8', 'MacBook Pro 14 M3 Pro', 16999, 'https://picsum.photos/300/300?random=8', 'M3 Pro芯片，Liquid视网膜XDR屏', '笔记本'),
  ('9', 'ThinkPad X1 Carbon', 10999, 'https://picsum.photos/300/300?random=9', '商务旗舰笔记本，轻薄耐用', '笔记本'),
  ('10', '华为 MateBook X Pro', 8999, 'https://picsum.photos/300/300?random=10', '3.1K触控屏，轻薄办公本', '笔记本'),
  ('11', '联想小新Pro 16', 6999, 'https://picsum.photos/300/300?random=11', '高性能轻薄本，适合学习办公', '笔记本'),
  ('12', 'AirPods Pro 2', 1899, 'https://picsum.photos/300/300?random=12', '主动降噪，自适应音频', '耳机'),
  ('13', 'AirPods 3', 1299, 'https://picsum.photos/300/300?random=13', '空间音频，开放式设计', '耳机'),
  ('14', '索尼 WH-1000XM5', 2599, 'https://picsum.photos/300/300?random=14', '旗舰降噪头戴耳机', '耳机'),
  ('15', 'Bose QuietComfort Ultra', 2799, 'https://picsum.photos/300/300?random=15', '沉浸式空间音频体验', '耳机'),
  ('16', 'iPad Air M1', 4799, 'https://picsum.photos/300/300?random=16', 'M1芯片，支持Apple Pencil', '平板'),
  ('17', 'iPad Pro M2', 6799, 'https://picsum.photos/300/300?random=17', '专业级平板，支持妙控键盘', '平板'),
  ('18', '华为MatePad Pro', 3999, 'https://picsum.photos/300/300?random=18', 'OLED全面屏，办公娱乐兼顾', '平板'),
  ('19', 'Apple Watch Series 9', 3199, 'https://picsum.photos/300/300?random=19', 'S9芯片，全天候视网膜显示屏，支持健康监测', '手表'),
  ('20', 'Apple Watch Ultra 2', 6499, 'https://picsum.photos/300/300?random=20', '专业户外智能手表，支持极限运动模式', '手表'),
  ('21', '华为 Watch GT 4', 1488, 'https://picsum.photos/300/300?random=21', '长续航智能手表，支持运动健康管理', '手表'),
  ('22', 'iMac 24英寸 M3', 10999, 'https://picsum.photos/300/300?random=22', '4.5K视网膜屏，M3芯片，一体式设计', '台式机'),
  ('23', 'Mac Studio M2 Max', 14999, 'https://picsum.photos/300/300?random=23', '专业级桌面性能，适合开发和创作', '台式机'),
  ('24', '联想拯救者台式机', 8999, 'https://picsum.photos/300/300?random=24', '高性能游戏主机，支持大型应用运行', '台式机'),
  ('25', 'AirTag', 779, 'https://picsum.photos/300/300?random=25', '精准查找设备，防止物品丢失', '配件'),
  ('26', 'Apple Magic Mouse', 549, 'https://picsum.photos/300/300?random=26', '多点触控无线鼠标', '配件'),
  ('27', 'Apple Magic Keyboard', 799, 'https://picsum.photos/300/300?random=27', '无线键盘，适配Mac设备', '配件'),
  ('28', '绿联100W氮化镓充电器', 299, 'https://picsum.photos/300/300?random=28', '多设备快充，小巧便携', '配件'),
  ('29', '雷电4扩展坞', 899, 'https://picsum.photos/300/300?random=29', '高速扩展接口，支持多屏输出', '配件'),
  ('30', 'MacBook保护套', 199, 'https://picsum.photos/300/300?random=30', '轻薄保护壳，防刮耐磨', '配件');
