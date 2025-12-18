-- Create database if not exists
CREATE DATABASE IF NOT EXISTS `ues`;

-- Grant all privileges on ues database to root from any host
GRANT ALL PRIVILEGES ON `ues`.* TO 'dev'@'%';

-- Flush privileges to ensure changes take effect
FLUSH PRIVILEGES;