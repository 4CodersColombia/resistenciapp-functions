
import * as functions from "firebase-functions"
import moment from "moment";
import db from "./firebase";
import { updateVote } from "./tools";


const validURL = (str: string) => {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}
/**
 * @swagger
 * /createPhoto:
 *   post:
 *     description: Se crea una nueva foto
 *     produces:
 *       - application/json
 *     parameters:
 *       - photoUrl: photoUrl
 *         description: Direccion de la foto en el storage.
 *         in: formData
 *         required: true
 *         type: string
 *       - comment: password
 *         description: Comentario de la foto
 *         in: formData
 *         required: true
 *         type: string
 *       - geohash: string
 *         description: Geohash de la ubicacion.
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: success
 */
export const createPhoto = functions.https.onCall(async ({ photoUrl, comment, geohash }: { photoUrl: string, comment: string, geohash: string }, context) => {
    const userId = context.auth ? context.auth.uid : 'TEST'
    try {
        const photo = validURL(photoUrl)
        if (!photo || geohash.length <= 10)
            return { res: '400', msg: 'Error al agregar  Foto' }
        const refPhoto = db.collection('photos')
        await refPhoto.add({ photoUrl, comment, geohash, timestamp: moment(), userId, likes: 0, dislikes: 0, totalLikes: 0, comments: 0 })
        return { res: 200, msg: 'Foto agregada' }
    } catch (error) {
        functions.logger.error(error)
        return { res: '400', msg: 'Error al agregar  Foto' }
    }
})


/*
    Vote Photos
*/

export const votePhoto = functions.https.onCall(async ({ vote, photoId }: { vote: boolean, photoId: string }, context) => {
    const userId = context.auth ? context.auth.uid : 'TEST'
    try {
        await db.runTransaction(async (t) => {
            const refCollection = db.collection('photos').doc(photoId)
            const refVote = refCollection.collection('votes').doc(userId)
            return updateVote(refCollection, refVote, t, vote, userId)
        });
        return { res: 200, msg: 'Voto  Agregado' }
    } catch (error) {
        functions.logger.error(error)
        return { res: '400', msg: 'Error al agregar  Voto' }
    }
})
