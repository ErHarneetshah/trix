-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 17, 2025 at 08:06 AM
-- Server version: 8.0.41-0ubuntu0.20.04.1
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
  `company_id` int DEFAULT NULL,
  `userId` int NOT NULL,
  `isUserAdmin` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `expiry_time` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `app_histories`
--

CREATE TABLE `app_histories` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `company_id` int NOT NULL,
  `date` date NOT NULL,
  `appName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_productive` tinyint(1) DEFAULT '0',
  `startTime` datetime NOT NULL,
  `endTime` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blocked_websites`
--

CREATE TABLE `blocked_websites` (
  `id` int NOT NULL,
  `companyId` int NOT NULL,
  `departmentId` int NOT NULL,
  `website_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `website` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `logo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '1 => Blocked Websites,0=>Unblock Websites',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bucket_credentials`
--

CREATE TABLE `bucket_credentials` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `host` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `region` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `access_key` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `secret_key` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `bucket_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '1 => Activated, 0=>Deactivated',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bucket_image_uploads`
--

CREATE TABLE `bucket_image_uploads` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `company_id` int NOT NULL,
  `image_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `image_upload_path` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `bucket_owner` tinyint NOT NULL DEFAULT '1' COMMENT '1 => Emonitrix, 2 => User''s Company',
  `date` date NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `companyEmpPrefix` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `employeeCount` int DEFAULT '0',
  `currentPlanId` int NOT NULL DEFAULT '0',
  `planEmployeeCount` int NOT NULL DEFAULT '10',
  `planStartDate` date DEFAULT NULL,
  `planEndDate` date DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '0 for Inactive, 1 for active',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `bucketStorePath` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `parentDeptId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reportingManagerId` int DEFAULT NULL,
  `isRootId` tinyint(1) DEFAULT '0' COMMENT '0 for not root, 1 for root',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `designations`
--

CREATE TABLE `designations` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `devices`
--

CREATE TABLE `devices` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `companyId` int NOT NULL,
  `departmentId` int NOT NULL,
  `device_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `device_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `memory` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `email_gateways`
--

CREATE TABLE `email_gateways` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `protocol` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Protocol type (e.g., SMTP, HTTP)',
  `host` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Host address of the email gateway',
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Username (email address) for authentication',
  `fromUsername` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Password for authentication',
  `port` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Port number for connection',
  `encryption` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Encryption type (e.g., SSL, TLS)',
  `is_active` tinyint NOT NULL DEFAULT '1' COMMENT '1 => Active, 0 => Not Active',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `errorLogs`
--

CREATE TABLE `errorLogs` (
  `id` int NOT NULL,
  `error_file` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `error_data` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exportHistories`
--

CREATE TABLE `exportHistories` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `reportName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `filePath` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `reportExtension` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `periodFrom` datetime DEFAULT NULL,
  `periodTo` datetime DEFAULT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `exportReports`
--

CREATE TABLE `exportReports` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `image_uploads`
--

CREATE TABLE `image_uploads` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `company_id` int NOT NULL,
  `date` date NOT NULL,
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `languages`
--

CREATE TABLE `languages` (
  `id` int NOT NULL,
  `language` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `languages`
--

INSERT INTO `languages` (`id`, `language`, `image`, `createdAt`, `updatedAt`) VALUES
(1, 'English', 'https://flagcdn.com/w320/gb.png', '2025-01-02 19:41:36', '2025-01-02 19:41:36'),
(2, 'Spanish', 'https://flagcdn.com/w320/es.png', '2025-01-02 19:41:36', '2025-01-02 19:41:36'),
(3, 'Hindi', 'https://flagcdn.com/w320/in.png', '2025-01-02 19:41:36', '2025-01-02 19:41:36'),
(4, 'French', 'https://flagcdn.com/w320/fr.png', '2025-01-02 19:41:36', '2025-01-02 19:41:36'),
(5, 'Punjabi', 'https://flagcdn.com/w320/in.png', '2025-01-02 19:41:36', '2025-01-02 19:41:36');

-- --------------------------------------------------------

--
-- Table structure for table `language_settings`
--

CREATE TABLE `language_settings` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `company_id` int NOT NULL,
  `language_id` int NOT NULL DEFAULT '1' COMMENT '1=>english_id',
  `theme_id` tinyint NOT NULL DEFAULT '1' COMMENT '1=>LTR,2=>RTL',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `modules`
--

CREATE TABLE `modules` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `modules`
--

INSERT INTO `modules` (`id`, `name`, `createdAt`, `updatedAt`) VALUES
(1, 'Role', '2025-01-02 19:41:36', '2025-01-02 19:41:36'),
(2, 'Reporting Manager', '2025-01-02 19:41:36', '2025-01-02 19:41:36'),
(3, 'Team', '2025-01-02 19:41:36', '2025-01-02 19:41:36'),
(4, 'Shifts', '2025-01-02 19:41:36', '2025-01-02 19:41:36'),
(5, 'Team Members', '2025-01-02 19:41:36', '2025-01-02 19:41:36'),
(6, 'Department', '2025-01-02 19:41:36', '2025-01-02 19:41:36'),
(7, 'Designation', '2025-01-02 19:41:36', '2025-01-02 19:41:36'),
(8, 'Role Permissions', '2025-01-02 19:41:36', '2025-01-02 19:41:36'),
(9, 'Blocked Website', '2025-01-02 19:41:36', '2025-01-02 19:41:36'),
(10, 'Productive Application', '2025-01-02 19:41:36', '2025-01-02 19:41:36'),
(11, 'Report Settings', '2025-01-02 19:41:36', '2025-01-02 19:41:36'),
(12, 'Authentication', '2025-01-02 19:41:36', '2025-01-02 19:41:36'),
(13, 'Export Report', '2025-01-02 19:41:36', '2025-01-02 19:41:36'),
(14, 'Team Structure', '2025-01-02 19:41:36', '2025-01-02 19:41:36'),
(15, 'AI Reports', '2025-01-02 19:41:36', '2025-01-02 19:41:36'),
(16, 'Compare Reports', '2025-01-02 19:41:36', '2025-01-02 19:41:36'),
(17, 'Work Reports', '2025-01-02 19:41:36', '2025-01-02 19:41:36'),
(18, 'Email Gateway', '2025-01-02 19:41:36', '2025-01-02 19:41:36'),
(19, 'Language', '2025-01-02 19:41:36', '2025-01-02 19:41:36'),
(20, 'Advance Settings', '2025-01-02 19:41:36', '2025-01-02 19:41:36'),
(22, 'Productive Website', '2025-01-02 19:41:36', '2025-01-02 19:41:36'),
(23, 'General Settings', '2025-01-02 19:41:36', '2025-01-02 19:41:36'),
(24, 'Team Member Log', '2025-01-02 19:41:36', '2025-01-02 19:41:36');

-- --------------------------------------------------------

--
-- Table structure for table `notification_logs`
--

CREATE TABLE `notification_logs` (
  `id` int NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `message` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `userId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `company_id` tinyint(1) DEFAULT '0',
  `date` date NOT NULL,
  `createdAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `payment_logs`
--

CREATE TABLE `payment_logs` (
  `id` int NOT NULL,
  `company_id` bigint NOT NULL,
  `companyName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `companyEmail` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `planId` int NOT NULL,
  `planName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `amountPaid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `allowedEmployeeCount` int NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `status` tinyint(1) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `productive_apps`
--

CREATE TABLE `productive_apps` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `department_id` int NOT NULL,
  `app_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `app_logo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `productive_websites`
--

CREATE TABLE `productive_websites` (
  `id` int NOT NULL,
  `company_id` int NOT NULL DEFAULT '101',
  `department_id` int NOT NULL,
  `website_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Facebook',
  `website` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `logo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `report_settings`
--

CREATE TABLE `report_settings` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '1=>Monthly,2=>Weekly,3=>Daily',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `roleId` int NOT NULL,
  `modules` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `permissions` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `shifts`
--

CREATE TABLE `shifts` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `start_time` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `end_time` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `total_hours` float DEFAULT '0',
  `days` json NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `teams`
--

CREATE TABLE `teams` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `departmentId` int NOT NULL,
  `shiftId` int NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `timelogs`
--

CREATE TABLE `timelogs` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `shift_id` int NOT NULL,
  `company_id` int NOT NULL,
  `logged_in_time` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `active_time` int DEFAULT NULL,
  `late_coming_duration` int DEFAULT NULL,
  `logged_out_time` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `early_going` tinyint(1) DEFAULT '0',
  `late_coming` tinyint(1) DEFAULT '0',
  `spare_time` int DEFAULT NULL,
  `idle_time` int DEFAULT '0',
  `date` date NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `company_id` bigint DEFAULT NULL,
  `socket_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fullname` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `mobile` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `country` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `departmentId` int NOT NULL,
  `designationId` int NOT NULL,
  `roleId` int NOT NULL,
  `teamId` int DEFAULT NULL,
  `isAdmin` tinyint(1) NOT NULL DEFAULT '0',
  `currentStatus` tinyint(1) DEFAULT '0' COMMENT 'Daily Log Active/InActive Status (0 for absent, 1 for present)',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `screen_capture_time` int DEFAULT '60',
  `broswer_capture_time` int DEFAULT '60',
  `app_capture_time` int DEFAULT '60',
  `screen_capture` tinyint(1) DEFAULT '1',
  `broswer_capture` tinyint(1) DEFAULT '1',
  `app_capture` tinyint(1) DEFAULT '1',
  `next_reports_schedule_date` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `otp` int DEFAULT NULL,
  `otp_expire_time` datetime DEFAULT NULL,
  `empId` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `users_settings`
--

CREATE TABLE `users_settings` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `userId` int NOT NULL,
  `screenshot_time` int NOT NULL,
  `app_history_time` int NOT NULL,
  `browser_history_time` int NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_histories`
--

CREATE TABLE `user_histories` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `company_id` int NOT NULL,
  `date` date NOT NULL,
  `website_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `url` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `title` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `visitTime` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------

--
-- Table structure for table `work_reports`
--

CREATE TABLE `work_reports` (
  `id` int NOT NULL,
  `company_id` int NOT NULL,
  `user_id` int NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `status` tinyint NOT NULL DEFAULT '0' COMMENT '0=>Pending,1 => Approved,2=>Disapproved',
  `remarks` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


--
-- Indexes for dumped tables
--

--
-- Indexes for table `access_tokens`
--
ALTER TABLE `access_tokens`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `app_histories`
--
ALTER TABLE `app_histories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `blocked_websites`
--
ALTER TABLE `blocked_websites`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bucket_credentials`
--
ALTER TABLE `bucket_credentials`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `access_key` (`access_key`),
  ADD UNIQUE KEY `secret_key` (`secret_key`),
  ADD UNIQUE KEY `bucketName` (`bucket_name`),
  ADD UNIQUE KEY `companyId` (`company_id`);

--
-- Indexes for table `bucket_image_uploads`
--
ALTER TABLE `bucket_image_uploads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

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
-- Indexes for table `devices`
--
ALTER TABLE `devices`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `email_gateways`
--
ALTER TABLE `email_gateways`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `errorLogs`
--
ALTER TABLE `errorLogs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `exportHistories`
--
ALTER TABLE `exportHistories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `exportReports`
--
ALTER TABLE `exportReports`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `image_uploads`
--
ALTER TABLE `image_uploads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `languages`
--
ALTER TABLE `languages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `language_settings`
--
ALTER TABLE `language_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notification_logs`
--
ALTER TABLE `notification_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payment_logs`
--
ALTER TABLE `payment_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `productive_apps`
--
ALTER TABLE `productive_apps`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `productive_websites`
--
ALTER TABLE `productive_websites`
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
-- Indexes for table `timelogs`
--
ALTER TABLE `timelogs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `users_settings`
--
ALTER TABLE `users_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_histories`
--
ALTER TABLE `user_histories`
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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=392;

--
-- AUTO_INCREMENT for table `app_histories`
--
ALTER TABLE `app_histories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=644;

--
-- AUTO_INCREMENT for table `blocked_websites`
--
ALTER TABLE `blocked_websites`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `bucket_credentials`
--
ALTER TABLE `bucket_credentials`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `bucket_image_uploads`
--
ALTER TABLE `bucket_image_uploads`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=422;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `designations`
--
ALTER TABLE `designations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `devices`
--
ALTER TABLE `devices`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `email_gateways`
--
ALTER TABLE `email_gateways`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `errorLogs`
--
ALTER TABLE `errorLogs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `exportHistories`
--
ALTER TABLE `exportHistories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `exportReports`
--
ALTER TABLE `exportReports`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `image_uploads`
--
ALTER TABLE `image_uploads`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `languages`
--
ALTER TABLE `languages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `language_settings`
--
ALTER TABLE `language_settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `modules`
--
ALTER TABLE `modules`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `notification_logs`
--
ALTER TABLE `notification_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=204;

--
-- AUTO_INCREMENT for table `payment_logs`
--
ALTER TABLE `payment_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `productive_apps`
--
ALTER TABLE `productive_apps`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `productive_websites`
--
ALTER TABLE `productive_websites`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `report_settings`
--
ALTER TABLE `report_settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=892;

--
-- AUTO_INCREMENT for table `shifts`
--
ALTER TABLE `shifts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `teams`
--
ALTER TABLE `teams`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `timelogs`
--
ALTER TABLE `timelogs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

--
-- AUTO_INCREMENT for table `users_settings`
--
ALTER TABLE `users_settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_histories`
--
ALTER TABLE `user_histories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=300;

--
-- AUTO_INCREMENT for table `work_reports`
--
ALTER TABLE `work_reports`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
