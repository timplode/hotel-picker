# Hotel Picker MySQL Database

This directory contains initialization scripts for the MySQL database.

## Database Configuration

- **Database Name**: hotel_picker
- **Username**: hotel_user
- **Password**: hotel_password
- **Root Password**: rootpassword
- **Port**: 3306

## Usage

To start the MySQL database:

```bash
docker-compose up -d mysql
```

To stop the database:

```bash
docker-compose down
```

To view logs:

```bash
docker-compose logs mysql
```

## Connection String Examples

For your application configuration:

```
Host: localhost
Port: 3306
Database: hotel_picker
Username: hotel_user
Password: hotel_password
```

Or as a connection string:
```
mysql://hotel_user:hotel_password@localhost:3306/hotel_picker
```