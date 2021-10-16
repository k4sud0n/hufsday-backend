# hufsday-back

### 환경변수

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=DB비밀번호
DB_NAME=DB이름
SECRET_KEY=랜덤키
```

### 쿼리 최적화

https://jojoldu.tistory.com/529

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

### 댓글 테이블

```sql
CREATE TABLE seoulfree_comment (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    content text NOT NULL,
    created datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    nickname varchar(50) NOT NULL,
    post_id INT NOT NULL,
    FOREIGN KEY (`post_id`) REFERENCES seoulfree (`id`)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
```

```sql
INSERT INTO seoulfree_comment (content, nickname, post_id) VALUES ('이건 댓글입니당', 'test1', '36');
```

```sql
SELECT seoulfree.id, seoulfree.title, seoulfree.content, seoulfree.created, count(seoulfree_comment.post_id) as number_of_comments from seoulfree left join seoulfree_comment on (seoulfree.id = seoulfree_comment.post_id) group by seoulfree.id limit 20;
```

```sql
SELECT s.*, c.* FROM seoulfree_comment c join seoulfree s on c.post_id = s.id WHERE s.id = 36;
SELECT c.post_id, c.id, c.content, c.created FROM seoulfree_comment c join seoulfree s on c.post_id = s.id WHERE s.id = 36;
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
