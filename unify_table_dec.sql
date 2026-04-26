CREATE DATABASE unify;
USE unify;

CREATE TABLE USERS (
    userID   INT UNIQUE NOT NULL,
    fname    VARCHAR(255),
    lname    VARCHAR(255),
    username VARCHAR(255),
    passwords VARCHAR(255),
    ADMINSID  INT,
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
    groupName       VARCHAR(255),
    groupDesc       VARCHAR(255),
    userID          INT,
    CONSTRAINT pk_social_group      PRIMARY KEY (groupID),
    CONSTRAINT fk_social_group_userID FOREIGN KEY (userID) REFERENCES USERS(userID)
);

CREATE TABLE COURSE (
    groupID    INT NOT NULL,
    courseCode VARCHAR(255),
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
    userID    INT NOT NULL,
    clubAff   VARCHAR(255),
    CONSTRAINT fk_club_groupID FOREIGN KEY (groupID) REFERENCES SOCIAL_GROUP(groupID),
    CONSTRAINT fk_club_userID  FOREIGN KEY (userID)  REFERENCES USERS(userID)
);

CREATE TABLE GROUP_MEMBERS (
  groupID INT NOT NULL,
  userID  INT NOT NULL,
  CONSTRAINT pk_group_members PRIMARY KEY (groupID, userID),
  CONSTRAINT fk_gm_groupID FOREIGN KEY (groupID) REFERENCES SOCIAL_GROUP(groupID),
  CONSTRAINT fk_gm_userID  FOREIGN KEY (userID)  REFERENCES USERS(userID)
);

CREATE TABLE UNIPAGE(
    userID INT NOT NULL,
    UniName VARCHAR(255),
    UniDesc VARCHAR(255),
    approved TINYINT(1) DEFAULT 0,
    CONSTRAINT fk_uni_user_id FOREIGN KEY (userID) REFERENCES USERS(userID)
);

CREATE TABLE COMPPAGE (
    userID INT NOT NULL,
    CompName VARCHAR(255),
    CompDesc VARCHAR(255),
    approved TINYINT(1) DEFAULT 0,
    CONSTRAINT fk_comp_user_id FOREIGN KEY (userID) REFERENCES USERS(userID)
);

CREATE TABLE POSTS (
    postID INT UNIQUE NOT NULL,
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

-- Admin
INSERT INTO USERS (userID, fname, lname, username, passwords) VALUES (999, 'Admin', 'User', 'admin', 'admin');
INSERT INTO ADMINS (ADMINSID, userID) VALUES (999, 999);
INSERT INTO STUDENT (userID, personalEmail) VALUES (999, 'admin@admin.com');

-- Students
INSERT INTO USERS (userID, fname, lname, username, passwords) VALUES
(1, 'Alice', 'Smith',   'alice_s',  'password'),
(2, 'Bob',   'Johnson', 'bob_j',    'password'),
(3, 'Carol', 'Williams','carol_w',  'password');

INSERT INTO STUDENT (userID, personalEmail) VALUES
(1, 'alice@gmail.com'),
(2, 'bob@gmail.com'),
(3, 'carol@gmail.com');

-- Faculty
INSERT INTO USERS (userID, fname, lname, username, passwords) VALUES
(4, 'Dr. James', 'Lee',    'jlee_prof',  'password'),
(5, 'Prof. Sara', 'Patel', 'sara_patel', 'password');

INSERT INTO FACULTY (userID, universityEmail) VALUES
(4, 'jlee@university.edu'),
(5, 'spatel@university.edu');

-- Company Reps
INSERT INTO USERS (userID, fname, lname, username, passwords) VALUES
(6, 'Mark',  'Chen',   'mark_techcorp', 'password'),
(7, 'Laura', 'Garcia', 'laura_nexus',   'password');

INSERT INTO COMPANY_REP (userID, businessEmail) VALUES
(6, 'mark@techcorp.com'),
(7, 'laura@nexuslabs.com');

-- University pages (pending approval)
INSERT INTO UNIPAGE (userID, UniName, UniDesc, approved) VALUES
(4, 'State University', 'A leading research university with programs in engineering, arts, and sciences.', 0),
(5, 'City College', 'Community-focused college offering undergraduate and graduate programs.', 0);

-- Company pages (pending approval)
INSERT INTO COMPPAGE (userID, CompName, CompDesc, approved) VALUES
(6, 'TechCorp', 'Software solutions company specialising in cloud infrastructure and AI tools.', 0),
(7, 'Nexus Labs', 'Biotech startup developing next-generation diagnostic equipment.', 0);

-- Posts
INSERT INTO POSTS (postID, userID, postContent, privStatus) VALUES
(1, 1, 'Just finished my first assignment for CS101 - feeling great!', 'public'),
(2, 2, 'Anyone want to form a study group for the midterms?', 'public'),
(3, 3, 'Looking for notes on chapter 5 of the biology textbook.', 'public'),
(4, 4, 'Office hours moved to Thursday 2-4pm this week.', 'public'),
(5, 6, 'TechCorp is hiring summer interns! Check our job board.', 'public');

-- Boards
INSERT INTO BOARDS (boardID, userID, boardDesc, privStatus) VALUES
(1, 4, 'Ask your course questions here.',        'public'),
(2, 5, 'End of semester networking event.',       'public'),
(3, 6, 'Software Engineering Intern - Summer 2025.', 'public');

INSERT INTO QUESTIONBOARD (userID, boardID, category) VALUES (4, 1, 'Academic');
INSERT INTO EVENTBOARD    (userID, boardID, eventTime, eventLoc) VALUES (5, 2, '2025-12-10 18:00', 'Main Hall Room 204');
INSERT INTO JOBBOARD      (userID, boardID, jobfield, employerName, appDeadline) VALUES (6, 3, 'Software Engineering', 'TechCorp', '2025-08-01');

-- Social groups
INSERT INTO SOCIAL_GROUP (groupID, groupName, groupDesc, userID) VALUES
(1, 'CS101 Study Group',      'Weekly study sessions for CS101 students.',     1),
(2, 'Biology Majors',         'Group for all students in the biology program.', 3),
(3, 'Photography Club',       'For students passionate about photography.',     2);

INSERT INTO COURSE (groupID, courseCode, userID) VALUES (1, 'CS101', 1);
INSERT INTO MAJOR  (groupID, department, userID)  VALUES (2, 'Biology', 3);
INSERT INTO CLUB   (groupID, clubRepID, userID)   VALUES (3, 2, 2);

