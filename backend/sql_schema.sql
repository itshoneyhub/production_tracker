CREATE TABLE Projects (
    id NVARCHAR(255) PRIMARY KEY,
    projectNo NVARCHAR(255) NOT NULL,
    customerName NVARCHAR(255) NOT NULL,
    owner NVARCHAR(255) NOT NULL,
    projectDate DATE NOT NULL,
    targetDate DATE NOT NULL,
    productionStage NVARCHAR(255) NOT NULL,
    remarks NVARCHAR(MAX)
);

CREATE TABLE Stages (
    id NVARCHAR(255) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    remarks NVARCHAR(MAX)
);