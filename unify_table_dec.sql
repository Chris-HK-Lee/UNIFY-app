CREATE DATABASE unify;
USE unify;

CREATE TABLE USERS (
    userID   INT UNIQUE NOT NULL,
    fname    VARCHAR(255),
    lname    VARCHAR(255),
    username VARCHAR(255),
    password VARCHAR(255),
    ADMINSID  INT,
    groupID  INT,
    CONSTRAINT pk_userID PRIMARY KEY (userID)
);

CREATE TABLE FRIEND (
    friendID   INT NOT NULL,
    friendeeID INT NOT NULL,
    CONSTRAINT fk_friend_friendID   FOREIGN KEY (friendID)   REFERENCES USERS(userID),
    CONSTRAINT fk_friend_friendeeID FOREIGN KEY (friendeeID) REFERENCES USERS(userID)
);

CREATE TABLE ADMINS (
    ADMINSID INT NOT NULL,
    userID  INT NOT NULL,
    CONSTRAINT fk_ADMINS_ADMINSID FOREIGN KEY (ADMINSID) REFERENCES USERS(userID),
    CONSTRAINT fk_ADMINS_userID  FOREIGN KEY (userID)  REFERENCES USERS(userID)
);

CREATE TABLE STUDENT (
    userID        INT NOT NULL,
    personalEmail VARCHAR(255),
    CONSTRAINT fk_student_userID FOREIGN KEY (userID) REFERENCES USERS(userID)
);

CREATE TABLE COMPANY_REP (
    userID        INT NOT NULL,
    businessEmail VARCHAR(255),
    CONSTRAINT fk_company_rep_userID FOREIGN KEY (userID) REFERENCES USERS(userID)
);

CREATE TABLE FACULTY (
    userID          INT NOT NULL,
    universityEmail VARCHAR(255),
    CONSTRAINT fk_faculty_userID FOREIGN KEY (userID) REFERENCES USERS(userID)
);

CREATE TABLE SOCIAL_GROUP (
    groupID         INT NOT NULL,
    name            VARCHAR(255),
    userID          INT,
    numberOfMembers INT,
    CONSTRAINT pk_social_group      PRIMARY KEY (groupID),
    CONSTRAINT fk_social_group_userID FOREIGN KEY (userID) REFERENCES USERS(userID)
);

CREATE TABLE COURSE (
    groupID    INT NOT NULL,
    courseCode INT,
    userID     INT NOT NULL,
    CONSTRAINT fk_course_groupID FOREIGN KEY (groupID) REFERENCES SOCIAL_GROUP(groupID),
    CONSTRAINT fk_course_userID  FOREIGN KEY (userID)  REFERENCES USERS(userID)
);

CREATE TABLE MAJOR (
    groupID    INT NOT NULL,
    department VARCHAR(255),
    userID     INT NOT NULL,
    CONSTRAINT fk_major_groupID FOREIGN KEY (groupID) REFERENCES SOCIAL_GROUP(groupID),
    CONSTRAINT fk_major_userID  FOREIGN KEY (userID)  REFERENCES USERS(userID)
);

CREATE TABLE CLUB (
    groupID   INT NOT NULL,
    clubRepID INT,
    userID    INT NOT NULL,
    CONSTRAINT fk_club_groupID FOREIGN KEY (groupID) REFERENCES SOCIAL_GROUP(groupID),
    CONSTRAINT fk_club_userID  FOREIGN KEY (userID)  REFERENCES USERS(userID)
);

CREATE TABLE UNIPAGE(
    userID INT NOT NULL,
    UniName VARCHAR(255),
    UniDesc VARCHAR(255),
    CONSTRAINT fk_uni_user_id FOREIGN KEY (userID) REFERENCES USERS(userID)
);

CREATE TABLE COMPPAGE (
    userID INT NOT NULL,
    CompName VARCHAR(255),
    CompDesc VARCHAR(255),
    CONSTRAINT fk_comp_user_id FOREIGN KEY (userID) REFERENCES USERS(userID)
);

CREATE TABLE POSTS (
    postID INT UNIQUE,
    userID INT NOT NULL,
    postContent TEXT,
    privStatus VARCHAR(255),
    CONSTRAINT pk_post PRIMARY KEY (postID),
    CONSTRAINT fk_p_user_id FOREIGN KEY (userID) REFERENCES USERS(userID)
);

CREATE TABLE BOARDS (
    boardID INT UNIQUE,
    userID INT NOT NULL,
    boardDesc VARCHAR(255),
    privStatus VARCHAR(255),
    CONSTRAINT pk_post PRIMARY KEY (boardID),
    CONSTRAINT fk_b_user_id FOREIGN KEY (userID) REFERENCES USERS(userID)
);

CREATE TABLE UPLOADED (
    userID INT NOT NULL,
    postID INT NOT NULL,
    boardID INT NOT NULL,
    CONSTRAINT fk_up_user_id FOREIGN KEY (userID) REFERENCES USERS(userID),
    CONSTRAINT fk_up_post_id FOREIGN KEY (postID) REFERENCES POSTS(postID),
    CONSTRAINT fk_up_board_id FOREIGN KEY (boardID) REFERENCES BOARDS(boardID)
);

CREATE TABLE EVENTBOARD (
    userID INT NOT NULL,
    boardID INT NOT NULL,
    eventTime VARCHAR(255),
    eventLoc VARCHAR(255),
    CONSTRAINT fk_eb_user_id FOREIGN KEY (userID) REFERENCES USERS(userID),
    CONSTRAINT fk_eb_board_id FOREIGN KEY (boardID) REFERENCES BOARDS(boardID)
);

CREATE TABLE QUESTIONBOARD (
    userID INT NOT NULL,
    boardID INT NOT NULL,
    category VARCHAR(255),
    CONSTRAINT fk_qb_user_id FOREIGN KEY (userID) REFERENCES USERS(userID),
    CONSTRAINT fk_qb_board_id FOREIGN KEY (boardID) REFERENCES BOARDS(boardID)
);

CREATE TABLE JOBBOARD (
    userID INT NOT NULL,
    boardID INT NOT NULL,
    jobfield VARCHAR(255),
    employerName VARCHAR(255),
    appDeadline VARCHAR(255),
    CONSTRAINT fk_jb_user_id FOREIGN KEY (userID) REFERENCES USERS(userID),
    CONSTRAINT fk_jb_board_id FOREIGN KEY (boardID) REFERENCES BOARDS(boardID)
);

