const Constants = module.exports;

//Colors the bot will use, mostly for embeds
Constants.Colors = {
    AQUA: 1752220,
    GREEN: 0x00FF00,
    ONLINE: 0x00FF00,
    SUCCESS: 0x00FF00,
    LIGHT_GREEN: 0x43B581,
    RESPONSE: 0x43B581,
    INFO: 3447003,
    BLUE: 3447003,
    PURPLE: 10181046,
    ORANGE: 15105570,
    YELLOW: 16776960,
    WARNING: 16776960,
    IDLE: 16776960,
    GREY: 9807270,
    NAVY: 3426654,
    DND: 0xFF0000,
    RED: 0xFF0000,
    ERROR: 0xFF0000,
    LIGHT_ORANGE: 0xE55B0A,
    SOFT_ERROR: 0xE55B0A,
    MISSING_PERMS: 0xFF0000,
    TWITCH: 0x6441A5,
    YOUTUBE: 0xFF0000,
    TWITTER: 0x1da1f2,
    OFFLINE: 0x808080
}

//Common emojis the bot will use
Constants.Emojis = {
    WARNING: "⚠️",
    ERROR: "❌",
    SUCCESS: "✅",
    WELCOME: "👋",
    KICK: "👟",
    BAN: "🔨",
    UNBAN: "🚪",
    MUTE: "🔇",
    DAY_TIME: "🌥️",
    NIGHT_TIME: "🌙",
    RAIN: "🌦️",
    SNOW: "🌨️",
    THUNDER: "⛈️",
    ONLINE: "🟢",
    IDLE: "🟡",
    DND: "🔴",
    OFFLINE: "⚫",
    GAME: "🎮",
    USER: "👤",
    USERS: "👥",
    PING: "🏓",
    NEWS: "📰",
    MONEY: "💵"
}

Constants.StatusText = {
    online: `${Constants.Emojis.ONLINE} Online`,
    idle: `${Constants.Emojis.IDLE} Idle`,
    offline: `${Constants.Emojis.OFFLINE} Offline`,
    dnd: `${Constants.Emojis.DND} Do Not Disturb`
}

Constants.PageEmojis = {
    START: "⏮️",
	BACK: "◀",
	STOP: "⏹",
    FORWARD: "▶",
    END: "⏭️"
};

Constants.CommandCategories = [
    {
        name: `bot`,
        long_name: `Bot`,
        description: `General bot commands, such \`ping\` and \`help\``,
        emoji: `🤖`
    },
    {
        name: `moderation`,
        long_name: `Moderation`,
        description: `Commands that help moderate the server.`,
        emoji: `🔨`
    },
    {
        name: `utility`,
        long_name: `Utility`,
        description: `Various utilies for different tasks.`,
        emoji: `🛠️`
    },
    {
        name: `media`,
        long_name: `Search & Media`,
        description: `Commands that use third-party APIs to retrieve media and other data.`,
        emoji: `🎬`
    },
    {
        name: `maintainer`,
        long_name: `Maintainer`,
        description: `Advanced maintainer commands.`,
        emoji: `❗`
    }
]

//Define API URLs here
Constants.APIs = {
    CAT: `http://aws.random.cat/meow`,
    TWITRSS: user => `http://twitrss.me/twitter_user_to_rss/?user=${encodeURIComponent(user)}`,
    REDDIT: subreddit => `https://www.reddit.com/r/${encodeURIComponent(subreddit)}.json`
}

Constants.Text = {
    MISSING_PERMS: svrName => `You don't have permission to run this command${svrName ? ` on ${svrName}` : ""}!`
}

Constants.GUILD_VERIFICATION_LEVELS = {
    NONE: `None`,
    LOW: `Low - must have verified email on account`,
    MEDIUM: `Medium - must be registered on Discord for longer than 5 minutes`,
    HIGH: `High - (╯°□°）╯︵ ┻━┻ - must be a member of the server for longer than 10 minutes`,
    VERY_HIGH: `Very High - ┻━┻ミヽ(ಠ益ಠ)ﾉ彡┻━┻ - must have a verified phone number`
}

Constants.EXPLICIT_CONTENT_FILTER_LEVELS = {
    DISABLED: `Disabled`,
    MEMBERS_WITHOUT_ROLES: `Scan media content from members without a role`,
    ALL_MEMBERS: `Scan media content from all members`
}

Constants.ImageURLOptions = {
    format: 'png',
    size: 2048
}

Constants.UserAgent = "Whistler Discord Bot by Kyle2000"

Constants.Utils = {
    wait: t => new Promise(y => setTimeout(y, t))
}