# hufsday-back

### 환경변수

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=DB비밀번호
DB_NAME=DB이름
SECRET_KEY=랜덤키
```

### 게시판 테이블

https://backend-intro.vlpt.us/3/01.html

```sql
CREATE TABLE seoulfree (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    title varchar(50) NOT NULL,
    content text NOT NULL,
    created datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    nickname varchar(50) NOT NULL,
    FOREIGN KEY (`nickname`) REFERENCES user (`nickname`)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
```

```sql
INSERT INTO seoulfree (title, content, user_id) VALUES ('엄준식은 살아있다', '네 그렇다고 합니다', 'test1');
```

### 유저 테이블

https://backend-intro.vlpt.us/3/01.html

```sql
CREATE TABLE user (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    user_id varchar(50) UNIQUE NOT NULL,
    password varchar(255) NOT NULL,
    nickname varchar(50) UNIQUE NOT NULL,
    created datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
```

```sql
INSERT INTO user (user_id, password, nickname) VALUES ('test1', 'test1', 'test1');
```

### 로그인

프론트엔드에서 jwt 쿠키 가져오기는 https://r4bb1t.tistory.com/38 참고
