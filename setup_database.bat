@echo off
echo ========================================
echo KTA ERP - Database Setup
echo ========================================
echo.
echo This will create the local database for KTA ERP.
echo.
echo Make sure PostgreSQL is installed and running!
echo Default password for postgres user will be required.
echo.
pause

psql -U postgres -c "CREATE DATABASE kta_erp_local;"
psql -U postgres -c "CREATE USER kta_admin WITH PASSWORD 'kta_local_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE kta_erp_local TO kta_admin;"
psql -U postgres -d kta_erp_local -c "GRANT ALL ON SCHEMA public TO kta_admin;"

echo.
echo ========================================
echo Database setup complete!
echo ========================================
echo Database: kta_erp_local
echo User: kta_admin
echo Password: kta_local_password
echo.
pause
