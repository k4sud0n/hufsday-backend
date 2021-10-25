# hufsday-back

### 환경변수

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=DB비밀번호
DB_NAME=DB이름
SECRET_KEY=JWT 토큰 랜덤키
```

### 보안

https://jeong-pro.tistory.com/68

### 쿼리 최적화

https://jojoldu.tistory.com/529

### 게시판 테이블

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
    FOREIGN KEY (user_id) REFERENCES user(id)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
```

### 게시판 추천수/비추천수 테이블

```sql
CREATE TABLE seoulfree_thumbs (
    id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
    post_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    thumbs_up BOOLEAN NOT NULL DEFAULT 0,
    thumbs_down BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (post_id) REFERENCES seoulfree(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
```

### 게시판 검색 쿼리

```sql
SELECT title from seoulfree where title like '%test1%';
```

이렇게 할 경우 데이터가 많으면 검색 속도가 느려지기 때문에 최적화할 다른 방법이 필요하다.

### 댓글 테이블

```sql
CREATE TABLE seoulfree_comment (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    parent_id INT NULL,
    post_id INT UNSIGNED NOT NULL,
    content text NOT NULL,
    created datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INT UNSIGNED NOT NULL,
    thumbs_up INT NOT NULL DEFAULT 0,
    FOREIGN KEY (post_id) REFERENCES seoulfree(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
```

### 댓글 추천수/비추천수 테이블

```sql
CREATE TABLE seoulfree_comment_thumbs (
    id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
    comment_id INT NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    thumbs_up BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (comment_id) REFERENCES seoulfree_comment(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
```

### 유저 테이블

```sql
CREATE TABLE user (
    id INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username varchar(50) UNIQUE NOT NULL,
    password varchar(255) NOT NULL,
    nickname varchar(50) UNIQUE NOT NULL,
    created datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4;
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

### 문제

프론트엔드에서 jwt 쿠키 가져오기는 https://r4bb1t.tistory.com/38 참고 (간단하게 proxy 주면 해결되는 문제)

### 개선

- 토큰 시스템 passport-jwt로 고치기
- [REST API 다시 설계하기](https://sanghaklee.tistory.com/57)
- DB 테이블 일일이 쿼리 치지 말고 knex createSchema 사용해서 개선하기
