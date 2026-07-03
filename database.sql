
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
    `tags` TEXT NOT NULL,
    `logo_url` TEXT DEFAULT NULL
);

INSERT INTO `language_data`(`name`, `color`, `tags`, `logo_url`)
VALUES
    ('JavaScript', '#f7df1e', 'programing-language', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Unofficial_JavaScript_logo_2.svg/1280px-Unofficial_JavaScript_logo_2.svg.png?_=20141107110902'),
    ('Python', '#356d9c', 'programing-language', 'https://s3.dualstack.us-east-2.amazonaws.com/pythondotorg-assets/media/files/python-logo-only.svg'),
    ('Lua', '#080883', 'programing-language', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Lua-Logo.svg/1280px-Lua-Logo.svg.png?_=20150107024942'),
    ('C', '#699dd3', 'programing-language', 'https://upload.wikimedia.org/wikipedia/commons/1/18/C_Programming_Language.svg'),
    ('C++', '#084985', 'programing-language', 'https://upload.wikimedia.org/wikipedia/commons/1/18/ISO_C%2B%2B_Logo.svg'),
    ('C#', '#260064', 'programing-language', 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Logo_C_sharp.svg'),
    ('Ruby', '#ef151a', 'programing-language', 'https://upload.wikimedia.org/wikipedia/commons/7/73/Ruby_logo.svg'),
    ('Go', '#6ed8e5', 'programing-language', 'https://go.dev/blog/go-brand/Go-Logo/SVG/Go-Logo_Blue.svg'),
    ('Rust', '#e43d1e', 'programing-language', 'https://rust-lang.org/logos/rust-logo-blk.svg'),
    ('PHP', '#787cb4', 'programing-language', 'https://www.php.net/images/logos/new-php-logo.svg'),
    ('Java', '#e22b2c', 'programing-language', 'https://upload.wikimedia.org/wikipedia/pt/thumb/3/30/Java_programming_language_logo.svg/500px-Java_programming_language_logo.svg.png?_=20190828223431*'),
    ('TypeScript', '#2f74bf', 'programing-language', 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg'),
    ('Objective-C', '#f7841d', 'programing-language', NULL),
    ('Shell', '#000000', 'programing-language', NULL),

    ('Blade', '#db2c25', 'library', NULL)
    ('Handlebars', '#362515', 'library', NULL),
    ('EJS', '#a31d4d', 'library', NULL),

    ('Vue', '#3eb27e', 'frontend-framework', NULL),
    ('Svelte', '#ff4408', 'frontend-framework', 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Svelte_Logo.svg'),

    ('Batchfile', '#a3a5ae', 'config-language', NULL),
    ('Makefile', '#ef5855', 'config-language', NULL),
    ('Dockerfile', '#12b9db', 'config-language', NULL),

    ('HTML', '#e4522c', 'data-language', 'https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg'),
    ('CSS', '#2c52e4', 'data-language', 'https://upload.wikimedia.org/wikipedia/commons/6/62/CSS3_logo.svg'),
    ('SCSS', '#c66394', 'data-language', 'https://sass-lang.com/assets/img/logos/logo.svg')
;

