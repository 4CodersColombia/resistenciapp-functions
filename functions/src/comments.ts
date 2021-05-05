
import * as functions from "firebase-functions"
import { firestore } from 'firebase-admin'
import moment from "moment";
import db from "./firebase";
import { deleteComment, updateVote } from "./tools";


/*
    Vote Comments Photos
*/

export const voteCommentPhoto = functions.https.onCall(async ({ vote, photoId, commentId }: { vote: boolean, photoId: string, commentId: string }, context) => {
    const userId = context.auth ? context.auth.uid : 'TEST'
    try {
        const refCollection = db.collection('photos').doc(photoId).collection('comments').doc(commentId)
        const refVote = refCollection.collection('votes').doc(userId)
        const update = await db.runTransaction(async (t) => {
            return updateVote(refCollection, refVote, t, vote, userId)
        });
        if (update === 1) {
            await deleteComment(refCollection)
        }
        return { res: 200, msg: 'Voto   Agregado', }
    } catch (error) {
        functions.logger.error(error)
        return { res: '400', msg: 'Error al agregar  Voto' }
    }
})


/*
    Comment Photos
*/


export const commentPhoto = functions.https.onCall(async ({ comment, photoId }: { comment: string, photoId: string }, context) => {
    const userId = context.auth ? context.auth.uid : 'TEST'
    const refPhoto = db.collection('photos').doc(photoId)
    try {
        if (comment.length <= 1)
            return { res: '400', msg: 'Error al agregar  Comentario' }
        const batch = db.batch()
        batch.update(refPhoto, { totalComments: firestore.FieldValue.increment(1) })
        batch.set(refPhoto.collection('comments').doc(), { comment, userId, timestamp: moment(), likes: 0, dislikes: 0, totalLikes: 0 })
        await batch.commit()
        return { res: 200, msg: 'Comentario  Agregado' }
    } catch (error) {
        functions.logger.error(error)
        return { res: '400', msg: 'Error al agregar  Comentario' }
    }
})

