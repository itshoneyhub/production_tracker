-- Insert sample data into Stages table
INSERT INTO Stages (id, name, remarks) VALUES
(gen_random_uuid(), 'HOLD from Team', ''),
(gen_random_uuid(), 'Under Manufacturing', ''),
(gen_random_uuid(), 'Ready for Internal FAT', ''),
(gen_random_uuid(), 'Ready for Client FAT', ''),
(gen_random_uuid(), 'Ready for Dispatch', ''),
(gen_random_uuid(), 'Dispatched', '');

-- Insert sample data into Projects table
INSERT INTO Projects (id, projectNo, customerName, owner, projectDate, targetDate, productionStage, remarks) VALUES
(gen_random_uuid(), 'P001', 'Acme Corporation', 'John Doe', '2024-01-15', '2024-03-15', 'Production', 'On track for delivery.'),
(gen_random_uuid(), 'P002', 'Globex Corporation', 'Jane Smith', '2024-02-01', '2024-04-01', 'Design', 'Awaiting customer feedback on prototype.');