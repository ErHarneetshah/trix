-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 04, 2024 at 03:57 PM
-- Server version: 8.0.40-0ubuntu0.20.04.1
-- PHP Version: 8.3.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `emonitrix`
--

-- --------------------------------------------------------

--
-- Table structure for table `access_tokens`
--

CREATE TABLE `access_tokens` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `isUserAdmin` int NOT NULL,
  `token` varchar(500) NOT NULL,
  `features` json DEFAULT NULL,
  `expiry_time` varchar(150) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '0 for expired, 1 for active',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `access_tokens`
--

INSERT INTO `access_tokens` (`id`, `userId`, `isUserAdmin`, `token`, `features`, `expiry_time`, `status`, `createdAt`) VALUES
(1, 1, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTczMzEyNDY5NCwiZXhwIjoxNzMzMjExMDk0fQ.v9YRqfir4jrk3ayPj4viXbrk4kFhpbDcvssn3hX3nIo', NULL, '2024-12-03 13:01:34', 1, '2024-12-02 07:31:34'),
(2, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMTI0NzI3LCJleHAiOjE3MzMyMTExMjd9.xkVKKhzSwX4Eu3mnrDlv5OF6StYAhLmj1sAqwXYECm0', NULL, '2024-12-03 13:02:07', 1, '2024-12-02 07:32:07'),
(3, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMTI1MjQwLCJleHAiOjE3MzMyMTE2NDB9.6H6hjsotUiqCb7ZQWlrhJ1onPitKwWs4HKv2M6EGpf4', NULL, '2024-12-03 13:10:40', 1, '2024-12-02 07:40:40'),
(4, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMTI1NDY1LCJleHAiOjE3MzMyMTE4NjV9.wzQkSC15Im9GaIkY-cjYNESwXX9kEiH7UsIIfwPi9s0', NULL, '2024-12-03 13:14:25', 1, '2024-12-02 07:44:25'),
(5, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMTI1NDk5LCJleHAiOjE3MzMyMTE4OTl9.nPDjr1wiUmhPUyBOymGizXmLw958K9W2dcWC8LMvNHQ', NULL, '2024-12-03 13:14:59', 1, '2024-12-02 07:44:59'),
(6, 2, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTczMzEyNTUxNSwiZXhwIjoxNzMzMjExOTE1fQ.wI5-Kos0IMI-wWZHwWz0UgdwEeJvS-kUEbdRPXp3z5A', NULL, '2024-12-03 13:15:15', 1, '2024-12-02 07:45:15'),
(7, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMTI1NTM5LCJleHAiOjE3MzMyMTE5Mzl9.mfisQGuMC2bwYjspZAxUIzSBamiYa3ZbQ3lFmghndMU', NULL, '2024-12-03 13:15:39', 1, '2024-12-02 07:45:39'),
(8, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMTI1NjY3LCJleHAiOjE3MzMyMTIwNjd9.mh-u4fSIaGMgeTBntlWpbAojjlFAahKbfeB-JU2ryYI', NULL, '2024-12-03 13:17:47', 1, '2024-12-02 07:47:47'),
(9, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMTI3MDI0LCJleHAiOjE3MzMyMTM0MjR9.H7c1ptgaFg1OG7DNXWjd5iMRIW_w_tGAScpuiH8ryXw', NULL, '2024-12-03 13:40:24', 1, '2024-12-02 08:10:24'),
(10, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMTI4MjkyLCJleHAiOjE3MzMyMTQ2OTJ9.o3kAPf6Kb6dZ-3o9MyGXDaXnlHmG8NIwBRPZ8ajxCX4', NULL, '2024-12-03 14:01:32', 1, '2024-12-02 08:31:32'),
(11, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMTI4MzQyLCJleHAiOjE3MzMyMTQ3NDJ9.qohiNkZBnlWw8KyWTd4TtUdWR2gKpy6tgoncW-Xt_14', NULL, '2024-12-03 14:02:22', 1, '2024-12-02 08:32:22'),
(12, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMTMxMjk3LCJleHAiOjE3MzMyMTc2OTd9.I5IszJ2fWuftARkiBlYkTvTUHUwiLDvPkF8aKzMrh-Q', NULL, '2024-12-03 14:51:37', 1, '2024-12-02 09:21:37'),
(13, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMTMxNzg5LCJleHAiOjE3MzMyMTgxODl9.cnvxzYzwKsd5fGXzwsaacDVShIK00zcywHLjOMUbqLs', NULL, '2024-12-03 14:59:49', 1, '2024-12-02 09:29:49'),
(14, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMTMyMDE4LCJleHAiOjE3MzMyMTg0MTh9.g9wF7PNTUq771u1YBjfW5wiGF1hhJ3rzP8qqPvlMo58', NULL, '2024-12-03 15:03:38', 1, '2024-12-02 09:33:38'),
(15, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMTMyMDQ1LCJleHAiOjE3MzMyMTg0NDV9.9BT-LtaSCyUTUrvRnZxMjlI2EeGC-JHGF7Ue6AFsEXE', NULL, '2024-12-03 15:04:05', 1, '2024-12-02 09:34:05'),
(16, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMTMyMDY3LCJleHAiOjE3MzMyMTg0Njd9.dsTE25rv7BjbSWjJqof8LPpUfV5j1DDqX6I2MbbNM0k', NULL, '2024-12-03 15:04:27', 1, '2024-12-02 09:34:27'),
(17, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMTMyMjA3LCJleHAiOjE3MzMyMTg2MDd9.iz4Dz6PZCKnUDcGW1oj605F_vC44NsG-zdMS3k62lXo', NULL, '2024-12-03 15:06:47', 1, '2024-12-02 09:36:47'),
(18, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMTM1NjQ2LCJleHAiOjE3MzMyMjIwNDZ9.C_qH3CwpincG914amRuUOsPq_3UPbM2aBW1TP6ojiaY', NULL, '2024-12-03 16:04:06', 1, '2024-12-02 10:34:06'),
(19, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMTM4NjA1LCJleHAiOjE3MzMyMjUwMDV9.g_-BceuQz3UvY2dbmhBMtZ4NQVGgBBGnt55qjkRmq4k', NULL, '2024-12-03 16:53:25', 1, '2024-12-02 11:23:25'),
(20, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMTM5NjE5LCJleHAiOjE3MzMyMjYwMTl9.60qZ8Y84SKf8WjypNIutMhc1g-yEf2CvSXsiNtDNtIw', NULL, '2024-12-03 17:10:19', 1, '2024-12-02 11:40:19'),
(21, 3, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTczMzEzOTc2NSwiZXhwIjoxNzMzMjI2MTY1fQ.dcl31eP5cWQwKIEt-Zvwk0MeHTO6IDntYkOUwk3DQ4Y', NULL, '2024-12-03 17:12:45', 1, '2024-12-02 11:42:45'),
(22, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMTQyMjg2LCJleHAiOjE3MzMyMjg2ODZ9.6N9A60WPi2OxYSWPrFNH5xqUylmR4_VsrusxBTthWY4', NULL, '2024-12-03 17:54:46', 1, '2024-12-02 12:24:46'),
(23, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMjAwNzA3LCJleHAiOjE3MzMyODcxMDd9.95MNFjqtyC7iXy9AaRnZsIRViPhMt6F8JipVB6Q9-EQ', NULL, '2024-12-04 10:08:27', 1, '2024-12-03 04:38:27'),
(24, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMjAxNTI1LCJleHAiOjE3MzMyODc5MjV9.ezWqulYqslD-LFu6etl4nuZohAVbbIHBJ9lkbMhehqM', NULL, '2024-12-04 10:22:05', 1, '2024-12-03 04:52:05'),
(25, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMjAzMDQ5LCJleHAiOjE3MzMyODk0NDl9.WeNGTx5Evo9ncJSfj4CxBiU1RoL21hBCuN4c8RHDMWg', NULL, '2024-12-04 10:47:29', 1, '2024-12-03 05:17:29'),
(26, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMjA0MzIzLCJleHAiOjE3MzMyOTA3MjN9.2r48fTw9a6W-ZX3PNEcnlVU-3V8zHweT-d7yU2Ycybw', NULL, '2024-12-04 11:08:43', 1, '2024-12-03 05:38:43'),
(27, 2, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTczMzIwNDk2MiwiZXhwIjoxNzMzMjkxMzYyfQ.SueYiwWJVHhzY8MD85KomvOJzAkkv3JCIbB0FQQCrTk', NULL, '2024-12-04 11:19:22', 1, '2024-12-03 05:49:22'),
(28, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMjA1NjYzLCJleHAiOjE3MzMyOTIwNjN9.ijedNBVxC7FQWH1UFkb5wNedQ-A7A3KDDVMsr9F6REw', NULL, '2024-12-04 11:31:03', 1, '2024-12-03 06:01:03'),
(29, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMjA3MDM5LCJleHAiOjE3MzMyOTM0Mzl9.i3UCkreMO7RM9BvgUk_n057IkRs7xx7vCg98i6Cq-lA', NULL, '2024-12-04 11:53:59', 1, '2024-12-03 06:23:59'),
(30, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMjA3MDY5LCJleHAiOjE3MzMyOTM0Njl9.cSGIWaC-lc6Ksf9-qGSmKcBWdy0NOTVJQxmVaieiumA', NULL, '2024-12-04 11:54:29', 1, '2024-12-03 06:24:29'),
(31, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMjA3MTQ3LCJleHAiOjE3MzMyOTM1NDd9.tK-NWNNQyfzFMS__vw4Mza1ZcUwo8Rqa-5Nq5zRuUUY', NULL, '2024-12-04 11:55:47', 1, '2024-12-03 06:25:47'),
(32, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMjEzOTMyLCJleHAiOjE3MzMzMDAzMzJ9.JEKfNoyiabD0Mq-WgWWi7YWhRh7ZqFLXY7pnbCkOAn8', NULL, '2024-12-04 13:48:52', 1, '2024-12-03 08:18:52'),
(33, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMjE5NzY5LCJleHAiOjE3MzMzMDYxNjl9.V0OCP-p5lHyi491SLR02ZZRocrBa-cjHwNd_lGGbT7g', NULL, '2024-12-04 15:26:09', 1, '2024-12-03 09:56:09'),
(34, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMjIwOTc0LCJleHAiOjE3MzMzMDczNzR9.c9-gh-1PAFxnhnSbZVJ0feIsXPen4FWjzcltqkl04Vk', NULL, '2024-12-04 15:46:14', 1, '2024-12-03 10:16:14'),
(35, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMjIxNTE4LCJleHAiOjE3MzMzMDc5MTh9.rmollvkLsfyFvUrpP9hD4VOzeyCkRqVVAR65A5Mb0-k', NULL, '2024-12-04 15:55:18', 1, '2024-12-03 10:25:18'),
(36, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMjMzNDc2LCJleHAiOjE3MzMzMTk4NzZ9.iP3uSranWk_tOu9sW7S_I09__8sOgFsERpZWUBQTSaY', NULL, '2024-12-04 19:14:36', 1, '2024-12-03 13:44:36'),
(37, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMjMzNDkxLCJleHAiOjE3MzMzMTk4OTF9.S4NeeFlNFvIneaE_w0IiMrQ2x2FgmMA6UTYHCh-jVg4', NULL, '2024-12-04 19:14:51', 1, '2024-12-03 13:44:51'),
(38, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMjMzNTI2LCJleHAiOjE3MzMzMTk5MjZ9.2JLVwgTEOswSSknTvXqxQKLGhPxqEmxdPNWsUk3zTVc', NULL, '2024-12-04 19:15:26', 1, '2024-12-03 13:45:26'),
(39, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMjMzODIwLCJleHAiOjE3MzMzMjAyMjB9._6du5FRWfB9iriwc4UJkRqQ5ZNBLQwAIBN49_qu7ay0', NULL, '2024-12-04 19:20:20', 1, '2024-12-03 13:50:20'),
(40, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMjg1MDY5LCJleHAiOjE3MzMzNzE0Njl9.YZEDdr2chM00uD1Vj0sL0zvVvw9crkAGwCi0wQoAhaI', NULL, '2024-12-05 09:34:29', 1, '2024-12-04 04:04:29'),
(41, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMjg2OTU1LCJleHAiOjE3MzMzNzMzNTV9.E_B4YJ1r3PzOKhtoXVBCdU4MKRle-fbZ07-KplpMsHw', NULL, '2024-12-05 10:05:55', 1, '2024-12-04 04:35:55'),
(42, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMjkyMzM4LCJleHAiOjE3MzMzNzg3Mzh9.NzUzF-olzeXKM1NcrPxL93KHxTZmxCiin9pKkfGDbnM', NULL, '2024-12-05 11:35:38', 1, '2024-12-04 06:05:38'),
(43, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMjk4MzIyLCJleHAiOjE3MzMzODQ3MjJ9.cWe0vhqH7iVhXAtGSgUo1ArvKbwjykhr0N0PNSbzjms', NULL, '2024-12-05 13:15:22', 1, '2024-12-04 07:45:22'),
(44, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMjk4MzQyLCJleHAiOjE3MzMzODQ3NDJ9.UGOND-WBHjTfpGauFNb6vAFEPPVUkcYvsZgJ5gBEOtw', NULL, '2024-12-05 13:15:42', 1, '2024-12-04 07:45:42'),
(45, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMjk5ODE0LCJleHAiOjE3MzMzODYyMTR9.UoSMOBYRISkhlX6eZIN07pGD4Ez5ME6xoapjW00hGRQ', NULL, '2024-12-05 13:40:14', 1, '2024-12-04 08:10:14'),
(46, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMzAwMTA0LCJleHAiOjE3MzMzODY1MDR9.luqubWUWWGp58ZJR_IJNLPJvpu87rGRaxJQNTFPTQTo', NULL, '2024-12-05 13:45:04', 1, '2024-12-04 08:15:04'),
(47, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMzA1NDAwLCJleHAiOjE3MzMzOTE4MDB9.dGW-Y4VoLIkItbLw06FBxBuaiAUU50_bZxYDUN4u-xk', NULL, '2024-12-05 15:13:20', 1, '2024-12-04 09:43:20'),
(48, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMzA1ODYxLCJleHAiOjE3MzMzOTIyNjF9.uaN2FMzq-IzaiCCc0nB3TZldwTkJ9P5PXL8-OheZLXU', NULL, '2024-12-05 15:21:01', 1, '2024-12-04 09:51:01'),
(49, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMzA1ODgyLCJleHAiOjE3MzMzOTIyODJ9.AJY4v3nPTO-yIhZyUR53Vi4T1xqrDQFOGTr6Yjag5-Q', NULL, '2024-12-05 15:21:22', 1, '2024-12-04 09:51:22'),
(50, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMzA5ODc1LCJleHAiOjE3MzMzOTYyNzV9.1vXXrGn233z1mWcj1b_lCw0a2BVnO-G8z07_a5h2xr0', NULL, '2024-12-05 16:27:55', 1, '2024-12-04 10:57:55'),
(51, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMzA5OTk2LCJleHAiOjE3MzMzOTYzOTZ9.vnlGxxmjIEf8Krx88u4Po-Tmtp-HxG8_xSd1-tFX_VE', NULL, '2024-12-05 16:29:56', 1, '2024-12-04 10:59:56'),
(52, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMzEwNzM1LCJleHAiOjE3MzMzOTcxMzV9.sP0DuBmTqPvAWStCb8sJydFnWogaaoMaenCTmDdsdFI', NULL, '2024-12-05 16:42:15', 1, '2024-12-04 11:12:15');

-- --------------------------------------------------------

--
-- Table structure for table `blockedWebsites`
--

CREATE TABLE `blockedWebsites` (
  `id` int NOT NULL,
  `Department_id` int NOT NULL,
  `Sites` varchar(255) NOT NULL,
  `Status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1=> Blocked Websites,0=>Unblock Websites',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `blockedWebsites`
--

INSERT INTO `blockedWebsites` (`id`, `Department_id`, `Sites`, `Status`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'facebook', 1, '2024-11-29 09:26:13', '2024-12-02 05:36:16'),
(2, 2, 'instagram', 1, '2024-11-29 09:28:49', '2024-11-29 12:54:47'),
(3, 3, 'whatsapp', 1, '2024-11-29 09:33:34', '2024-11-29 09:33:34'),
(4, 4, 'aneth', 1, '2024-11-29 09:41:54', '2024-11-29 09:41:54'),
(5, 4, 'qurio', 1, '2024-12-02 04:58:19', '2024-12-02 04:58:19'),
(6, 4, 'test', 1, '2024-12-02 09:58:29', '2024-12-02 09:58:29');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int NOT NULL,
  `name` varchar(150) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '0 for inactive, 1 for active',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'Nodejs', 1, '2024-11-28 08:12:20', '2024-11-28 08:17:12'),
(33, 'Test Department 1', 1, '2024-12-03 05:24:37', '2024-12-03 05:24:37'),
(34, 'Test Department 2', 1, '2024-12-03 05:24:47', '2024-12-03 05:24:47'),
(36, 'aa', 1, '2024-12-03 14:12:29', '2024-12-03 14:12:29'),
(37, 'test', 1, '2024-12-04 06:41:51', '2024-12-04 06:41:51'),
(38, 'Department', 1, '2024-12-04 12:14:23', '2024-12-04 12:14:23');

-- --------------------------------------------------------

--
-- Table structure for table `designations`
--

CREATE TABLE `designations` (
  `id` int NOT NULL,
  `name` varchar(150) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '0 for inactive, 1 for active',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `designations`
--

INSERT INTO `designations` (`id`, `name`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'Admin', 1, '2024-11-28 09:36:28', '2024-11-28 09:36:28'),
(9, 'Testing designation 1', 1, '2024-12-03 05:22:49', '2024-12-03 05:25:11'),
(10, 'Testing designation 2', 1, '2024-12-03 05:23:00', '2024-12-03 05:25:04'),
(11, 'ss', 1, '2024-12-04 06:45:15', '2024-12-04 06:45:15'),
(12, 'Testing Designation', 1, '2024-12-04 12:14:55', '2024-12-04 12:14:55');

-- --------------------------------------------------------

--
-- Table structure for table `email_gateways`
--

CREATE TABLE `email_gateways` (
  `id` int NOT NULL,
  `protocol` varchar(255) NOT NULL COMMENT 'Protocol type (e.g., SMTP, HTTP)',
  `host` varchar(255) NOT NULL COMMENT 'Host address of the email gateway',
  `username` varchar(255) NOT NULL COMMENT 'Username (email address) for authentication',
  `password` varchar(255) NOT NULL COMMENT 'Password for authentication',
  `port` varchar(255) NOT NULL COMMENT 'Port number for connection',
  `encryption` varchar(255) NOT NULL COMMENT 'Encryption type (e.g., SSL, TLS)',
  `is_active` tinyint NOT NULL DEFAULT '1' COMMENT '1 => Active, 0 => Not Active',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `email_gateways`
--

INSERT INTO `email_gateways` (`id`, `protocol`, `host`, `username`, `password`, `port`, `encryption`, `is_active`, `createdAt`, `updatedAt`) VALUES
(1, 'smtp', 'smtp.gmail.com', 'shubhamkumar78767@gmail.com', 'xifulejbpkkoqhez', '587', 'tls', 1, '2024-12-02 11:33:06', '2024-12-02 11:33:06');

-- --------------------------------------------------------

--
-- Table structure for table `modules`
--

CREATE TABLE `modules` (
  `id` int NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `modules`
--

INSERT INTO `modules` (`id`, `name`, `createdAt`) VALUES
(1, 'role', '2024-12-04 13:39:50'),
(2, 'reportingManager', '2024-12-04 13:39:50'),
(3, 'team', '2024-12-04 13:39:50'),
(4, 'shifts', '2024-12-04 13:39:50'),
(5, 'teamMembers', '2024-12-04 13:39:50'),
(6, 'department', '2024-12-04 13:39:50'),
(7, 'designation', '2024-12-04 13:39:50'),
(8, 'adminAuth', '2024-12-04 13:39:50'),
(9, 'userSettings', '2024-12-04 13:39:50'),
(10, 'permissions', '2024-12-04 13:39:50'),
(11, 'blockedWebsite', '2024-12-04 13:39:50'),
(12, 'productiveApp', '2024-12-04 13:39:50'),
(13, 'reportSettings', '2024-12-04 13:39:50'),
(14, 'user', '2024-12-04 13:39:50');

-- --------------------------------------------------------

--
-- Table structure for table `productive_nonproductive_apps`
--

CREATE TABLE `productive_nonproductive_apps` (
  `id` int NOT NULL,
  `department_id` int NOT NULL,
  `app_logo` text,
  `appname` varchar(255) NOT NULL,
  `website_url` text NOT NULL,
  `is_productive` tinyint DEFAULT NULL COMMENT '1 => Productive App,0=>Non Productive Apps',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `productive_nonproductive_apps`
--

INSERT INTO `productive_nonproductive_apps` (`id`, `department_id`, `app_logo`, `appname`, `website_url`, `is_productive`, `createdAt`, `updatedAt`) VALUES
(1, 4, '/images/logos/app1.png', 'Health Care', 'https://www.taskmanager.com', 1, '2024-11-29 11:15:04', '2024-11-29 11:15:04'),
(2, 4, '/images/logos/app1.png', 'Health Care', 'https://www.taskmanager.com', 1, '2024-11-29 11:40:34', '2024-11-29 11:40:34'),
(3, 4, '/images/logos/app1.png', 'Health Care', 'https://www.taskmanager.com', 1, '2024-11-29 11:40:47', '2024-11-29 11:40:47'),
(4, 4, '/images/logos/app1.png', 'Health Care', 'https://www.taskmanager.com', 1, '2024-11-29 11:41:06', '2024-11-29 11:41:06'),
(5, 4, '/images/logos/app1.png', 'Health Care', 'https://www.taskmanager.com', 0, '2024-11-29 11:41:53', '2024-11-29 11:41:53'),
(6, 4, '/images/logos/app1.png', 'Health Care', 'https://www.taskmanager.com', 0, '2024-11-29 13:03:52', '2024-11-29 13:03:52'),
(7, 5, '/images/logos/bird.png', 'Angry Bird', 'https://www.taskmanager.com', 1, '2024-12-02 05:54:16', '2024-12-02 05:54:16'),
(8, 5, '/images/logos/hurray.png', 'hurray', 'https://www.hurray.com', 1, '2024-12-02 10:01:52', '2024-12-02 10:01:52');

-- --------------------------------------------------------

--
-- Table structure for table `reporting_managers`
--

CREATE TABLE `reporting_managers` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `teamId` int NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '0 for inactive, 1 for active',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `report_settings`
--

CREATE TABLE `report_settings` (
  `id` int NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1' COMMENT '1 => Active ,0=>Not Active',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `report_settings`
--

INSERT INTO `report_settings` (`id`, `name`, `is_active`, `createdAt`, `updatedAt`) VALUES
(1, 'daily', 1, '2024-11-29 17:56:29', '2024-12-03 04:49:41'),
(2, 'weekly', 0, '2024-11-29 17:56:29', '2024-11-29 12:42:56'),
(3, 'monthly', 0, '2024-11-29 17:56:29', '2024-12-03 04:49:41');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `name` varchar(150) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '0 for inactive, 1 for active',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `status`, `createdAt`, `updatedAt`) VALUES
(7, 'user1', 1, '2024-12-03 09:53:49', '2024-12-03 09:53:49'),
(10, 'dd', 1, '2024-12-03 10:05:42', '2024-12-03 10:05:42'),
(12, 'qw', 1, '2024-12-03 10:09:53', '2024-12-03 10:09:53'),
(13, 'qwqw', 1, '2024-12-03 10:09:57', '2024-12-03 10:09:57'),
(14, 'dasdasd', 1, '2024-12-03 10:09:59', '2024-12-03 10:09:59'),
(15, 'user2sd', 1, '2024-12-03 10:27:25', '2024-12-04 11:40:05'),
(16, 'user2sdsdss', 1, '2024-12-03 10:29:38', '2024-12-03 10:29:38'),
(28, 'Module Test', 1, '2024-12-04 14:04:08', '2024-12-04 14:04:08'),
(30, 'Module Test 2', 1, '2024-12-04 14:06:05', '2024-12-04 14:06:05');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` int NOT NULL,
  `roleId` int NOT NULL,
  `modules` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `permissions` json NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`id`, `roleId`, `modules`, `permissions`, `createdAt`) VALUES
(1, 30, 'adminAuth', '{\"GET\": false, \"PUT\": false, \"POST\": false, \"DELETE\": false}', '2024-12-04 14:06:05'),
(2, 30, 'blockedWebsite', '{\"GET\": false, \"PUT\": false, \"POST\": false, \"DELETE\": false}', '2024-12-04 14:06:05'),
(3, 30, 'department', '{\"GET\": false, \"PUT\": false, \"POST\": false, \"DELETE\": false}', '2024-12-04 14:06:05'),
(4, 30, 'designation', '{\"GET\": false, \"PUT\": false, \"POST\": false, \"DELETE\": false}', '2024-12-04 14:06:05'),
(5, 30, 'permissions', '{\"GET\": false, \"PUT\": false, \"POST\": false, \"DELETE\": false}', '2024-12-04 14:06:05'),
(6, 30, 'productiveApp', '{\"GET\": false, \"PUT\": false, \"POST\": false, \"DELETE\": false}', '2024-12-04 14:06:05'),
(7, 30, 'reportingManager', '{\"GET\": false, \"PUT\": false, \"POST\": false, \"DELETE\": false}', '2024-12-04 14:06:05'),
(8, 30, 'reportSettings', '{\"GET\": false, \"PUT\": false, \"POST\": false, \"DELETE\": false}', '2024-12-04 14:06:05'),
(9, 30, 'role', '{\"GET\": false, \"PUT\": false, \"POST\": false, \"DELETE\": false}', '2024-12-04 14:06:05'),
(10, 30, 'shifts', '{\"GET\": false, \"PUT\": false, \"POST\": false, \"DELETE\": false}', '2024-12-04 14:06:05'),
(11, 30, 'team', '{\"GET\": false, \"PUT\": false, \"POST\": false, \"DELETE\": false}', '2024-12-04 14:06:05'),
(12, 30, 'teamMembers', '{\"GET\": false, \"PUT\": false, \"POST\": false, \"DELETE\": false}', '2024-12-04 14:06:05'),
(13, 30, 'user', '{\"GET\": false, \"PUT\": false, \"POST\": false, \"DELETE\": false}', '2024-12-04 14:06:05'),
(14, 30, 'userSettings', '{\"GET\": false, \"PUT\": false, \"POST\": false, \"DELETE\": false}', '2024-12-04 14:06:05');

-- --------------------------------------------------------

--
-- Table structure for table `shifts`
--

CREATE TABLE `shifts` (
  `id` int NOT NULL,
  `name` varchar(150) NOT NULL,
  `start_time` varchar(50) NOT NULL,
  `end_time` varchar(50) NOT NULL,
  `days` json NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0 for inactive, 1 for active',
  `total_hours` float NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `shifts`
--

INSERT INTO `shifts` (`id`, `name`, `start_time`, `end_time`, `days`, `status`, `total_hours`, `createdAt`, `updatedAt`) VALUES
(1, 'Test Shift 1', '08:00', '15:00', '[\"Mon\", \"Tue\", \"Sat\", \"Fri\"]', 1, 7, '2024-12-03 07:49:46', '2024-12-04 06:48:14'),
(34, 'Test 2', '09:00', '06:00', '[\"Mon\", \"Tue\", \"Sun\", \"Wed\", \"Sat\", \"Fri\", \"Thu\"]', 1, 21, '2024-12-04 06:51:26', '2024-12-04 06:52:02'),
(35, 'Test 3', '11:', '08:', '[\"Mon\", \"Thu\", \"Fri\"]', 1, 21, '2024-12-04 06:53:30', '2024-12-04 06:53:30'),
(36, 'Test 4', '12:', '15:', '[\"Mon\", \"Tue\"]', 1, 3, '2024-12-04 06:55:46', '2024-12-04 06:55:46'),
(37, 'Test ', '15:00', '19:00', '[\"Mon\", \"Tue\", \"Wed\"]', 1, 4, '2024-12-04 07:01:16', '2024-12-04 07:01:16');

-- --------------------------------------------------------

--
-- Table structure for table `teams`
--

CREATE TABLE `teams` (
  `id` int NOT NULL,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `departmentId` int NOT NULL,
  `shiftId` int NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '0 for inactive, 1 for active',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `teams`
--

INSERT INTO `teams` (`id`, `name`, `departmentId`, `shiftId`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'User', 1, 2, 1, '2024-12-02 11:33:16', '2024-12-02 11:33:16'),
(3, 'Nodejs', 1, 2, 1, '2024-12-04 12:08:20', '2024-12-04 12:08:20');

-- --------------------------------------------------------

--
-- Table structure for table `team_member_daily_logs`
--

CREATE TABLE `team_member_daily_logs` (
  `id` int NOT NULL,
  `empId` int NOT NULL,
  `empName` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `status` tinyint(1) NOT NULL COMMENT '0 for inactive(absent) and 1 for active(present)',
  `productiveTime` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'will update when logout',
  `shiftTime` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `arrivedTime` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `leftAt` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `team_member_daily_logs`
--

INSERT INTO `team_member_daily_logs` (`id`, `empId`, `empName`, `status`, `productiveTime`, `shiftTime`, `arrivedTime`, `leftAt`, `createdAt`) VALUES
(1, 1001, 'Bob', 0, '01:01', '10:00 - 19:00', '16:11', '17:12', '2024-12-04 13:16:37'),
(2, 1002, 'Charlie', 1, '03:39', '08:30 - 17:30', '09:01', '12:40', '2024-12-04 13:16:37'),
(3, 1003, 'David', 0, '00:58', '11:00 - 20:00', '15:53', '16:51', '2024-12-04 13:16:37'),
(4, 1004, 'Eve', 1, '05:02', '07:00 - 16:00', '10:14', '15:16', '2024-12-04 13:16:37'),
(5, 1005, 'Alice', 0, '01:08', '09:00 - 18:00', '16:26', '17:34', '2024-12-04 13:16:37'),
(6, 1006, 'Bob', 1, '00:05', '10:00 - 19:00', '18:09', '18:14', '2024-12-04 13:16:37'),
(7, 1007, 'Charlie', 0, '00:11', '08:30 - 17:30', '16:29', '16:40', '2024-12-04 13:16:37'),
(8, 1008, 'David', 1, '03:34', '11:00 - 20:00', '14:34', '18:08', '2024-12-04 13:16:37'),
(9, 1009, 'Eve', 0, '03:35', '07:00 - 16:00', '10:36', '14:11', '2024-12-04 13:16:37'),
(10, 1010, 'Alice', 1, '06:24', '09:00 - 18:00', '10:41', '17:05', '2024-12-04 13:16:37'),
(11, 1011, 'Bob', 0, '05:43', '10:00 - 19:00', '11:50', '17:33', '2024-12-04 13:16:37'),
(12, 1012, 'Charlie', 1, '00:44', '08:30 - 17:30', '09:43', '10:27', '2024-12-04 13:16:37'),
(13, 1013, 'David', 0, '00:25', '11:00 - 20:00', '15:44', '16:09', '2024-12-04 13:16:37'),
(14, 1014, 'Eve', 1, '00:17', '07:00 - 16:00', '08:20', '08:37', '2024-12-04 13:16:37'),
(15, 1015, 'Alice', 0, '03:31', '09:00 - 18:00', '10:24', '13:55', '2024-12-04 13:16:37'),
(16, 1016, 'Bob', 1, '00:09', '10:00 - 19:00', '14:37', '14:46', '2024-12-04 13:16:37'),
(17, 1017, 'Charlie', 0, '02:39', '08:30 - 17:30', '09:30', '12:09', '2024-12-04 13:16:37'),
(18, 1018, 'David', 1, '03:04', '11:00 - 20:00', '14:44', '17:48', '2024-12-04 13:16:37'),
(19, 1019, 'Eve', 0, '00:48', '07:00 - 16:00', '11:01', '11:49', '2024-12-04 13:16:37'),
(20, 1020, 'Alice', 1, '01:03', '09:00 - 18:00', '13:26', '14:29', '2024-12-04 13:16:37'),
(21, 1021, 'Bob', 0, '02:17', '10:00 - 19:00', '14:14', '16:31', '2024-12-04 13:16:37'),
(22, 1022, 'Charlie', 1, '04:02', '08:30 - 17:30', '12:57', '16:59', '2024-12-04 13:16:37'),
(23, 1023, 'David', 0, '03:35', '11:00 - 20:00', '11:37', '15:12', '2024-12-04 13:16:37'),
(24, 1024, 'Eve', 1, '01:04', '07:00 - 16:00', '11:23', '12:27', '2024-12-04 13:16:37'),
(25, 1025, 'Alice', 0, '01:35', '09:00 - 18:00', '13:58', '15:33', '2024-12-04 13:16:37'),
(26, 1026, 'Bob', 1, '00:11', '10:00 - 19:00', '18:46', '18:57', '2024-12-04 13:16:37'),
(27, 1027, 'Charlie', 0, '00:10', '08:30 - 17:30', '15:08', '15:18', '2024-12-04 13:16:37'),
(28, 1028, 'David', 1, '02:38', '11:00 - 20:00', '16:24', '19:02', '2024-12-04 13:16:37'),
(29, 1029, 'Eve', 0, '03:52', '07:00 - 16:00', '11:27', '15:19', '2024-12-04 13:16:37'),
(30, 1030, 'Alice', 1, '01:22', '09:00 - 18:00', '13:58', '15:20', '2024-12-04 13:16:37');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `fullname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(250) NOT NULL,
  `mobile` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `password` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `departmentId` int NOT NULL,
  `designationId` int NOT NULL,
  `roleId` int NOT NULL,
  `teamId` int DEFAULT NULL,
  `isAdmin` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0 for false, 1 for true',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0 for inactive, 1 for active',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `fullname`, `email`, `mobile`, `country`, `password`, `departmentId`, `designationId`, `roleId`, `teamId`, `isAdmin`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'Harneet', 'harneet@gmail.com', '8454124785', 'India', '$2a$10$G0RKFKeGcdtl1kMZKl5QYOkD.djtzoV74zZb.16al26hWoi4mHYVG', 1, 1, 1, 1, 1, 1, '2024-12-02 07:31:34', '2024-12-04 07:45:35'),
(2, 'Harneet', 'user@gmail.com', '8454124785', 'India', '$2a$10$xFuPVECi7.6hk3VVwJadw.KHDGQEMaE9pbyP9t3RsXEMRxtCzplHy', 1, 1, 1, 1, 0, 1, '2024-12-02 07:45:14', '2024-12-02 07:45:14'),
(3, 'sharan', 'sharan@gmail.com', '8454124785', 'India', '$2a$10$.UmhSI84T.0jehdqVhNGq.2klMU8Gs7Y75Trq9csbiCXwYAjGBRz.', 1, 1, 1, 1, 0, 1, '2024-12-02 11:42:44', '2024-12-02 11:42:44'),
(4, 'Harneet shah', 'harneet5@gmail.com', NULL, NULL, '$2a$10$NpBItf37BTgwpjfXDL.mkOpabqkjnCGGUl0jbb9s9iiI2b382mvr.', 1, 1, 1, 1, 0, 1, '2024-12-04 07:29:15', '2024-12-04 07:42:57'),
(5, 'Harneet shah', 'harneet6@gmail.com', NULL, NULL, '$2a$10$0QjS6fMtNQzp.HqY/LDipu2Ty7kxhJS1RsV927DBO0TEDsU/u/Ug2', 1, 1, 1, 1, 0, 1, '2024-12-04 07:31:00', '2024-12-04 07:31:00'),
(6, 'Harneet shah', 'harneet7@gmail.com', NULL, NULL, '$2a$10$wUoPSGyEvoflIL3.DYFRfuE/M091apCTHWOJCv6PxR3YInfFdJEhK', 1, 1, 1, 1, 0, 1, '2024-12-04 07:31:35', '2024-12-04 07:31:35');

-- --------------------------------------------------------

--
-- Table structure for table `users_settings`
--

CREATE TABLE `users_settings` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `screenshot_time` int NOT NULL,
  `app_history_time` int NOT NULL,
  `browser_history_time` int NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users_settings`
--

INSERT INTO `users_settings` (`id`, `userId`, `screenshot_time`, `app_history_time`, `browser_history_time`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 1, 300, 300, 300, 1, '2024-12-02 06:50:11', '2024-12-02 06:50:11'),
(2, 1, 300, 300, 300, 1, '2024-12-02 07:31:34', '2024-12-02 07:31:34'),
(3, 2, 300, 300, 300, 1, '2024-12-02 07:45:15', '2024-12-02 07:45:15'),
(4, 3, 300, 300, 300, 1, '2024-12-02 11:42:45', '2024-12-02 11:42:45'),
(5, 4, 300, 300, 300, 1, '2024-12-04 07:29:15', '2024-12-04 07:29:15'),
(6, 5, 300, 300, 300, 1, '2024-12-04 07:31:00', '2024-12-04 07:31:00'),
(7, 6, 300, 300, 300, 1, '2024-12-04 07:31:35', '2024-12-04 07:31:35');

-- --------------------------------------------------------

--
-- Table structure for table `work_reports`
--

CREATE TABLE `work_reports` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `description` text,
  `status` tinyint NOT NULL DEFAULT '0' COMMENT '0=>Pending,1 => Approved,2=>Disapproved',
  `remarks` varchar(255) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `work_reports`
--

INSERT INTO `work_reports` (`id`, `user_id`, `description`, `status`, `remarks`, `date`, `createdAt`, `updatedAt`) VALUES
(1, 2, 'Project Name:- Emonitrix-Project1)Create a api for get admin profile info.2)Create a api for update admin information.3)Create a api for adding blocked websites.', 1, 'Please do the work fast.', '2024-12-03 11:01:02', '2024-12-03 06:38:54', '2024-12-03 11:01:02'),
(2, 3, 'Project Name:- testing-Project1)Create a api for get admin profile info.2)Create a api for update admin information.3)Create a api for adding blocked websites.', 0, NULL, NULL, '2024-12-03 06:46:14', '2024-12-03 06:46:14');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `access_tokens`
--
ALTER TABLE `access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`);

--
-- Indexes for table `blockedWebsites`
--
ALTER TABLE `blockedWebsites`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `designations`
--
ALTER TABLE `designations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `email_gateways`
--
ALTER TABLE `email_gateways`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `productive_nonproductive_apps`
--
ALTER TABLE `productive_nonproductive_apps`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reporting_managers`
--
ALTER TABLE `reporting_managers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `report_settings`
--
ALTER TABLE `report_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `shifts`
--
ALTER TABLE `shifts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `teams`
--
ALTER TABLE `teams`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users_settings`
--
ALTER TABLE `users_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `work_reports`
--
ALTER TABLE `work_reports`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `access_tokens`
--
ALTER TABLE `access_tokens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `blockedWebsites`
--
ALTER TABLE `blockedWebsites`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `designations`
--
ALTER TABLE `designations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `email_gateways`
--
ALTER TABLE `email_gateways`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `modules`
--
ALTER TABLE `modules`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `reporting_managers`
--
ALTER TABLE `reporting_managers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `shifts`
--
ALTER TABLE `shifts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `teams`
--
ALTER TABLE `teams`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users_settings`
--
ALTER TABLE `users_settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
