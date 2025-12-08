-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Dec 08, 2025 at 01:37 PM
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
-- Database: `SutarciuKontrole`
--

-- --------------------------------------------------------

--
-- Table structure for table `Comment`
--

CREATE TABLE `Comment` (
  `Id` int(11) NOT NULL,
  `CommentText` varchar(500) NOT NULL,
  `IrasasId` int(11) NOT NULL,
  `NaudotojasId` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Irasas`
--

CREATE TABLE `Irasas` (
  `Id` int(11) NOT NULL,
  `Id_dokumento` varchar(20) NOT NULL,
  `Pavadinimas` varchar(100) NOT NULL,
  `TagID` int(11) NOT NULL,
  `Isigaliojimo_data` datetime NOT NULL,
  `Pabaigos_data` datetime NOT NULL,
  `Dienos_pries` int(11) NOT NULL DEFAULT 0,
  `Dienu_daznumas` int(11) NOT NULL DEFAULT 0,
  `Archyvuotas` tinyint(1) NOT NULL DEFAULT 0,
  `Kita_data` datetime DEFAULT NULL,
  `Pastas_kreiptis` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Irasas`
--

INSERT INTO `Irasas` (`Id`, `Id_dokumento`, `Pavadinimas`, `TagID`, `Isigaliojimo_data`, `Pabaigos_data`, `Dienos_pries`, `Dienu_daznumas`, `Archyvuotas`, `Kita_data`, `Pastas_kreiptis`) VALUES
(1, 'DOC-0000000000000001', 'Pirkimo sutartis', 1, '2025-01-01 00:00:00', '2026-01-01 00:00:00', 30, 365, 0, NULL, 'contracts@example.com'),
(2, 'DOC-0000000000000002', 'Darbo sutartis buh', 3, '2024-06-01 00:00:00', '2029-06-01 00:00:00', 14, 365, 1, NULL, 'hr@example.com'),
(3, 'DOC-0000000000000003', 'Nuomos sutartis', 2, '2023-09-15 00:00:00', '2024-09-15 00:00:00', 7, 30, 0, '2024-09-15 00:00:00', 'legal@example.com');

-- --------------------------------------------------------

--
-- Table structure for table `IrasasNaudotojas`
--

CREATE TABLE `IrasasNaudotojas` (
  `IrasasId` int(11) NOT NULL,
  `NaudotojasId` varchar(36) NOT NULL,
  `Prekes_Adminas` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `IrasasNaudotojas`
--

INSERT INTO `IrasasNaudotojas` (`IrasasId`, `NaudotojasId`, `Prekes_Adminas`) VALUES
(1, '30b4bb0b-1042-4615-bd46-0d0d079f67bc', 0),
(2, '3395c229-7f20-4080-8f8a-e28892dc9b0a', 0);

-- --------------------------------------------------------

--
-- Table structure for table `Naudotojas`
--

CREATE TABLE `Naudotojas` (
  `Id` varchar(36) NOT NULL,
  `Vardas` varchar(30) NOT NULL,
  `Pavarde` varchar(30) NOT NULL,
  `Gimimo_data` date NOT NULL,
  `El_pastas` varchar(100) NOT NULL,
  `Adminas` tinyint(1) NOT NULL DEFAULT 0,
  `PasswordHash` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Naudotojas`
--

INSERT INTO `Naudotojas` (`Id`, `Vardas`, `Pavarde`, `Gimimo_data`, `El_pastas`, `Adminas`, `PasswordHash`) VALUES
('1', 'jonas', 'jonaitis', '1996-12-03', 'jonas@jonaitis.com', 0, '$2a$11$M/tprNWKZMd.GtSWL3zYjOumrxwByTEz83gPCoBV7oWPwNgEzJpKO'),
('30b4bb0b-1042-4615-bd46-0d0d079f67bc', 'buh', 'buh', '2025-11-17', 'buh@buh.com', 1, '$2a$11$sZImYhtCWF9BHxudFdm3bOMcNJvOIrwd41qjgMfJzNU9axdsp7Aoy'),
('3395c229-7f20-4080-8f8a-e28892dc9b0a', 'b', 'b', '2025-11-17', 'dsajkhqwieh@gmail.com', 0, '$2a$11$MAB7okn7JLxd0Wy3m5WzJ.pt2zzzG82KkQSsGPiNzZN0ENnrc0AQS');

-- --------------------------------------------------------

--
-- Table structure for table `RefreshToken`
--

CREATE TABLE `RefreshToken` (
  `Id` int(36) NOT NULL,
  `Token` char(200) NOT NULL,
  `Expires` datetime(6) NOT NULL,
  `Revoked` datetime(6) DEFAULT NULL,
  `NaudotojasId` char(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `RefreshToken`
--

INSERT INTO `RefreshToken` (`Id`, `Token`, `Expires`, `Revoked`, `NaudotojasId`) VALUES
(1, '++7iCqTw/7rkUDQuJpFtm7qlwyaG/FdtJ+xxdpFzLCcvOF9g/3Bor4X14z/S4BSgmsiFVQcAY8ZW9ewZOh7i2w==', '2025-12-15 12:20:16.328061', NULL, '30b4bb0b-1042-4615-bd46-0d0d079f67bc'),
(2, 'qqWUczF00SSmoZ9VsBut9CMAfsydXowAfQHGK/7sOH9n91wM4R2XW7jqR44xhGCWeZ0Z8hmA8i/zsGTkEr4vvw==', '2025-12-15 12:22:16.305421', NULL, '30b4bb0b-1042-4615-bd46-0d0d079f67bc'),
(3, 'uM+0/hs0Mc54WX/qmS9cnXitGrZw5hZ+gzRZWvIgtaoJF4BuiichJkYGD/E/PeSUKaAxNRiNyEC+Cjc4hU+8hw==', '2025-12-15 12:30:37.648432', NULL, '30b4bb0b-1042-4615-bd46-0d0d079f67bc'),
(4, 'kBpg8GnP51nN7oITrMrqsg5aRatP9IlSqcR0OXLpEgUjsZRXdZUIhxsfXsX79tO4qtm0vlqZjTR0E6RRXsXS2A==', '2025-12-15 12:34:57.373441', NULL, '30b4bb0b-1042-4615-bd46-0d0d079f67bc');

-- --------------------------------------------------------

--
-- Table structure for table `Tag`
--

CREATE TABLE `Tag` (
  `Id` int(11) NOT NULL,
  `Name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Tag`
--

INSERT INTO `Tag` (`Id`, `Name`) VALUES
(1, 'Finance'),
(3, 'HR'),
(4, 'JO'),
(2, 'Legal');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Comment`
--
ALTER TABLE `Comment`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `FK_Comment_Irasas_idx` (`IrasasId`),
  ADD KEY `FK_Comment_Naudotojas_idx` (`NaudotojasId`);

--
-- Indexes for table `Irasas`
--
ALTER TABLE `Irasas`
  ADD PRIMARY KEY (`Id`),
  ADD KEY `FK_Irasas_TagID_idx` (`TagID`);

--
-- Indexes for table `IrasasNaudotojas`
--
ALTER TABLE `IrasasNaudotojas`
  ADD PRIMARY KEY (`IrasasId`,`NaudotojasId`),
  ADD KEY `FK_IN_Irasas_idx` (`IrasasId`),
  ADD KEY `FK_IN_Naudotojas_idx` (`NaudotojasId`);

--
-- Indexes for table `Naudotojas`
--
ALTER TABLE `Naudotojas`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `UQ_Naudotojas_El_pastas` (`El_pastas`);

--
-- Indexes for table `RefreshToken`
--
ALTER TABLE `RefreshToken`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `IX_RefreshToken_Token` (`Token`),
  ADD KEY `IX_RefreshToken_NaudotojasId` (`NaudotojasId`);

--
-- Indexes for table `Tag`
--
ALTER TABLE `Tag`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `UQ_Tag_Name` (`Name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Comment`
--
ALTER TABLE `Comment`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `Irasas`
--
ALTER TABLE `Irasas`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `RefreshToken`
--
ALTER TABLE `RefreshToken`
  MODIFY `Id` int(36) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `Tag`
--
ALTER TABLE `Tag`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Comment`
--
ALTER TABLE `Comment`
  ADD CONSTRAINT `FK_Comment_Irasas` FOREIGN KEY (`IrasasId`) REFERENCES `Irasas` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_Comment_Naudotojas` FOREIGN KEY (`NaudotojasId`) REFERENCES `Naudotojas` (`Id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `Irasas`
--
ALTER TABLE `Irasas`
  ADD CONSTRAINT `FK_Irasas_Tag` FOREIGN KEY (`TagID`) REFERENCES `Tag` (`Id`) ON UPDATE CASCADE;

--
-- Constraints for table `IrasasNaudotojas`
--
ALTER TABLE `IrasasNaudotojas`
  ADD CONSTRAINT `FK_IN_Irasas` FOREIGN KEY (`IrasasId`) REFERENCES `Irasas` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_IN_Naudotojas` FOREIGN KEY (`NaudotojasId`) REFERENCES `Naudotojas` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `RefreshToken`
--
ALTER TABLE `RefreshToken`
  ADD CONSTRAINT `FK_RefreshToken_Naudotojas_NaudotojasId` FOREIGN KEY (`NaudotojasId`) REFERENCES `Naudotojas` (`Id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
