-- Convert date_of_birth to date type
ALTER TABLE users 
ALTER COLUMN date_of_birth TYPE date 
USING date_of_birth::date; 