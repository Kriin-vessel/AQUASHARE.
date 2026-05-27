-- phpMyAdmin SQL Dump
-- Host: 127.0.0.1
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------
-- Database: `aquashare`
-- --------------------------------------------------------

DROP DATABASE IF EXISTS `aquashare`;
CREATE DATABASE `aquashare` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `aquashare`;

-- DROP TABLE IF EXISTS `message`;
-- DROP TABLE IF EXISTS `rating`;
-- DROP TABLE IF EXISTS `request`;
-- DROP TABLE IF EXISTS `supplier_profile`;
-- DROP TABLE IF EXISTS `resident_profile`;
-- DROP TABLE IF EXISTS `user`;

-- --------------------------------------------------------
-- Table: `user`
-- Shared table for all user types (resident, supplier, admin)
-- --------------------------------------------------------

CREATE TABLE `user` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('resident','supplier','admin') NOT NULL DEFAULT 'resident',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_banned` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_phone` (`phone`),
  UNIQUE KEY `uk_user_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table: `resident_profile`
-- Extra details for users with role = 'resident'
-- --------------------------------------------------------

CREATE TABLE `resident_profile` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(10) UNSIGNED NOT NULL,
  `address` varchar(255) NOT NULL,
  `landmark` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_resident_user` (`user_id`),
  CONSTRAINT `fk_resident_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table: `supplier_profile`
-- Extra details for users with role = 'supplier'
-- --------------------------------------------------------

CREATE TABLE `supplier_profile` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(10) UNSIGNED NOT NULL,
  `address` varchar(255) NOT NULL,
  `landmark` varchar(255) DEFAULT NULL,
  `price_per_unit` decimal(10,2) NOT NULL COMMENT 'Price per container/jerry can',
  `unit_description` varchar(100) NOT NULL DEFAULT '25L jerry can' COMMENT 'e.g. 25L jerry can, bucket',
  `delivery_available` tinyint(1) NOT NULL DEFAULT 1,
  `max_deliveries_per_day` tinyint(3) UNSIGNED DEFAULT NULL,
  `whatsapp` varchar(20) DEFAULT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Currently has water to supply',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_supplier_user` (`user_id`),
  CONSTRAINT `fk_supplier_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table: `request`
-- Water requests sent by residents to suppliers
-- --------------------------------------------------------

CREATE TABLE `request` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `resident_id` int(10) UNSIGNED NOT NULL,
  `supplier_id` int(10) UNSIGNED NOT NULL,
  `status` enum('pending','accepted','rejected','completed','cancelled') NOT NULL DEFAULT 'pending',
  `note` text DEFAULT NULL COMMENT 'Optional initial message with the request',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_request_resident` (`resident_id`),
  KEY `idx_request_supplier` (`supplier_id`),
  CONSTRAINT `fk_request_resident` FOREIGN KEY (`resident_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_request_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table: `rating`
-- Resident ratings for suppliers after completed requests
-- --------------------------------------------------------

CREATE TABLE `rating` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `resident_id` int(10) UNSIGNED NOT NULL,
  `supplier_id` int(10) UNSIGNED NOT NULL,
  `score` tinyint(1) UNSIGNED NOT NULL COMMENT '1 to 5',
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_rating_resident_supplier` (`resident_id`, `supplier_id`) COMMENT 'One rating per resident per supplier',
  KEY `idx_rating_supplier` (`supplier_id`),
  CONSTRAINT `fk_rating_resident` FOREIGN KEY (`resident_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rating_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table: `message`
-- In-app chat between resident and supplier, scoped to a request
-- --------------------------------------------------------

CREATE TABLE `message` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `request_id` int(10) UNSIGNED NOT NULL,
  `sender_id` int(10) UNSIGNED NOT NULL,
  `type` enum('text','image','location') NOT NULL DEFAULT 'text',
  `body` text NOT NULL COMMENT 'Text content, image path, or JSON {lat, lng} for location',
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_message_request` (`request_id`),
  KEY `idx_message_sender` (`sender_id`),
  CONSTRAINT `fk_message_request` FOREIGN KEY (`request_id`) REFERENCES `request` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_message_sender` FOREIGN KEY (`sender_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
