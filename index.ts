import ejs from "ejs"
import { Owner } from "./database/owner"

const server = Bun.serve({
    idleTimeout: 120,
    routes: {
        "/:github_user": async req => {
            try {
                const github_user = req.params.github_user
                const url = new URL(req.url)
                const reload = !!url.searchParams.get("reload")
                
                const { existed, owner } = await Owner.get_or_insert(github_user)
                
                if (!existed || owner.should_reload() || reload)
                    owner.update()
                
                const tags_str = url.searchParams.get("tags") || ''
                const tags = tags_str.split(',').filter(str => !!str)
                owner.get_full_languages_usage(tags)

                const languages = await owner.get_full_languages_usage(tags)
                const total = languages.reduce((acc, language) => acc + language.usage, 0)

                const file = Bun.file('./sector_chart.ejs')
                const template_str = await file.text()
                const output_svg = ejs.render(template_str, { total, languages })

                return new Response(output_svg, { headers: { "Content-Type": "image/svg+xml" }})
            }
            catch (err) {
                if (err instanceof Error)
                    return Response.json({ message: err.message })

                return Response.json({ message: String(err) })
            }
        },
    }
})

console.log(`Server running at ${server.url}`);
