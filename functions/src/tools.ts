
import { firestore } from 'firebase-admin'
import moment from 'moment'
import db from './firebase';
import { FirebaseRef, Vote } from './types'

export const updateVote = async (collectionRef: FirebaseRef, docRef: FirebaseRef, t: firestore.Transaction, vote: boolean, userId: string) => {
    const docVote = await t.get(docRef)
    const docComment = await t.get(collectionRef)
    const dataCollection = docComment.data() as { totalLikes: number }
    const increment = vote ? 1 : -1
    if (dataCollection.totalLikes < -12) {
        return 1
    }
    if (docVote.exists) {
        const data = docVote.data() as Vote
        if (data.vote == vote)
            return 0
        t.update(collectionRef, {
            likes: firestore.FieldValue.increment(increment),
            dislikes: firestore.FieldValue.increment(-increment),
            totalLikes: firestore.FieldValue.increment(increment * 2),
        });
        t.update(docRef, {
            vote,
            timestamp: moment()
        });
    } else {
        t.update(collectionRef, {
            likes: firestore.FieldValue.increment(vote ? 1 : 0),
            dislikes: firestore.FieldValue.increment(vote ? 0 : 1),
            totalLikes: firestore.FieldValue.increment(vote ? 1 : -1),
        });
        t.set(docRef, {
            userId,
            vote,
            timestamp: moment()
        })
    }
    return 0
}


export const deleteComment = async (collectionRef: FirebaseRef) => {
    const snapshot = await collectionRef.collection('votes').get()
    const batch = db.batch()
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    batch.delete(collectionRef);
    await batch.commit();
    return
}

export default [updateVote, deleteComment]
