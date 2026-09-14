import { DEFAULT_CONNECTION_CONFIG } from '../Defaults/index.js';
import { makeCommunitiesSocket } from './communities.js';
import { makeInteropSocket } from './interop.js'
import { makePrivacySocket } from './privacy.js'
import { makeGraphQLSocket } from './graphql.js'
import { makeMessageBuilderSocket } from './message-builder.js'
import { resolveRealJid, resolveParticipantDisplayNumber } from '../Utils/jid-resolver.js'

// export the last socket layer
const makeWASocket = (config) => {
    const newConfig = {
        ...DEFAULT_CONNECTION_CONFIG,
        ...config
    };
    const satu = makeCommunitiesSocket(newConfig);
    const dua = makeInteropSocket(satu);
    const tiga = makePrivacySocket(dua);
    const empat = makeGraphQLSocket(tiga);
    const socket = makeMessageBuilderSocket(empat);

    // Application-level identity helpers. The wire/message key is intentionally
    // left untouched because WhatsApp may use @lid as the canonical identity.
    // Consumers can explicitly resolve an incoming LID to its phone JID when
    // they need a stable phone-number identity for commands, ownership checks,
    // display, mentions, or database records.
    socket.resolveRealJid = (raw, metadata = {}) => resolveRealJid(socket, raw, metadata);
    socket.resolveParticipantDisplayNumber = (raw, metadata = {}) => resolveParticipantDisplayNumber(socket, raw, metadata);

    return socket;
};
export default makeWASocket;
//# sourceMappingURL=index.js.map