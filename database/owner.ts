import { db } from "./db"

interface OwnerParams {
    id: number,
    name: string,
    last_updated_at: string,
    created_at: string
}

export class Owner {
    private id: number
    private name: string
    private last_updated_at: Date
    private created_at: Date

    constructor({ id, name, last_updated_at, created_at }: OwnerParams) {
        this.id = id
        this.name = name
        this.last_updated_at = new Date(last_updated_at)
        this.created_at = new Date(created_at)
    }

    public should_reload() {
        const one_week_before = new Date()
        one_week_before.setDate(one_week_before.getDate() - 7)
        return this.last_updated_at < one_week_before
    }

    private async update_last_updated_at() {
        const query = await db.prepare("UPDATE owner SET last_updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        await query.run(this.id)
    }

    private async clear() {
        let query = await db.prepare("DELETE FROM language_usage WHERE repo_id IN (SELECT id FROM repo WHERE owner_id = ?);")
        await query.run([ this.id ])
        
        query = await db.prepare("DELETE FROM repo WHERE owner_id = ?")
        await query.run([ this.id ])
    }

    public async update() {
        const repositories = await this.get_repos_from_github()
        const repos_with_languages = {} as { [key: string]: { [key: string]: number } }

        for (const repository of repositories) {
            const lang_usage = await this.get_language_usage_from_github(repository.name)
            repos_with_languages[repository.name] = lang_usage
        }

        const query_insert_repo = await db.prepare("INSERT INTO repo(name, owner_id) VALUES (?, ?) RETURNING id")
        const query_insert_language_usage = await db.prepare("INSERT INTO language_usage(language, usage, repo_id) VALUES (?, ?, ?)")

        await db.exec("BEGIN")
        try {
            await this.clear()
            for (const [repo, languages_usage] of Object.entries(repos_with_languages)) {
                const data_repo = await query_insert_repo.get([repo, this.id])
                const repo_id = data_repo.id

                for (const [language, usage] of Object.entries(languages_usage)) {
                    await query_insert_language_usage.run([language, usage, repo_id])
                }
            }

            await this.update_last_updated_at()
            await db.exec("COMMIT")
        } catch (err) {
            await db.exec("ROLLBACK")
            throw err
        }
    }

    public async get_full_languages_usage(tags: string[] = []) {
        let q_where_tags = ''
        if (tags.length > 0) {
            const tags_sql = tags.map(tag => `'${tag.trim()}'`).join(', ')
            q_where_tags = ` AND tags IN (${tags_sql})`
        }

        const sql = `SELECT lu.language, SUM(lu.usage) AS usage, la.*, owner_id
            FROM language_usage lu
            INNER JOIN language_data la ON la.name = lu.language
            INNER JOIN repo r ON r.id = lu.repo_id
            WHERE r.owner_id = ?
            ${q_where_tags}
            GROUP BY lu.language
            ORDER BY usage DESC;
            `

        const query = await db.prepare(sql)
        return await query.all(this.id) as {
            usage: number
        }[]
    }

    private async get_repos_from_github() {
        const res = await fetch(`https://api.github.com/users/${this.name}/repos`)
        if (!res.ok)
            throw new Error(`GitHub API error ${res.status}: ${res.statusText}`)
        
        const repositories = await res.json() as { name: string }[]
        if (!Array.isArray(repositories))
            throw new Error(`GitHub API unexpected response: ${JSON.stringify(repositories)}`)

        return repositories
    }

    private async get_language_usage_from_github(repo_name: string) {
        const res = await fetch(`https://api.github.com/repos/${this.name}/${repo_name}/languages`)
        if (!res.ok)
            throw new Error(`GitHub API error ${res.status}: ${res.statusText}`)

        return await res.json() as { [key: string]: number }
    }

    public static async get_by_name(name: string) {
        const query = await db.prepare("SELECT * FROM owner WHERE name = ?")
        const data = await query.get(name) as OwnerParams | null
        if (data == null)
            return null

        return new Owner(data)
    }

    public static async get(id: number) {
        const query = await db.prepare("SELECT * FROM owner WHERE id = ?")
        const data = await query.get(id) as OwnerParams | null
        if (data == null)
            return null

        return new Owner(data)
    }

    public static async insert(name: string) {
        const query = await db.prepare("INSERT INTO owner(name) VALUES (?) RETURNING id")
        const owner = await query.get(name)
        return owner.id as number
    }

    public static async get_or_insert(name: string): Promise<{ existed: boolean, owner: Owner }> {
        let owner = await Owner.get_by_name(name)

        if (owner)
            return { existed: true, owner }

        const owner_id = await Owner.insert(name)
        return { existed: false, owner: (await Owner.get(owner_id))! }
    }
}