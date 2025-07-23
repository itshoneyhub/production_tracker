
-- Insert sample data into Stages table
INSERT INTO Stages (id, name, remarks) VALUES
(NEWID(), 'Planning', 'Initial project planning and requirements gathering'),
(NEWID(), 'Design', 'Design and prototyping phase'),
(NEWID(), 'Production', 'Active production and development'),
(NEWID(), 'Testing', 'Quality assurance and testing'),
(NEWID(), 'Completed', 'Project has been completed and delivered');

-- Insert sample data into Projects table
INSERT INTO Projects (id, projectNo, customerName, projectDate, targetDate, productionStage, remarks) VALUES
(NEWID(), 'P001', 'Acme Corporation', '2024-01-15', '2024-03-15', 'Production', 'On track for delivery.'),
(NEWID(), 'P002', 'Globex Corporation', '2024-02-01', '2024-04-01', 'Design', 'Awaiting customer feedback on prototype.');
