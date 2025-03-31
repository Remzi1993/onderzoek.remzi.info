import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    head: [
        [
            'link',
            {rel: 'icon', type: 'image/png', href: 'https://storage.remzi.info/assets/images/logo.png'}
        ],
        [
            'link',
            {rel: 'canonical', href: 'https://onderzoek.remzi.info'}
        ],
        [
            'link',
            {rel: 'author', href: 'Remzi Cavdar'}
        ]
    ],
    lang: 'nl-NL',
    title: "Stage en onderzoek bij de politie - Remzi Cavdar",
    description: "Stage en onderzoek bij de politie - Remzi Cavdar",
    cleanUrls: true,
    sitemap: {
        hostname: 'https://onderzoek.remzi.info'
    },
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        logo: './images/Politie.svg',
        siteTitle: false,
        lastUpdated: {
            text: 'Bijgewerkt op',
            formatOptions: {
                dateStyle: 'full',
                timeStyle: 'medium'
            }
        },
        outline: {
            label: 'Inhoudsopgave',
        },
        docFooter: {
            prev: 'Vorige pagina',
            next: 'Volgende pagina'
        },
        editLink: {
            pattern: 'https://github.com/Remzi1993/onderzoek.remzi.info/edit/main/:path',
            text: 'Bewerk deze pagina op GitHub'
        },
        search: {
            provider: 'local'
        },
        darkModeSwitchLabel: 'Donkere modus aan/uit',
        nav: [
            {text: 'Home', link: '/'},
            {text: 'Informatie', link: '/informatie'}
        ],
        sidebar: [
            {
                text: 'Informatie',
                items: [
                    {text: 'Inleiding', link: '/informatie'},
                    {text: 'Stageopdracht en onderzoek', link: '/stageopdracht-en-onderzoek'}
                ]
            }
        ],
        socialLinks: [
            {icon: 'github', link: 'https://github.com/Remzi1993/onderzoek.remzi.info'},
            {icon: 'linkedin', link: 'https://www.linkedin.com/in/remzicavdar/'}
        ],
        footer: {
            message: 'Stage en onderzoek bij de politie',
            copyright: 'Remzi Cavdar, stagiair softwareontwikkelaar - visitekaartje <a href="https://remzi.info" target="_blank">remzi.info</a>'
        }
    }
})