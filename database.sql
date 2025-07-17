-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 23, 2025 at 05:41 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `diabetech`
--

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--
create database diabetech;
use diabetech;
CREATE TABLE `patients` (
  `id` int(11) NOT NULL,
  `age` int(100) NOT NULL,
  `bmi` varchar(100) NOT NULL,
  `glucose` varchar(100) NOT NULL,
  `systolic` int(100) NOT NULL,
  `diastolic` int(100) NOT NULL,
  `retinopathy_risk` enum('High','Medium','Low') DEFAULT NULL,
  `neuropathy_risk` enum('High','Medium','Low') DEFAULT NULL,
  `cardiovascular_risk` enum('High','Medium','Low') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `patients`
--
ALTER TABLE `patients`	
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;


select * from patients;

select * from insights;

select * from users;


truncate table users;
truncate table patients;
truncate table insights;


ALTER TABLE `patients`
  ADD COLUMN `region` varchar(100) NOT NULL,
  ADD COLUMN `gender` enum('Male', 'Female', 'Other') NOT NULL,
  ADD COLUMN `blood_glucose_level` varchar(100) NOT NULL,
  ADD COLUMN `HbA1c_level` varchar(100) NOT NULL,
  ADD COLUMN `smoking` enum('Yes', 'No') DEFAULT NULL,
  ADD COLUMN `diabetes_duration` int(3) NOT NULL,
  ADD COLUMN `family_diabetes` enum('Yes', 'No') DEFAULT NULL,
  ADD COLUMN `retinopathy_status` enum('Yes', 'No') DEFAULT NULL,
  ADD COLUMN `neuropathy_status` enum('Yes', 'No') DEFAULT NULL,
  ADD COLUMN `cardiovascular_complications` enum('Yes', 'No') DEFAULT NULL;


ALTER TABLE `patients`
  DROP COLUMN GLUCOSE,
  DROP COLUMN SYSTOLIC_BLOOD_PRESSURE,
  DROP COLUMN DIASTOLIC_BLOOD_PRESSURE;
  

ALTER TABLE patients
ADD COLUMN blood_pressure VARCHAR(10);

CREATE TABLE insights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100),
    insight_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE patients
ADD COLUMN cardiovascular_risk VARCHAR(10) DEFAULT 'Low',
ADD COLUMN retinopathy_risk VARCHAR(10) DEFAULT 'Low',
ADD COLUMN neuropathy_risk VARCHAR(10) DEFAULT 'Low';

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255)
);

DROP DATABASE diabetech;
DROP DATABASE diabetech_db;
