CREATE TABLE system_users
(
    id          serial       not null primary key,
    username    text                ,
    password    text                ,
    firstname   text                ,
    lastname    text                ,   
    dateregistered  DATE        

);

CREATE TABLE user_playlist
(
    id          serial       not null primary key,
    moviename   text               ,
    movieposter text               ,
    dateadded   DATE                ,
    movieid     text                ,
    userid      INT              ,  
    foreign key (userId) references system_users(id)
);