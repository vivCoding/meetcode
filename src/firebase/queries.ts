import {
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from "firebase/firestore"

import initFirebase from "./connect"

import type { RoomModelType } from "@/types/room"

export async function getRoom(
  roomCode: string
): Promise<RoomModelType | undefined> {
  initFirebase()
  const roomSnap = await getDoc(doc(getFirestore(), "rooms", roomCode))
  const settingsSnap = await getDoc(doc(getFirestore(), "settings", roomCode))
  if (roomSnap.exists() && settingsSnap.exists()) {
    return {
      ...roomSnap.data(),
      roomSettings: settingsSnap.data(),
    } as RoomModelType
  }
  return undefined
}

export async function updateRoom(
  roomCode: string,
  newRoom: RoomModelType
): Promise<void> {
  initFirebase()
  await setDoc(doc(getFirestore(), "settings", roomCode), newRoom.roomSettings)
  const { roomSettings, ...room } = newRoom
  await setDoc(doc(getFirestore(), "rooms", roomCode), room)
}

export async function deleteRoom(roomCode: string): Promise<void> {
  const roomDoc = doc(getFirestore(), "rooms", roomCode)
  const snapDoc = doc(getFirestore(), "settings", roomCode)
  const roomSnap = await getDoc(roomDoc)
  const settingsSnap = await getDoc(snapDoc)
  if (roomSnap.exists() && settingsSnap.exists()) {
    await deleteDoc(roomDoc)
    await deleteDoc(snapDoc)
  }
}
