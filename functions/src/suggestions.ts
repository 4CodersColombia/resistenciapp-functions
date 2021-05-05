import * as functions from "firebase-functions"
import moment from "moment";
import db from "./firebase";
import { deleteComment, updateVote } from "./tools";



/*
    Create Suggestions
*/

export const newSuggestion = functions.https.onCall(async ({ suggestion }: { suggestion: string }, context) => {
    const userId = context.auth ? context.auth.uid : 'TEST'
    try {
        if (suggestion.length <= 1)
            return { res: '400', msg: 'Error al agregar  Comentario' }
        await db.collection('suggestions').add({ suggestion, userId, timestamp: moment(), likes: 0, dislikes: 0, totalLikes: 0 })
        return { res: 200, msg: 'Sugerencia Creada' }
    } catch (error) {
        functions.logger.error(error)
        return { res: '400', msg: 'Error al Crear  Sugerencia' }
    }
})



/*
    Vote Suggestions
*/
export const voteSuggestion = functions.https.onCall(async ({ suggestionId, vote }: { suggestionId: string, vote: boolean }, context) => {
    const userId = context.auth ? context.auth.uid : 'TEST'
    try {
        const refCollection = db.collection('suggestions').doc(suggestionId)
        const refVote = refCollection.collection('votes').doc(userId)
        const update = await db.runTransaction(async (t) => {
            return updateVote(refCollection, refVote, t, vote, userId)
        });
        if (update === 1) {
            await deleteComment(refCollection)
        }
        return { res: 200, msg: 'Voto Agregado / Actualizado' }
    } catch (error) {
        functions.logger.error(error)
        return { res: '400', msg: 'Error al Crear  Voto', data: JSON.stringify(error) }
    }
})
