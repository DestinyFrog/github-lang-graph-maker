
CREATE TABLE `owner` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `name` TEXT UNIQUE NOT NULL,
    `last_updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `repo` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `name` TEXT NOT NULL,
    `owner_id` INTEGER NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (`owner_id`) REFERENCES `owner`(`id`)
);

CREATE TABLE `language_usage` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `language` TEXT NOT NULL,
    `usage` INTEGER NOT NULL,
    `repo_id` INTEGER NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (`repo_id`) REFERENCES `repo`(`id`)
);

CREATE TABLE `language_data` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `name` TEXT NOT NULL,
    `color` TEXT NOT NULL,
    `tags` TEXT NOT NULL
);

INSERT INTO `language_data`(`name`, `color`, `tags`)
VALUES
    ('JavaScript', '#f7df1e', 'programing-language'),
    ('Python', '#356d9c', 'programing-language'),
    ('Lua', '#080883', 'programing-language'),
    ('C', '#699dd3', 'programing-language'),
    ('C++', '#084985', 'programing-language'),
    ('C#', '#260064', 'programing-language'),
    ('Ruby', '#ef151a', 'programing-language'),
    ('Go', '#6ed8e5', 'programing-language'),
    ('Rust', '#e43d1e', 'programing-language'),
    ('PHP', '#787cb4', 'programing-language'),
    ('Java', '#e22b2c', 'programing-language'),
    ('TypeScript', '#2f74bf', 'programing-language'),

    ('EJS', '#a31d4d', 'library'),

    ('Svelte', '#ff4408', 'frontend-framework'),

    ('Makefile', '#ef5855', 'config-language'),
    ('Dockerfile', '#12b9db', 'config-language'),

    ('HTML', '#e4522c', 'data-language'),
    ('CSS', '#2c52e4', 'data-language'),
    ('SCSS', '#c66394', 'data-language')
;

CREATE VIEW get_languages_by_owner AS
SELECT lu.language, SUM(lu.usage) AS usage, la.*, owner_id
FROM `language_usage` lu
LEFT JOIN `language_data` la ON la.name = lu.language
LEFT JOIN `repo` r ON r.id = lu.repo_id
GROUP BY lu.language
ORDER BY usage DESC;
