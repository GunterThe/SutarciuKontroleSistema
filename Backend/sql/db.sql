SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `Comment`;
DROP TABLE IF EXISTS `IrasasNaudotojas`;
DROP TABLE IF EXISTS `Irasas`;
DROP TABLE IF EXISTS `Naudotojas`;
DROP TABLE IF EXISTS `Tag`;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `Tag` (
  `Id` INT NOT NULL AUTO_INCREMENT,
  `Name` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UQ_Tag_Name` (`Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Naudotojas` (
  `Id` VARCHAR(36) NOT NULL,
  `Vardas` VARCHAR(30) NOT NULL,
  `Pavarde` VARCHAR(30) NOT NULL,
  `Gimimo_data` DATE NOT NULL,
  `El_pastas` VARCHAR(100) NOT NULL,
  `Adminas` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UQ_Naudotojas_El_pastas` (`El_pastas`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Irasas` (
  `Id` INT NOT NULL AUTO_INCREMENT,
  `Id_dokumento` VARCHAR(20) NOT NULL,
  `Pavadinimas` VARCHAR(100) NOT NULL,
  `TagID` INT NOT NULL,
  `Isigaliojimo_data` DATETIME NOT NULL,
  `Pabaigos_data` DATETIME NOT NULL,
  `Dienos_pries` INT NOT NULL DEFAULT 0,
  `Dienu_daznumas` INT NOT NULL DEFAULT 0,
  `Archyvuotas` TINYINT(1) NOT NULL DEFAULT 0,
  `Kita_data` DATETIME NULL,
  `Pastas_kreiptis` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_Irasas_TagID_idx` (`TagID`),
  CONSTRAINT `FK_Irasas_Tag` FOREIGN KEY (`TagID`) REFERENCES `Tag` (`Id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `IrasasNaudotojas` (
  `IrasasId` INT NOT NULL,
  `NaudotojasId` VARCHAR(36) NOT NULL,
  `Prekes_Adminas` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`IrasasId`,`NaudotojasId`),
  KEY `FK_IN_Irasas_idx` (`IrasasId`),
  KEY `FK_IN_Naudotojas_idx` (`NaudotojasId`),
  CONSTRAINT `FK_IN_Irasas` FOREIGN KEY (`IrasasId`) REFERENCES `Irasas` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_IN_Naudotojas` FOREIGN KEY (`NaudotojasId`) REFERENCES `Naudotojas` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Comment` (
  `Id` INT NOT NULL AUTO_INCREMENT,
  `CommentText` VARCHAR(500) NOT NULL,
  `IrasasId` INT NOT NULL,
  `NaudotojasId` VARCHAR(36) NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_Comment_Irasas_idx` (`IrasasId`),
  KEY `FK_Comment_Naudotojas_idx` (`NaudotojasId`),
  CONSTRAINT `FK_Comment_Irasas` FOREIGN KEY (`IrasasId`) REFERENCES `Irasas` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_Comment_Naudotojas` FOREIGN KEY (`NaudotojasId`) REFERENCES `Naudotojas` (`Id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

START TRANSACTION;

INSERT INTO `Tag` (`Name`) VALUES
('Finance'),
('Legal'),
('HR');

INSERT INTO `Naudotojas` (`Id`,`Vardas`,`Pavarde`,`Gimimo_data`,`El_pastas`,`Adminas`) VALUES
('c56a4180-65aa-42ec-a945-5fd21dec0538','Jonas','Jonaitis','1985-03-15','jonas.jonaitis@example.com',1),
('9a1b7f10-2b3c-4c3b-9e8a-123456789abc','Ona','Onute','1990-07-20','ona.onute@example.com',0),
('d3f8a9e4-11b2-4e2a-9f1b-abcdef123456','Petras','Petraitis','1978-11-05','petras.petraitis@example.com',0);

INSERT INTO `Irasas` (`Id_dokumento`,`Pavadinimas`,`TagID`,`Isigaliojimo_data`,`Pabaigos_data`,`Dienos_pries`,`Dienu_daznumas`,`Archyvuotas`,`Kita_data`,`Pastas_kreiptis`) VALUES
('DOC-0000000000000001','Pirkimo sutartis',1,'2025-01-01 00:00:00','2026-01-01 00:00:00',30,365,0,NULL,'contracts@example.com'),
('DOC-0000000000000002','Darbo sutartis',3,'2024-06-01 00:00:00','2029-06-01 00:00:00',14,365,0,NULL,'hr@example.com'),
('DOC-0000000000000003','Nuomos sutartis',2,'2023-09-15 00:00:00','2024-09-15 00:00:00',7,30,1,'2024-09-15 00:00:00','legal@example.com');

INSERT INTO `IrasasNaudotojas` (`IrasasId`,`NaudotojasId`,`Prekes_Adminas`) VALUES
(1,'c56a4180-65aa-42ec-a945-5fd21dec0538',1),
(1,'9a1b7f10-2b3c-4c3b-9e8a-123456789abc',0),
(2,'d3f8a9e4-11b2-4e2a-9f1b-abcdef123456',1);

INSERT INTO `Comment` (`CommentText`,`IrasasId`,`NaudotojasId`) VALUES
('Patvirtinu sutarti.','1','c56a4180-65aa-42ec-a945-5fd21dec0538'),
('Reikia papildomos informacijos apie nuomos terminus.','3','9a1b7f10-2b3c-4c3b-9e8a-123456789abc');

COMMIT;
