
import { firestore } from "firebase-admin"
import { Moment } from "moment"

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

declare type Photo = {
    photoUrl: string
    comment: string
    geohash: string
    timestamp: Moment
    userId: string
    likes: number
    dislikes: number
    totalLikes: number
    totalComments: number
    disabled: boolean
}

declare type FirebaseRef = firestore.DocumentReference<firestore.DocumentData>