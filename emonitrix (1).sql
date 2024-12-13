-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 29, 2024 at 01:16 PM
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
(1, 1, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTczMjcwNDAxMSwiZXhwIjoxNzMyNzkwNDExfQ.F9px3pORlrnpmDb5TIjzW-0rIE5Ut1tJuRArx9djTaE', NULL, '2024-11-28 16:10:11', 1, '2024-11-27 10:40:11'),
(2, 2, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTczMjc3OTY1MSwiZXhwIjoxNzMyODY2MDUxfQ.LML8is9q37MzTcQbHfbM_uaNV21AYVFtTp13v0hwD58', NULL, '2024-11-29 13:10:51', 1, '2024-11-28 07:40:51'),
(3, 1, 0, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTczMjc3OTc1MCwiZXhwIjoxNzMyODY2MTUwfQ.h1InpeZpz8tdf4vJ5PZ6GoJLKcyl8raHCuIh2hrmJos', NULL, '2024-11-29 13:12:30', 1, '2024-11-28 07:42:30'),
(4, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMyODYyMjkzLCJleHAiOjE3MzI5NDg2OTN9.PnxW3MXXzVMD0_EKibWFW6vZmNQXJ9BodvBhqLKkTqc', NULL, '2024-11-30 12:08:13', 1, '2024-11-29 06:38:13'),
(5, 1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaXNBZG1pbiI6dHJ1ZSwiaWF0IjoxNzMyODY3NDg3LCJleHAiOjE3MzI5NTM4ODd9.ASxRZnyFdc1tL_ZYDBIl0WKt6xEQaDad9vDS_Tm_-Yg', NULL, '2024-11-30 13:34:47', 1, '2024-11-29 08:04:48');

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
(2, 'Nodejs', 1, '2024-11-28 08:12:20', '2024-11-28 08:17:12');

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
(2, 'employee', 1, '2024-11-28 09:36:28', '2024-11-28 09:36:28');

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

-- --------------------------------------------------------

--
-- Table structure for table `shifts`
--

CREATE TABLE `shifts` (
  `id` int NOT NULL,
  `name` varchar(150) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `days` json NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0 for inactive, 1 for active',
  `total_hours` float NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `firstname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `lastname` varchar(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(250) NOT NULL,
  `mobile` varchar(10) NOT NULL,
  `country` varchar(100) NOT NULL,
  `password` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `departmentId` int NOT NULL,
  `designationId` int NOT NULL,
  `roleId` int NOT NULL,
  `teamId` int DEFAULT NULL,
  `isAdmin` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0 for false, 1 for true',
  `workstationId` int DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0 for inactive, 1 for active',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `firstname`, `lastname`, `username`, `email`, `mobile`, `country`, `password`, `departmentId`, `designationId`, `roleId`, `teamId`, `isAdmin`, `workstationId`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'Harneet', 'shah', 'harneetshah136', 'harneet2@gmail.com', '8454124785', 'India', '$2a$10$WuFA5WgsnoU2PJUTW9JvZOFRlQTdDVzKhHfabmR2h8tjP6kWVJE3u', 1, 1, 1, 1, 1, NULL, 1, '2024-11-27 10:40:11', '2024-11-27 10:40:11'),
(2, 'Harneet', 'shah', 'harneetshah146', 'harneet3@gmail.com', '8454124785', 'India', '$2a$10$WIjL/fPWzypYMwsNBbNIreY8tW.mG5x/GxqoNxdEKs/0J5AOURqA6', 1, 1, 1, 1, 0, NULL, 1, '2024-11-28 07:40:51', '2024-11-28 07:40:51');

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
(1, 1, 300, 300, 300, 1, '2024-11-27 10:40:11', '2024-11-27 10:40:11'),
(2, 2, 300, 300, 300, 1, '2024-11-28 07:40:51', '2024-11-28 07:40:51');

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
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `workstationId` (`workstationId`);

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `designations`
--
ALTER TABLE `designations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `reporting_managers`
--
ALTER TABLE `reporting_managers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shifts`
--
ALTER TABLE `shifts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `teams`
--
ALTER TABLE `teams`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users_settings`
--
ALTER TABLE `users_settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
