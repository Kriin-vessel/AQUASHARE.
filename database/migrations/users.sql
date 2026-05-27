-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 24, 2026 at 08:13 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `aquashare`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `role` varchar(20) NOT NULL DEFAULT 'resident'
) ;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `phone`, `email`, `password_hash`, `address`, `is_active`, `created_at`, `updated_at`, `role`) VALUES
(1, 'etta kirien', '675204747', 'ettajunior@gmail.com', '$2y$10$6ccKuHgzlyaZtNuoOYvCq.H5jk36NYWfi4Y4LtlkMsNPokfl7wnPG', 'malingo', 1, '2026-05-23 22:52:41', '2026-05-23 22:52:41', 'resident'),
(2, 'blaise', '675204745', 'blaise@gmail.com', '$2y$10$G/vdKzBkkfRwQQaIOZTfgeAAJcs9IOCTKMy53yi7dshhrU0nPq/s.', 'malingo', 1, '2026-05-23 22:57:00', '2026-05-23 22:57:00', 'resident'),
(3, 'ombiono', '658280804', 'ombionomuriel@gmail.com', '$2y$10$AosZ9DXcEdFNEZBpPibKiO.39yDugp1o.w1j57CIdHw2/xKlR8WVm', 'malingo', 1, '2026-05-23 23:34:08', '2026-05-24 05:08:23', 'resident'),
(4, 'brady', '658280805', 'john@gmail.com', '$2y$10$h4ksOjHrsNu4yjkjWYeM.eavvcCmkKfVvlfVovJGZi1DRWnVnPP9y', 'malingo', 1, '2026-05-23 23:37:12', '2026-05-23 23:37:12', 'resident'),
(5, 'John Doe', '1234567890', 'john@example.com', '$2y$10$bhOL6TTkpKUOo4mEYXeq.eu3yL/tiCfQzYsnCWF8yXeEswxXP4bTS', '123 Main Street', 1, '2026-05-24 00:02:58', '2026-05-24 05:55:43', 'resident'),
(6, 'mimi', '675004125', 'mimi@gmail.com', '$2y$10$vknmE1e7/BRjCBOO7I5mhe1V3w3XcpcRfsdzaY4CCuwr5w3HbV29u', 'buea', 1, '2026-05-24 05:13:57', '2026-05-24 05:26:27', 'resident'),
(7, 'Test User', '9999999999', 'test@example.com', '$2y$10$0ynnaPzfPNelj0szeSb.EepmpTOquh59ZdIxpBTebxBHoWdNuDw2i', '1 Test Street', 1, '2026-05-24 05:59:05', '2026-05-24 05:59:05', 'resident');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
