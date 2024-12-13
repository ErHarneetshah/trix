-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 03, 2024 at 02:18 PM
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
(39, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMzMjMzODIwLCJleHAiOjE3MzMzMjAyMjB9._6du5FRWfB9iriwc4UJkRqQ5ZNBLQwAIBN49_qu7ay0', NULL, '2024-12-04 19:20:20', 1, '2024-12-03 13:50:20');

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
(33, 'Test Department 1', 1, '2024-12-03 05:24:37', '2024-12-03 05:24:37'),
(34, 'Test Department 2', 1, '2024-12-03 05:24:47', '2024-12-03 05:24:47'),
(36, 'aa', 1, '2024-12-03 14:12:29', '2024-12-03 14:12:29');

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
(9, 'Testing designation 1', 1, '2024-12-03 05:22:49', '2024-12-03 05:25:11'),
(10, 'Testing designation 2', 1, '2024-12-03 05:23:00', '2024-12-03 05:25:04');

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
(1, 'Role Management', '2024-12-03 13:51:28');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int NOT NULL,
  `roleId` int NOT NULL,
  `modules` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `permissions` json NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(2, 'User', 1, '2024-12-03 07:59:24', '2024-12-03 07:59:24'),
(3, 'Employee', 1, '2024-12-03 07:59:34', '2024-12-03 07:59:34'),
(5, 'ffff', 1, '2024-12-03 09:43:21', '2024-12-03 09:43:21'),
(6, 'ff', 1, '2024-12-03 09:49:30', '2024-12-03 09:49:30'),
(7, 'user1', 1, '2024-12-03 09:53:49', '2024-12-03 09:53:49'),
(8, 'user2', 1, '2024-12-03 09:56:44', '2024-12-03 09:56:44'),
(9, 'Senior Employee', 1, '2024-12-03 09:57:05', '2024-12-03 09:57:05'),
(10, 'dd', 1, '2024-12-03 10:05:42', '2024-12-03 10:05:42'),
(11, 'user2ff', 1, '2024-12-03 10:06:06', '2024-12-03 10:06:06'),
(12, 'qw', 1, '2024-12-03 10:09:53', '2024-12-03 10:09:53'),
(13, 'qwqw', 1, '2024-12-03 10:09:57', '2024-12-03 10:09:57'),
(14, 'dasdasd', 1, '2024-12-03 10:09:59', '2024-12-03 10:09:59'),
(15, 'user2sdsds', 1, '2024-12-03 10:27:25', '2024-12-03 10:27:25'),
(16, 'user2sdsdss', 1, '2024-12-03 10:29:38', '2024-12-03 10:29:38');

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
(10, 'Shift', '11:00', '12:00', '[\"Mon\", \"Tue\"]', 1, 1, '2024-12-03 07:49:46', '2024-12-03 07:49:46'),
(11, 'Ev1 Shift', '10:00:00', '18:00', '[\"Mon\", \"Tue\", \"Wed\", \"Thu\", \"Fri\", \"Sat\"]', 1, 8, '2024-12-03 07:51:31', '2024-12-03 13:47:06'),
(12, 'Shift', '11:00:00', '18:00', '[\"Mon\", \"Tue\"]', 1, 7, '2024-12-03 09:54:53', '2024-12-03 13:46:41'),
(13, 'Ev Shift', '10:00:00', '18:00', '[\"Mon\", \"Tue\", \"Wed\", \"Thu\", \"Fri\"]', 1, 8, '2024-12-03 09:55:30', '2024-12-03 13:46:58'),
(14, 'cascdscsc test', '10:00', '19:00', '[\"Mon\", \"Tue\", \"Wed\", \"Thu\", \"Fri\", \"Sat\", \"Sun\"]', 1, 9, '2024-12-03 09:58:09', '2024-12-03 14:10:04');

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
(1, 'User', 1, 2, 1, '2024-12-02 11:33:16', '2024-12-02 11:33:16');

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
(1, 'Harneet', 'harneet@gmail.com', '8454124785', 'India', '$2a$10$7j0rwjlGjMFT47whoDqm9eS0jlsQsVhKT.9X.Gr5Z7wAbcTLgYSqi', 1, 1, 1, 1, 1, 1, '2024-12-02 07:31:34', '2024-12-02 07:31:34'),
(2, 'Harneet', 'user@gmail.com', '8454124785', 'India', '$2a$10$xFuPVECi7.6hk3VVwJadw.KHDGQEMaE9pbyP9t3RsXEMRxtCzplHy', 1, 1, 1, 1, 0, 1, '2024-12-02 07:45:14', '2024-12-02 07:45:14'),
(3, 'sharan', 'sharan@gmail.com', '8454124785', 'India', '$2a$10$.UmhSI84T.0jehdqVhNGq.2klMU8Gs7Y75Trq9csbiCXwYAjGBRz.', 1, 1, 1, 1, 0, 1, '2024-12-02 11:42:44', '2024-12-02 11:42:44');

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
(4, 3, 300, 300, 300, 1, '2024-12-02 11:42:45', '2024-12-02 11:42:45');

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
-- Indexes for table `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reporting_managers`
--
ALTER TABLE `reporting_managers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
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
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `access_tokens`
--
ALTER TABLE `access_tokens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `designations`
--
ALTER TABLE `designations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `modules`
--
ALTER TABLE `modules`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reporting_managers`
--
ALTER TABLE `reporting_managers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `shifts`
--
ALTER TABLE `shifts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `teams`
--
ALTER TABLE `teams`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users_settings`
--
ALTER TABLE `users_settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
