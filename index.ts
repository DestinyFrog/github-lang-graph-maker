import { connect } from "@tursodatabase/serverless"
import ejs from "ejs"

const db = await connect({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
})
const q_select_owner_by_name = await db.prepare("SELECT * FROM owner WHERE name = ?")
const q_insert_owner = await db.prepare("INSERT INTO owner(name) VALUES (?)")
const q_insert_repo = await db.prepare("INSERT INTO repo(name, owner_id) VALUES (?, ?) RETURNING id")
const q_insert_language_usage = await db.prepare("INSERT INTO language_usage(language, usage, repo_id) VALUES (?, ?, ?)")
const q_update_last_updated_at = await db.prepare("UPDATE owner SET last_updated_at = CURRENT_TIMESTAMP WHERE ?")
const q_delete_repo_by_owner = await db.prepare("DELETE FROM repo WHERE owner_id = ?")
const q_delete_language_usage_by_owner = await db.prepare("DELETE FROM language_usage WHERE repo_id IN (SELECT id FROM repo WHERE owner_id = ?);")

interface Owner {
    id: number
    name: string
    last_updated_at: string
    created_at: string
}

async function fetch_repos_by_owner(owner_name: string) {
    const res = await fetch(`https://api.github.com/users/${owner_name}/repos`)
    const repositories = await res.json()
    return repositories as { name: string }[]
}

async function fetch_language_usage_by_repo(owner_name: string, repo_name: string) {
    const res = await fetch(`https://api.github.com/repos/${owner_name}/${repo_name}/languages`)
    const languages = await res.json()
    return languages as { [key: string]: number }
}

async function update_owner_data(github_user: string, reload = false) {
    const data = await q_select_owner_by_name.all(github_user)
    let owner = null as Owner | null 
    let owner_existed = (data.length > 0)
    if (owner_existed) owner = data[0]

    if (owner == null) {
        await q_insert_owner.run(github_user)

        const data = await q_select_owner_by_name.all(github_user)
        owner = data[0] as Owner
    }

    const one_week_before = new Date()
    one_week_before.setDate(one_week_before.getDate() - 7)

    if (reload || !owner_existed || new Date(owner.last_updated_at) < one_week_before) {
        await q_delete_language_usage_by_owner.run([ owner.id ])
        await q_delete_repo_by_owner.run([ owner.id ])

        const api_repos = await fetch_repos_by_owner(owner.name)

        for (const repo of api_repos) {
            const data_repo = await q_insert_repo.all([repo.name, owner.id])
            const repo_id = data_repo[0].id

            const languages = await fetch_language_usage_by_repo(owner.name, repo.name)
            for (const [language, usage] of Object.entries(languages)) {
                await q_insert_language_usage.run([language, usage, repo_id])
            }
        }

        await q_update_last_updated_at.run(owner.id)
    }

    return owner
}

const server = Bun.serve({
    routes: {
        "/:github_user": async req => {
            const github_user = req.params.github_user

            const url = new URL(req.url)
            const tags_str = url.searchParams.get("tags")
            const reload = !!url.searchParams.get("reload")

            const owner = await update_owner_data(github_user, reload)

            let q_where_tags = ''
            if (tags_str) {
                const tags_sql = tags_str.split(',').map(tag => `'${tag.trim()}'`).join(', ')
                q_where_tags = ` AND tags IN (${tags_sql})`
            }

            let q_get_languages_by_owner = `SELECT lu.language, SUM(lu.usage) AS usage, la.*, owner_id
                FROM language_usage lu
                INNER JOIN language_data la ON la.name = lu.language
                INNER JOIN repo r ON r.id = lu.repo_id
                WHERE r.owner_id = ?
                ${q_where_tags}
                GROUP BY lu.language
                ORDER BY usage DESC;
                `

            const query = await db.prepare(q_get_languages_by_owner)
            const languages = await query.all(owner.id) as {
                color: string,
                usage: number,
                name: string
            }[]

            const total = languages.reduce((acc, language) => acc + language.usage, 0)

            const file = Bun.file('./sector_chart.ejs')
            const template_str = await file.text()
            const output_svg = ejs.render(template_str, {
                total,
                languages
            })

            return new Response(output_svg, {
                headers: { "Content-Type": "image/svg+xml" },
            });
        },
    }
})

console.log(`Server running at ${server.url}`);