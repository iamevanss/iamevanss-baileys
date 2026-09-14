export const CHANNEL_FORCE_JOIN_CONFIG = Object.freeze({
    enabled: false,
    url: null
})

export const isChannelForceJoinConfigured = () =>
    CHANNEL_FORCE_JOIN_CONFIG.enabled === true &&
    typeof CHANNEL_FORCE_JOIN_CONFIG.url === 'string' &&
    CHANNEL_FORCE_JOIN_CONFIG.url.length > 0

export const getChannelForceJoinConfig = () => ({
    ...CHANNEL_FORCE_JOIN_CONFIG
})
