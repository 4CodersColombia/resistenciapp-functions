
import * as functions from "firebase-functions"
import moment from "moment";
import db from "./firebase";
import { updateVote } from "./tools";
import { Photo } from "./types";
/*
Create Photo
*/

const validURL = (str: string) => {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}

export const createPhoto = functions.https.onCall(async ({ photoUrl, comment, geohash }: { photoUrl: string, comment: string, geohash: string }, context) => {
    const userId = context.auth ? context.auth.uid : 'TEST'
    try {
        const photo = validURL(photoUrl)
        if (!photo || geohash.length <= 10)
            return { res: '400', msg: 'Error al agregar  Foto' }
        const refPhoto = db.collection('photos')
        const photoData = { photoUrl, comment, geohash, timestamp: moment(), userId, likes: 0, dislikes: 0, totalLikes: 0, totalComments: 0, disabled: false } as Photo
        await refPhoto.add(photoData)
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
        const update = await db.runTransaction(async (t) => {
            const refCollection = db.collection('photos').doc(photoId)
            const refVote = refCollection.collection('votes').doc(userId)
            return updateVote(refCollection, refVote, t, vote, userId)
        });
        if (update === 1) {
            await db.collection('photos').doc(photoId).update({ disabled: true })
        }
        return { res: 200, msg: 'Voto  Agregado' }
    } catch (error) {
        functions.logger.error(error)
        return { res: '400', msg: 'Error al agregar  Voto' }
    }
})


/* Disabled Photos */

exports.disabledPhotos = functions.pubsub.schedule('every 60 minutes').onRun(async () => {
    //export const disabledPhoto = functions.https.onCall(async () => {
    const lastHours = moment().add(-1, 'day')
    console.log(moment().format(), lastHours.format())
    const photos = await db.collection('photos').where('disabled', '==', false).where('timestamp', '<=', lastHours).get()
    await photos.forEach((doc) => {
        try {
            doc.ref.update({ disabled: true })
        } catch (error) {
            functions.logger.error(error)
        }
    })
    return
});