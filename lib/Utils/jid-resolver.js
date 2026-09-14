import { isLidUser, isPnUser, jidNormalizedUser } from '../WABinary/index.js';

/**
 * Resolve a WhatsApp LID to its phone-number JID when a LID/PN mapping is
 * available in the socket's Signal repository.
 *
 * This intentionally does not rewrite message keys. Baileys keeps the wire
 * identity (often @lid) as the canonical message JID. Consumers can call
 * resolveRealJid() when they need a phone-number identity for display,
 * ownership checks, mentions, or other application-level logic.
 */
export async function resolveRealJid(sock, raw, metadata = {}) {
    let jid = typeof raw === 'string' ? raw : '';

    if (!jid) {
        jid = metadata?.jid || metadata?.id || metadata?.remoteJid || metadata?.participant || '';
    }

    if (!jid) {
        return { jid: '', phone: '', resolved: false };
    }

    jid = jidNormalizedUser(jid);

    // Prefer an explicit phone-number alternative supplied by WhatsApp.
    const alternatives = [
        metadata?.phoneNumber,
        metadata?.phone_number,
        metadata?.pn,
        metadata?.remoteJidAlt,
        metadata?.participantAlt,
        metadata?.alt,
        metadata?.jidAlt,
    ];

    if (isPnUser(jid)) {
        const phone = jid.split('@')[0].replace(/\D/g, '') || jid.split('@')[0];
        return { jid, phone, resolved: phone.length >= 7 };
    }

    if (isLidUser(jid)) {
        const mapping = sock?.signalRepository?.lidMapping;
        if (mapping?.getPNForLID) {
            try {
                const mapped = await mapping.getPNForLID(jid);
                if (mapped && isPnUser(mapped)) {
                    const resolvedJid = jidNormalizedUser(mapped);
                    const phone = resolvedJid.split('@')[0].replace(/\D/g, '') || resolvedJid.split('@')[0];
                    return { jid: resolvedJid, phone, resolved: phone.length >= 7, lid: jid };
                }
            }
            catch {
                // Fall through to explicit alternatives below.
            }
        }
    }

    for (const candidate of alternatives) {
        if (typeof candidate !== 'string' || !candidate) continue;
        const normalized = candidate.includes('@') ? jidNormalizedUser(candidate) : `${candidate.replace(/\D/g, '')}@s.whatsapp.net`;
        if (isPnUser(normalized)) {
            const phone = normalized.split('@')[0].replace(/\D/g, '') || normalized.split('@')[0];
            if (phone.length >= 7) {
                return { jid: normalized, phone, resolved: true, lid: isLidUser(jid) ? jid : undefined };
            }
        }
    }

    const phone = jid.split('@')[0].replace(/\D/g, '') || jid.split('@')[0];
    return { jid, phone, resolved: false };
}

export async function resolveParticipantDisplayNumber(sock, raw, metadata = {}) {
    const result = await resolveRealJid(sock, raw, metadata);
    return result.phone;
}

export const isResolvedPhoneJid = (jid) => typeof jid === 'string' && isPnUser(jid);
