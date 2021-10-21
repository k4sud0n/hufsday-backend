# hufsday-back

### 환경변수

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=DB비밀번호
DB_NAME=DB이름
SECRET_KEY=랜덤키
```

### 보안

https://jeong-pro.tistory.com/68

### 쿼리 최적화

https://jojoldu.tistory.com/529

### 게시판 테이블

https://backend-intro.vlpt.us/3/01.html

```sql
CREATE TABLE seoulfree (
    id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
    title varchar(50) NOT NULL,
    content text NOT NULL,
    created datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INT UNSIGNED NOT NULL,
    view_count INT NOT NULL DEFAULT 0,
    thumbs_up INT NOT NULL DEFAULT 0,
    thumbs_down INT NOT NULL DEFAULT 0,
    FOREIGN KEY (`user_id`) REFERENCES user (`id`)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
```

```sql
INSERT INTO seoulfree (title, content, username) VALUES ('엄준식은 살아있다', '네 그렇다고 합니다', 'test1');
```

### 댓글 테이블

```sql
CREATE TABLE seoulfree_comment (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    post_id INT UNSIGNED NOT NULL,
    content text NOT NULL,
    created datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INT UNSIGNED NOT NULL,
    thumbs_up INT NOT NULL DEFAULT 0,
    FOREIGN KEY (post_id) REFERENCES seoulfree(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
```

```sql
INSERT INTO seoulfree_comment (content, nickname, post_id) VALUES ('이건 댓글입니당', 'test1', '36');
```

```sql
SELECT seoulfree.id, seoulfree.title, seoulfree.content, seoulfree.created, count(seoulfree_comment.post_id) as number_of_comments from seoulfree left join seoulfree_comment on (seoulfree.id = seoulfree_comment.post_id) where seoulfree.id = 1;
```

```sql
SELECT s.*, c.* FROM seoulfree_comment c join seoulfree s on c.post_id = s.id WHERE s.id = 36;
SELECT c.post_id, c.id, c.content, c.created FROM seoulfree_comment c join seoulfree s on c.post_id = s.id WHERE s.id = 36;
```

```sql
UPDATE seoulfree_comment SET thumbs_up = ifnull(thumbs_up, 0) + 1 WHERE id = 1;
update `seoulfree_comment` set `thumbs_up` = thumbs_up + 1 where `id` = '1';
```

```sql
SELECT * FROM seoulfree ORDER BY id DESC LIMIT 4;
```

### 유저 테이블

https://backend-intro.vlpt.us/3/01.html

```sql
CREATE TABLE user (
    id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username varchar(50) UNIQUE NOT NULL,
    password varchar(255) NOT NULL,
    nickname varchar(50) UNIQUE NOT NULL,
    created datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
```

```sql
INSERT INTO user (username, password, nickname) VALUES ('test1', 'test1', 'test1');
```

### 알림 테이블

```sql
CREATE TABLE notification (
    id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
    post_id INT UNSIGNED NOT NULL,
    sender_id INT UNSIGNED NOT NULL,
    receiver_id INT UNSIGNED NOT NULL,
    content text NOT NULL,
    created datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    readed boolean not null default 0,
    FOREIGN KEY (post_id) REFERENCES seoulfree(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES user(id),
    FOREIGN KEY (receiver_id) REFERENCES user(id)
);
```

```sql
INSERT INTO notification (sender_id, receiver_id, content) VALUES ('2', '1', 'hiiiii');
```

```sql
update notification set readed = 1 where id = 5 and receiver_id = 1;
```

### 로그인

프론트엔드에서 jwt 쿠키 가져오기는 https://r4bb1t.tistory.com/38 참고
그냥 proxy 값 주면 해결되는 문제였음

### 개선

api에서 유저 닉네임 다 받아오는데 이건 익명이 아님..
차라리 DB 테이블에 가입시 랜덤 난수를 줘서 그걸로 식별하게 해볼까?

토큰 시스템 passport-jwt로 고치기
