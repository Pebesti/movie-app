create database movies_app;
create role movies login password 'movies123';
grant all privileges on database movies_app to movies;