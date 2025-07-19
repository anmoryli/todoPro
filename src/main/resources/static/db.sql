drop table if exists ai;
drop table if exists todo;
drop table if exists overall;
drop table if exists day;
drop table if exists user;

create table if not exists user (
    user_id int not null auto_increment primary key,
    username varchar(50) not null unique,
    password varchar(255) not null,
    email varchar(100) unique,
    created_at datetime not null default current_timestamp,
    updated_at datetime not null default current_timestamp on update current_timestamp
);

create table if not exists overall (
    overall_id int not null auto_increment primary key,
    user_id int not null,
    name varchar(1024) not null,
    description text,
    img_path varchar(1024),
    is_completed boolean not null default false, # 用于标记是否完成
    created_at datetime not null default current_timestamp,
    updated_at datetime not null default current_timestamp on update current_timestamp,
    foreign key (user_id) references user(user_id) on delete cascade
);

# 每日总结表，用于记录用户的每日总结
create table if not exists day (
    day_id int not null auto_increment primary key,
    user_id int not null,
    title varchar(255) not null,
    overview text,
    created_at datetime not null default current_timestamp,
    updated_at datetime not null default current_timestamp on update current_timestamp,
    foreign key (user_id) references user(user_id) on delete cascade
);

create table if not exists todo (
    todo_id int not null auto_increment primary key,
    day_id int not null ,
    overall_id int not null,
    user_id int not null,
    title varchar(255) not null,
    description text,
    is_completed boolean not null default false,
    created_at datetime not null default current_timestamp,
    updated_at datetime not null default current_timestamp on update current_timestamp,
    foreign key (overall_id) references overall(overall_id) on delete cascade,
    foreign key (user_id) references user(user_id) on delete cascade,
    foreign key (day_id) references day(day_id) on delete cascade
);

create table if not exists ai (
    ai_id int not null auto_increment primary key,
    overall_id int not null,
    user_id int not null,
    title varchar(255) not null,
    daily_goals text,
    is_checked boolean not null default false,# 用于检验用户是否已经查验
    is_accepted boolean not null default false,# 用于检验用户是否已经接受建议
    created_at datetime not null default current_timestamp,
    updated_at datetime not null default current_timestamp on update current_timestamp,
    foreign key (overall_id) references overall(overall_id) on delete cascade,
    foreign key (user_id) references user(user_id) on delete cascade
);

create table if not exists ai_overview (
    ai_overview_id int not null auto_increment primary key,
    user_id int not null,
    title varchar(255) not null,
    overview text,
    created_at datetime not null default current_timestamp,
    updated_at datetime not null default current_timestamp on update current_timestamp,
    foreign key (user_id) references user(user_id) on delete cascade
);