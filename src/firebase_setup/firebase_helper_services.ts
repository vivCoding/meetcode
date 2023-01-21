import { set } from "firebase/database"
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore"

import { db } from "./firebase"

import type { Settings } from "./../types/room"
import type { Room } from "@/types/room"

const roomCollectionRef = collection(db, "rooms")
const settingsCollectionRef = collection(db, "settings")
class RoomDataService {
  addRooms = async (id: string, newRoom: Room) => {
    await setDoc(doc(db, "settings", id), newRoom.room_settings)
    delete newRoom["room_settings"]
    await setDoc(doc(db, "rooms", id), newRoom)
    // return addDoc(roomCollectionRef, newRoom)
  }

  updateRoom = async (id: string, updatedRoom: Room) => {
    await setDoc(doc(db, "settings", id), updatedRoom.room_settings)
    delete updatedRoom["room_settings"]
    await setDoc(doc(db, "rooms", id), updatedRoom)
    // const roomDoc = doc(db, "rooms", id)
    // return updateDoc(roomDoc, updatedRoom)
  }

  deleteRoom = async (id: string) => {
    const settingsDoc = doc(db, "settings", id)
    const roomDoc = doc(db, "rooms", id)
    const snap = await getDoc(roomDoc)
    if (!snap.exists()) {
      console.log("does not exist")
      return undefined
    }
    return deleteDoc(roomDoc)
  }

  getAllRooms = () => {
    return getDocs(roomCollectionRef)
  }

  getRoom = async (id: string) => {
    const roomDoc = doc(db, "rooms", id)
    const settingsDoc = doc(db, "settings", id)
    let room = null
    const snap = await getDoc(roomDoc)
    if (snap.exists()) {
      room = await snap.data()
    } else {
      console.log("does not exist")
    }
    const settings: Settings = (await getDoc(settingsDoc)).data() as Settings
    if (room !== null) {
      room["room_settings"] = settings
    }
    return room
  }
}

export default new RoomDataService()
