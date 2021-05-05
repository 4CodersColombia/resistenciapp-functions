
import { firestore } from "firebase-admin"

declare type Suggestions = {
    suggestion: string,
    userId: string,
    timestamp: Date,
    likes: number,
    dislikes: number,
    totalLikes: number
}
declare type Vote = {
    timestamp: Date,
    userId: string,
    vote: boolean
}

declare type FirebaseRef = firestore.DocumentReference<firestore.DocumentData>